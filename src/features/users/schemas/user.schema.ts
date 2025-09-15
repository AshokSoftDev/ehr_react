import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  );

export const createUserSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  fullName: z.string().min(1, 'Full name is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  phoneNumber: z.string().optional(),
  groupId: z.string().optional(),
  dob: z.string().optional(),
});

export const updateUserSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  fullName: z.string().min(1, 'Full name is required').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phoneNumber: z.string().optional(),
  groupId: z.string().optional(),
  userStatus: z.number().optional(),
  dob: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
