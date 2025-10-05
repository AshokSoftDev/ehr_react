import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form } from '../../../components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Label } from '../../../components/ui/label';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { FormFloatingInput } from '../../../components/form/form-floating-input';
import { FormFloatingSelect } from '../../../components/form/FormFloatingSelect';
import { doctorFormSchema, timeBlockValues, type DoctorFormData } from '../schemas/doctor.schema';
import type { Doctor } from '../types/doctor.types';

interface DoctorFormProps {
  doctor?: Doctor | null;
  onSubmit: (data: DoctorFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const titleOptions = ['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.'];
const specialties = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
];

export const DoctorForm: React.FC<DoctorFormProps> = ({ 
  doctor, 
  onSubmit, 
  onCancel,
  isLoading = false 
}) => {
  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: doctor ? {
      title: doctor.title,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      dob: doctor.dob.split('T')[0],
      email: doctor.email,
      licenceNo: doctor.licenceNo,
      degree: doctor.degree,
      specialty: doctor.specialty,
      timeBlock: (doctor.timeBlock as typeof timeBlockValues[number]) || undefined,
      displayName: doctor.displayName,
      displayColor: doctor.displayColor,
      address: doctor.address || '',
      area: doctor.area || '',
      city: doctor.city || '',
      state: doctor.state || '',
      country: doctor.country || '',
      pincode: doctor.pincode || '',
    } : {
      title: 'Dr.',
      displayColor: '#6366F1',
      displayName: '',
      firstName: '',
      lastName: '',
      dob: '',
      email: '',
      licenceNo: '',
      degree: '',
      specialty: '',
    },
  });

  // Auto-generate display name
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'firstName' || name === 'lastName' || name === 'title') {
        const displayName = `${value.title || ''} ${value.firstName || ''} ${value.lastName || ''}`.trim();
        if (displayName) {
          form.setValue('displayName', displayName);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = (data: DoctorFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="display">Display</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Basic personal details of the doctor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormFloatingSelect
                        control={form.control}
                        name="title"
                        label="Title"
                        options={titleOptions.map(title => ({
                          label: title,
                          value: title,
                        }))}
                      />

                      <FormFloatingInput
                        control={form.control}
                        name="firstName"
                        label="First Name"
                      />

                      <FormFloatingInput
                        control={form.control}
                        name="lastName"
                        label="Last Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormFloatingInput
                        control={form.control}
                        name="dob"
                        label="Date of Birth"
                        type="date"
                      />

                      <FormFloatingInput
                        control={form.control}
                        name="email"
                        label="Email Address"
                        type="email"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="professional" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                    <CardDescription>
                      Medical qualifications and professional details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormFloatingInput
                        control={form.control}
                        name="licenceNo"
                        label="License Number"
                      />

                      <FormFloatingInput
                        control={form.control}
                        name="degree"
                        label="Degree"
                        placeholder="MBBS, MD"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormFloatingSelect
                        control={form.control}
                        name="specialty"
                        label="Specialty"
                        options={specialties.map(specialty => ({
                          label: specialty,
                          value: specialty,
                        }))}
                      />

                      <FormFloatingSelect
                        control={form.control}
                        name="timeBlock"
                        label="Time Block"
                        options={[
                          { label: 'None', value: '' },
                          ...timeBlockValues.map(time => ({
                            label: time,
                            value: time,
                          })),
                        ]}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="address" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                    <CardDescription>
                      Doctor's practice or residence address
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormFloatingInput
                      control={form.control}
                      name="address"
                      label="Street Address"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormFloatingInput
                        control={form.control}
                        name="area"
                        label="Area"
                      />

                      <FormFloatingInput
                        control={form.control}
                        name="city"
                        label="City"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormFloatingInput
                        control={form.control}
                        name="state"
                        label="State"
                      />

                      <FormFloatingInput
                        control={form.control}
                        name="country"
                        label="Country"
                      />

                      <FormFloatingInput
                        control={form.control}
                        name="pincode"
                        label="Pincode"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="display" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>
                      How the doctor appears in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormFloatingInput
                      control={form.control}
                      name="displayName"
                      label="Display Name"
                    />

                    <div className="space-y-2">
                      <Label>Display Color</Label>
                      <div className="flex items-center gap-4">
                        <FormFloatingInput
                          control={form.control}
                          name="displayColor"
                          label="Color Code"
                          className="flex-1"
                        />
                        <input
                          type="color"
                          value={form.watch('displayColor')}
                          onChange={(e) => form.setValue('displayColor', e.target.value)}
                          className="w-20 h-[50px] rounded-md border cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                      <Label>Preview</Label>
                      <div className="mt-2 flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
                          style={{ backgroundColor: form.watch('displayColor') || '#6366F1' }}
                        >
                          {form.watch('firstName')?.[0]?.toUpperCase() || 'D'}
                          {form.watch('lastName')?.[0]?.toUpperCase() || 'D'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {form.watch('displayName') || 'Display Name'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {form.watch('specialty') || 'Specialty'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-background">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {doctor ? 'Update Doctor' : 'Create Doctor'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
