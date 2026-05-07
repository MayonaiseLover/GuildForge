import { BuildPlan, PlanChange } from "@guildforge/plan-schema";

export function applyPlanChanges(plan: BuildPlan, changes: PlanChange[]): BuildPlan {
  const newPlan: BuildPlan = JSON.parse(JSON.stringify(plan));

  for (const change of changes) {
    if (change.kind === "delete_channel") {
      newPlan.categories.forEach(c => {
        c.channels = c.channels.filter(ch => ch.key !== change.channelKey);
      });
    } else if (change.kind === "add_channel") {
      const category = newPlan.categories.find(c => c.name.toLowerCase() === change.category.toLowerCase() || c.key === change.category);
      if (category) {
        category.channels.push(change.channel as any);
      } else {
        newPlan.categories.push({
          key: change.category.toLowerCase().replace(/\s+/g, '_'),
          name: change.category,
          permissionOverwrites: [],
          channels: [change.channel as any]
        });
      }
    } else if (change.kind === "modify_channel") {
      newPlan.categories.forEach(c => {
        const idx = c.channels.findIndex(ch => ch.key === change.channelKey);
        if (idx !== -1) {
          c.channels[idx] = { ...c.channels[idx], ...change.changes } as any;
        }
      });
    } else if (change.kind === "delete_role") {
      newPlan.roles = newPlan.roles.filter(r => r.key !== change.roleKey);
    } else if (change.kind === "add_role") {
      newPlan.roles.push(change.role as any);
    } else if (change.kind === "modify_role") {
      const idx = newPlan.roles.findIndex(r => r.key === change.roleKey);
      if (idx !== -1) {
        newPlan.roles[idx] = { ...newPlan.roles[idx], ...change.changes } as any;
      }
    } else if (change.kind === "delete_category") {
      newPlan.categories = newPlan.categories.filter(c => c.key !== change.categoryKey);
    } else if (change.kind === "add_category") {
      newPlan.categories.push(change.category as any);
    } else if (change.kind === "modify_server_settings") {
      newPlan.serverSettings = { ...newPlan.serverSettings, ...change.changes } as any;
    } else if (change.kind === "add_post_build_action") {
      newPlan.postBuildActions.push(change.action as any);
    } else if (change.kind === "full_rebuild") {
      return change.plan as BuildPlan;
    }
  }

  return newPlan;
}
