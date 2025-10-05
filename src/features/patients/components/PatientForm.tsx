import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { FormFloatingSelect } from '@/components/form/FormFloatingSelect';
import { FormFloatingDatePicker } from '@/components/form/FormFloatingDatePicker';
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
      dateOfBirth: patient.dateOfBirth.split('T')[0],
    } : {
      title: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      age: 0,
      gender: '',
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col">
        <Tabs defaultValue="personal" className="flex-1 flex flex-col overflow-y-hidden">
            <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="address">Contact & Address</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="personal" className="flex-1 overflow-y-auto p-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Basic personal details of the patient.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormFloatingSelect
                        control={form.control}
                        name="title"
                        label="Title"
                        options={titleOptions.map(title => ({ label: title, value: title }))}
                      />
                      <FormFloatingInput control={form.control} name="firstName" label="First Name" />
                      <FormFloatingInput control={form.control} name="lastName" label="Last Name" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <FormFloatingDatePicker control={form.control} name="dateOfBirth" label="Date of Birth" />
                      <FormFloatingInput control={form.control} name="age" label="Age" type="number" />
                      <FormFloatingSelect
                        control={form.control}
                        name="gender"
                        label="Gender"
                        options={genderOptions.map(gender => ({ label: gender, value: gender }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="address" className="flex-1 max-h-[65vh] overflow-y-auto p-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact & Address</CardTitle>
                    <CardDescription>Patient's contact and address information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormFloatingInput control={form.control} name="mobileNumber" label="Mobile Number" />
                      <FormFloatingInput control={form.control} name="aadhar" label="Aadhar Number" />
                    </div>
                    <FormFloatingInput control={form.control} name="address" label="Street Address" />
                    <div className="grid grid-cols-2 gap-4">
                      <FormFloatingInput control={form.control} name="area" label="Area" />
                      <FormFloatingInput control={form.control} name="city" label="City" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <FormFloatingInput control={form.control} name="state" label="State" />
                      <FormFloatingInput control={form.control} name="country" label="Country" />
                      <FormFloatingInput control={form.control} name="pincode" label="Pincode" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Other Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormFloatingInput control={form.control} name="referalSource" label="Referral Source" />
                    <FormFloatingInput control={form.control} name="comments" label="Comments" />
                  </CardContent>
                </Card>
              </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-background">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {patient ? 'Update Patient' : 'Create Patient'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
