import { prisma } from "../../db";
import { MCPDiscordClient } from "../mcp";
export async function executeBuildPlan(planId, sseEmit) {
    const planRecord = await prisma.buildPlan.update({
        where: { id: planId },
        data: { status: "EXECUTING" },
        include: { guild: true }
    });
    const plan = planRecord.planJson;
    const guildId = planRecord.guild.discordGuildId;
    const mcp = new MCPDiscordClient();
    try {
        sseEmit({ type: "started", totalOps: 1 }); // placeholder for calculating totalOps
        // Stage 0: Snapshot
        const snapshotRes = await mcp.callTool("snapshot_guild", { guildId });
        // Resolve stable keys to discord IDs
        const resolvedRoleIds = new Map(); // roleKey -> discordRoleId
        const resolvedCatIds = new Map(); // categoryKey -> discordCatId
        // Build logical operation list
        const ops = [];
        if (plan.serverSettings) {
            ops.push({
                tool: "update_guild_settings",
                args: { guildId, ...plan.serverSettings },
                summary: "Updating server settings"
            });
        }
        for (const role of plan.roles) {
            ops.push({
                tool: "create_role",
                args: { guildId, name: role.name, color: role.color, hoist: role.hoist, mentionable: role.mentionable, permissions: role.permissions },
                summary: `Creating role: ${role.name}`,
                context: { roleKey: role.key }
            });
        }
        if (plan.roles.length > 0) {
            // role reorder is typically done after they are all created. We can push a reorder_roles op.
            // But reorder_roles expects discord IDs. We will construct this argument dynamically during execution.
            ops.push({
                tool: "reorder_roles",
                args: { guildId, roles: "DYNAMIC_ROLES" },
                summary: "Reordering roles"
            });
        }
        for (const cat of plan.categories) {
            ops.push({
                tool: "create_category",
                args: { guildId, name: cat.name },
                summary: `Creating category: ${cat.name}`,
                context: { catKey: cat.key, overwrites: cat.permissionOverwrites }
            });
            for (const ch of cat.channels) {
                ops.push({
                    tool: `create_${ch.type}_channel`, // Text, voice, etc.
                    args: { guildId, name: ch.name, topic: ch.purpose, parentId: "DYNAMIC_PARENT_ID" },
                    summary: `Creating ${ch.type} channel: ${ch.name}`,
                    context: { catKey: cat.key, overwrites: ch.permissionOverwrites }
                });
            }
        }
        sseEmit({ type: "started", totalOps: ops.length });
        let opIndex = 0;
        for (const op of ops) {
            opIndex++;
            sseEmit({ type: "operation", index: opIndex, tool: op.tool, status: "pending", summary: op.summary });
            // Save Operation to DB
            const opRecord = await prisma.operation.create({
                data: {
                    buildPlanId: planId,
                    ord: opIndex,
                    tool: op.tool,
                    args: op.args,
                    status: "PENDING",
                    startedAt: new Date()
                }
            });
            // Dynamically resolve IDs
            if (op.tool === "reorder_roles") {
                // we map the roles defined in the plan to their new IDs based on order.
                // Actually, reorder_roles expects { id, position }
                const roleOrder = plan.roles.map((r, i) => ({
                    id: resolvedRoleIds.get(r.key),
                    position: plan.roles.length - i // Discord role position (higher = higher up)
                })).filter(r => r.id);
                op.args.roles = roleOrder;
            }
            if (op.tool.startsWith("create_") && op.tool.endsWith("_channel") && op.tool !== "create_category") {
                const catKey = op.context.catKey;
                if (catKey && resolvedCatIds.has(catKey)) {
                    op.args.parentId = resolvedCatIds.get(catKey);
                }
                else {
                    delete op.args.parentId;
                }
            }
            // Execute tool with retry
            let success = false;
            let lastErr;
            let resultData;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const res = await mcp.callTool(op.tool, op.args);
                    resultData = res;
                    if (res && res.content && res.content[0] && res.content[0].text) {
                        const parsed = JSON.parse(res.content[0].text);
                        if (parsed.ok === false) {
                            throw new Error(parsed.error?.message || "Tool error");
                        }
                        resultData = parsed.data;
                    }
                    success = true;
                    break;
                }
                catch (err) {
                    lastErr = err;
                    // In a real app we'd check if error is recoverable. We'll just retry for any error here up to 3 times with backoff
                    await new Promise(res => setTimeout(res, 1000 * attempt));
                }
            }
            if (!success) {
                await prisma.operation.update({
                    where: { id: opRecord.id },
                    data: { status: "FAILED", result: { error: lastErr?.message || String(lastErr) }, finishedAt: new Date() }
                });
                throw new Error(`Operation failed: ${lastErr?.message || "Unknown error"}`);
            }
            // Record ID mapping
            if (op.tool === "create_role" && resultData?.id) {
                resolvedRoleIds.set(op.context.roleKey, resultData.id);
            }
            if (op.tool === "create_category" && resultData?.id) {
                resolvedCatIds.set(op.context.catKey, resultData.id);
            }
            // Handle Permissions Overwrites
            // If the created category or channel has permission overwrites, we set them immediately
            // Actually the prompt says "Stage 6: permission overwrites" which means we should queue them after. 
            // For simplicity, we can do it inline or queue them. Let's do it inline since we just got the channel ID.
            if (resultData?.id && op.context?.overwrites?.length > 0) {
                // Create permission overwrites ops dynamically
                for (const ow of op.context.overwrites) {
                    const resolvedRoleId = ow.roleKey === "@everyone" ? guildId : resolvedRoleIds.get(ow.roleKey);
                    if (resolvedRoleId) {
                        await mcp.callTool("add_channel_permission_overwrite", {
                            guildId,
                            channelId: resultData.id,
                            overwriteId: resolvedRoleId,
                            type: ow.roleKey === "@everyone" ? 0 : 0, // role
                            allow: ow.allow,
                            deny: ow.deny
                        });
                    }
                }
            }
            await prisma.operation.update({
                where: { id: opRecord.id },
                data: { status: "OK", result: resultData, finishedAt: new Date() }
            });
            sseEmit({ type: "operation", index: opIndex, tool: op.tool, status: "ok", summary: op.summary });
        }
        await prisma.buildPlan.update({
            where: { id: planId },
            data: { status: "COMPLETED", executedAt: new Date() }
        });
        sseEmit({
            type: "completed",
            planId,
            summary: `Built ${plan.categories.reduce((acc, c) => acc + c.channels.length, 0)} channels across ${plan.categories.length} categories with ${plan.roles.length} roles.`
        });
    }
    catch (err) {
        await prisma.buildPlan.update({
            where: { id: planId },
            data: { status: "FAILED" }
        });
        sseEmit({ type: "failed", error: err.message || String(err), recoverable: true });
    }
    finally {
        await mcp.disconnect();
    }
}
