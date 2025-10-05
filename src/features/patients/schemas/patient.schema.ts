import { z } from 'zod';

export const patientSchema = z.object({
  patient_id: z.number(),
  mrn: z.string(),
  title: z.string().min(1, 'Title is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string(),
  age: z.number(),
  gender: z.string().min(1, 'Gender is required'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Invalid mobile number'),
  address: z.string().min(1, 'Address is required'),
  area: z.string().min(1, 'Area is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  aadhar: z.string().optional(),
  referalSource: z.string().optional(),
  comments: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;
