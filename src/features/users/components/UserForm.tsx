import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Button } from '../../../components/ui/button';
import { Form } from '../../../components/ui/form';
import { FormFloatingInput } from '../../../components/form/form-floating-input';
import { FormSearchSelectWithCreate } from '../../../components/form/FormSearchSelectWithCreate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Loader2, Calendar } from 'lucide-react';
import { createUserSchema, updateUserSchema, type UpdateUserInput } from '../schemas/user.schema';
import type { User } from '../types/user.types';
import { useGroups } from '../../groups/hooks/useGroups';
import { FormSheetContext } from '../../../contexts/FormSheetContext/index';
import { format } from 'date-fns';
import type { CreateUserFormData, UpdateUserFormData } from '../../shared/types/form.types';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData) => Promise<void>;
}

export const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  user,
  onSubmit,
}) => {
  const formSheetContext = useContext(FormSheetContext);
  const { data: groupsData } = useGroups({
    page: 1,
    limit: 10,
    search: ""
  });

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(user ? updateUserSchema : createUserSchema),
    defaultValues: {
      title: '',
      fullName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      groupId: '',
      dob: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        title: user.title,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        groupId: user.groupId || '',
        userStatus: user.userStatus,
        dob: user.dob ? format(new Date(user.dob), 'yyyy-MM-dd') : '',
      });
    } else {
      form.reset({
        title: '',
        fullName: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        groupId: '',
        dob: '',
      });
    }
  }, [user, form]);

  const handleSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      if (!user && 'password' in data && !data.password) {
        form.setError('password', { message: 'Password is required for new users' });
        return;
      }

      // Process the data
      const submitData = { ...data };

      // Convert date to ISO format if it exists, otherwise set to undefined
      if (submitData.dob) {
        // If dob is not empty, convert to ISO string
        const dateValue = new Date(submitData.dob);
        if (!isNaN(dateValue.getTime())) {
          submitData.dob = dateValue.toISOString();
        } else {
          // If invalid date, remove it
          delete submitData.dob;
        }
      } else {
        // If empty string or null, remove from object
        delete submitData.dob;
      }

      // Remove password for updates if it's empty
      if (user && 'password' in submitData && !submitData.password) {
        delete (submitData as Record<string, unknown>).password;
      }

      // Remove empty optional fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key as keyof typeof submitData] === '') {
          delete submitData[key as keyof typeof submitData];
        }
      });

      await onSubmit(submitData);
      onClose();
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const groupOptions = ((groupsData as { data: { groups: Array<{ id: string; name: string }> } })?.data.groups || []).map(group => ({
    label: group.name,
    value: group.id,
  }));

  const titleOptions = [
    { label: 'Mr', value: 'Mr' },
    { label: 'Mrs', value: 'Mrs' },
    { label: 'Ms', value: 'Ms' },
    { label: 'Dr', value: 'Dr' },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{user ? 'Edit User' : 'Create New User'}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="text-sm font-medium">Title</label>
                <Select
                  value={form.watch('title')}
                  onValueChange={(value) => form.setValue('title', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Title" />
                  </SelectTrigger>
                  <SelectContent>
                    {titleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              
              <div className="col-span-3">
                <FormFloatingInput
                  control={form.control}
                  name="fullName"
                  label="Full Name"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormFloatingInput
                control={form.control}
                name="firstName"
                label="First Name"
                placeholder="Enter first name"
              />

              <FormFloatingInput
                control={form.control}
                name="lastName"
                label="Last Name"
                placeholder="Enter last name"
              />
            </div>

            <FormFloatingInput
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="Enter email"
              disabled={!!user}
            />

            {!user && (
              <FormFloatingInput
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="Enter password"
              />
            )}

            <FormFloatingInput
              control={form.control}
              name="phoneNumber"
              label="Phone Number (Optional)"
              type="tel"
              placeholder="Enter phone number"
            />

            <FormSearchSelectWithCreate
              control={form.control}
              name="groupId"
              label="Group"
              options={groupOptions}
              placeholder="Search groups..."
              emptyText="No groups found"
              createButtonText="Create Group"
              showCreateButton={true}
              onCreateClick={() => {
                formSheetContext?.openSheet('group');
              }}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth (Optional)</label>
              <div className="relative">
                <input
                  type="date"
                  {...form.register('dob')}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              {form.formState.errors.dob && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.dob.message}
                </p>
              )}
            </div>

            {user && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={form.watch('userStatus')?.toString() || '1'}
                  onValueChange={(value) => form.setValue('userStatus' as keyof UpdateUserInput, parseInt(value) as never)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {user ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{user ? 'Update User' : 'Create User'}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
