export function validatePlan(plan) {
    const issues = [];
    const roleKeys = new Set(plan.roles.map(r => r.key));
    if (plan.roles.length > 250) {
        issues.push("Discord allows a maximum of 250 roles.");
    }
    for (const cat of plan.categories) {
        if (cat.channels.length > 50) {
            issues.push(`Category ${cat.key} has more than 50 channels.`);
        }
        const channelNames = new Set();
        for (const ch of cat.channels) {
            if (channelNames.has(ch.name)) {
                issues.push(`Duplicate channel name ${ch.name} in category ${cat.key}.`);
            }
            channelNames.add(ch.name);
            if (ch.permissionOverwrites) {
                for (const ow of ch.permissionOverwrites) {
                    if (!roleKeys.has(ow.roleKey) && ow.roleKey !== "@everyone") {
                        issues.push(`Channel ${ch.key} references unknown roleKey ${ow.roleKey}.`);
                    }
                }
            }
        }
        for (const ow of cat.permissionOverwrites) {
            if (!roleKeys.has(ow.roleKey) && ow.roleKey !== "@everyone") {
                issues.push(`Category ${cat.key} references unknown roleKey ${ow.roleKey}.`);
            }
        }
    }
    return issues;
}
