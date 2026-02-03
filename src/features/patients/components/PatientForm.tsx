import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User, MapPin, FileText } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import { FormFloatingInput } from '@/components/form/form-floating-input';
import { FormFloatingSelect } from '@/components/form/FormFloatingSelect';
import { FormFloatingDatePicker } from '@/components/form/FormFloatingDatePicker';
import { FormFloatingTextarea } from '@/components/form/form-floating-textarea';
import { patientSchema, type PatientFormData } from '../schemas/patient.schema';
import type { Patient } from '../types/patient.types';

interface PatientFormProps {
  patient?: Patient | null;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const titleOptions = ['Mr.', 'Ms.', 'Mrs.', 'Miss', 'Master'];
const genderOptions = ['Male', 'Female', 'Other'];

export const PatientForm: React.FC<PatientFormProps> = ({ patient, onSubmit, onCancel, isLoading = false }) => {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient ? {
      ...patient,
      dateOfBirth: patient.dateOfBirth?.split('T')[0],
    } : {
      title: 'Mr.',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      age: 20,
      gender: 'Male',
      mobileNumber: '',
      address: '',
      area: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      aadhar: '',
      referalSource: '',
      comments: '',
    },
  });

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'dateOfBirth') {
        const dob = value.dateOfBirth;
        if (dob) {
          const age = differenceInYears(new Date(), new Date(dob));
          form.setValue('age', age);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = (data: PatientFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-5">
            {/* Personal Information Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Personal Information</h3>
                  <p className="text-xs text-muted-foreground">Basic patient details</p>
                </div>
              </div>
              <div className="flex gap-3">
                <FormFloatingSelect
                  control={form.control}
                  name="title"
                  label="Title"
                  required
                  className="w-24"
                  options={titleOptions.map(title => ({ label: title, value: title }))}
                />
                <FormFloatingInput control={form.control} name="firstName" label="First Name" required className="flex-1" />
                <FormFloatingInput control={form.control} name="lastName" label="Last Name" required className="flex-1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormFloatingDatePicker 
                  control={form.control} 
                  name="dateOfBirth" 
                  label="Date of Birth" 
                  required 
                  toDate={new Date()} // Disable future dates
                />
                <FormFloatingInput control={form.control} name="age" label="Age" type="number" />
                <FormFloatingSelect
                  control={form.control}
                  name="gender"
                  label="Gender"
                  required
                  options={genderOptions.map(gender => ({ label: gender, value: gender }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormFloatingInput 
                  control={form.control} 
                  name="mobileNumber" 
                  label="Mobile Number" 
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                />
                <FormFloatingInput 
                  control={form.control} 
                  name="aadhar" 
                  label="Aadhar Number"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                />
              </div>
            </div>

            {/* Contact & Address Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Address Details</h3>
                  <p className="text-xs text-muted-foreground">Where the patient resides</p>
                </div>
              </div>
              <FormFloatingInput control={form.control} name="address" label="Street Address" required />
              <div className="grid grid-cols-2 gap-3">
                <FormFloatingInput control={form.control} name="area" label="Area / Locality" required />
                <FormFloatingInput control={form.control} name="city" label="City" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormFloatingInput control={form.control} name="state" label="State" required />
                <FormFloatingInput control={form.control} name="country" label="Country" required />
                <FormFloatingInput 
                  control={form.control} 
                  name="pincode" 
                  label="Pincode" 
                  required 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                />
              </div>
            </div>

            {/* Other Information Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Additional Information</h3>
                  <p className="text-xs text-muted-foreground">Referral and notes</p>
                </div>
              </div>
              <FormFloatingInput control={form.control} name="referalSource" label="Referral Source" />
              <FormFloatingTextarea 
                control={form.control} 
                name="comments" 
                label="Comments / Notes"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="flex justify-end gap-3 px-5 py-3 border-t bg-background shrink-0">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel} 
            disabled={isLoading}
            className="btn-cancel"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {patient ? 'Update Patient' : 'Create Patient'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
