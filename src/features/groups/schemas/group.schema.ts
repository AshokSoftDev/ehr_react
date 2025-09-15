import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

export const updateGroupPermissionsSchema = z.object({
  permissions: z.array(z.object({
    moduleId: z.string().uuid(),
    hasAccess: z.boolean(),
    subModules: z.array(z.object({
      subModuleId: z.string().uuid(),
      allowed: z.boolean(),
    })),
  })),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type UpdateGroupPermissionsInput = z.infer<typeof updateGroupPermissionsSchema>;
