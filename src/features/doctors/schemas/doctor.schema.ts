import { z } from 'zod';

export const timeBlockValues = ['5min', '10min', '15min', '20min', '25min', '30min', '1hr', '1.5hr', '2hr', '3hr'] as const;

export const doctorFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email address'),
  licenceNo: z.string().min(1, 'Licence number is required'),
  degree: z.string().min(1, 'Degree is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  timeBlock: z.enum(timeBlockValues).optional(),
  displayName: z.string().min(1, 'Display name is required'),
  displayColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
  address: z.string().optional(),
  area: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
});

export type DoctorFormData = z.infer<typeof doctorFormSchema>;

export const doctorFilterSchema = z.object({
  search: z.string().optional(),
  specialty: z.string().optional(),
  status: z.number().optional(),
  email: z.string().optional(),
  licenceNo: z.string().optional(),
});
