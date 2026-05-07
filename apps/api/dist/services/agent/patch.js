export function applyPlanChanges(plan, changes) {
    const newPlan = JSON.parse(JSON.stringify(plan));
    for (const change of changes) {
        if (change.kind === "delete_channel") {
            newPlan.categories.forEach(c => {
                c.channels = c.channels.filter(ch => ch.key !== change.channelKey);
            });
        }
        else if (change.kind === "add_channel") {
            const category = newPlan.categories.find(c => c.name.toLowerCase() === change.category.toLowerCase() || c.key === change.category);
            if (category) {
                category.channels.push(change.channel);
            }
            else {
                newPlan.categories.push({
                    key: change.category.toLowerCase().replace(/\s+/g, '_'),
                    name: change.category,
                    permissionOverwrites: [],
                    channels: [change.channel]
                });
            }
        }
        else if (change.kind === "modify_channel") {
            newPlan.categories.forEach(c => {
                const idx = c.channels.findIndex(ch => ch.key === change.channelKey);
                if (idx !== -1) {
                    c.channels[idx] = { ...c.channels[idx], ...change.changes };
                }
            });
        }
        else if (change.kind === "delete_role") {
            newPlan.roles = newPlan.roles.filter(r => r.key !== change.roleKey);
        }
        else if (change.kind === "add_role") {
            newPlan.roles.push(change.role);
        }
        else if (change.kind === "modify_role") {
            const idx = newPlan.roles.findIndex(r => r.key === change.roleKey);
            if (idx !== -1) {
                newPlan.roles[idx] = { ...newPlan.roles[idx], ...change.changes };
            }
        }
        else if (change.kind === "delete_category") {
            newPlan.categories = newPlan.categories.filter(c => c.key !== change.categoryKey);
        }
        else if (change.kind === "add_category") {
            newPlan.categories.push(change.category);
        }
        else if (change.kind === "modify_server_settings") {
            newPlan.serverSettings = { ...newPlan.serverSettings, ...change.changes };
        }
        else if (change.kind === "add_post_build_action") {
            newPlan.postBuildActions.push(change.action);
        }
        else if (change.kind === "full_rebuild") {
            return change.plan;
        }
    }
    return newPlan;
}
