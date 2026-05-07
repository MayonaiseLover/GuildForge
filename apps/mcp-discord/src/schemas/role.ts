import { z } from "zod";
import { PermissionFlagsSchema } from "./permission.js";

export const CreateRoleInput = z.object({
  guildId: z.string(),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  hoist: z.boolean().optional(),
  mentionable: z.boolean().optional(),
  permissions: z.array(PermissionFlagsSchema).optional(),
  position: z.number().int().optional(),
});

export const UpdateRoleInput = z.object({
  roleId: z.string(),
  partial: z.object({
    name: z.string().min(1).max(100).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
    hoist: z.boolean().optional(),
    mentionable: z.boolean().optional(),
    permissions: z.array(PermissionFlagsSchema).optional(),
    position: z.number().int().optional(),
  })
});

export const DeleteRoleInput = z.object({
  roleId: z.string(),
  reason: z.string().optional()
});

export const ReorderRolesInput = z.object({
  guildId: z.string(),
  orderedRoleIds: z.array(z.string())
});

export const AssignRoleToMemberInput = z.object({
  guildId: z.string(),
  memberId: z.string(),
  roleId: z.string()
});

export const ListRolesInput = z.object({
  guildId: z.string()
});
