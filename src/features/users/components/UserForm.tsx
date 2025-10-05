import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Button } from '../../../components/ui/button';
import { Form } from '../../../components/ui/form';
import { FormFloatingInput } from '../../../components/form/form-floating-input';
import { FormFloatingSelect } from '../../../components/form/form-floating-select';
import { FormSearchSelectWithCreate } from '../../../components/form/FormSearchSelectWithCreate';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Calendar } from '../../../components/ui/calendar';
import { Loader2, CalendarIcon, User2, Mail, Phone, Shield, UserCheck } from 'lucide-react';
import { createUserSchema, updateUserSchema, type UpdateUserInput } from '../schemas/user.schema';
import type { User } from '../types/user.types';
import { useGroups } from '../../groups/hooks/useGroups';
import { FormSheetContext } from '../../../contexts/FormSheetContext/index';
import { format } from 'date-fns';
import type { CreateUserFormData, UpdateUserFormData } from '../../shared/types/form.types';
import { cn } from '../../../lib/utils';

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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { data: groupsData } = useGroups({
    page: 1,
    limit: 100,
    search: ""
  });

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(user ? updateUserSchema : createUserSchema),
    defaultValues: {
      title: 'Mr',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      groupId: '',
      dob: '',
    },
  });

  // Watch firstName and lastName to auto-generate fullName
  const firstName = form.watch('firstName');
  const lastName = form.watch('lastName');
  const dobValue = form.watch('dob');

  useEffect(() => {
    if (user) {
      console.log(user);
      
      form.reset({
        title: user.title,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        groupId: user.groupId || '',
        userStatus: user.userStatus.toString(),
        dob: user.dob ? format(new Date(user.dob), 'yyyy-MM-dd') : '',
      });
    } else {
      form.reset({
        title: 'Mr',
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
      const submitData: any = { 
        ...data,
        // Auto-generate fullName from firstName and lastName
        fullName: `${data.firstName} ${data.lastName}`.trim()
      };

      // Convert date to ISO format if it exists
      if (submitData.dob) {
        const dateValue = new Date(submitData.dob);
        if (!isNaN(dateValue.getTime())) {
          submitData.dob = dateValue.toISOString();
        } else {
          delete submitData.dob;
        }
      } else {
        delete submitData.dob;
      }

      // Remove password for updates if it's empty
      if (user && 'password' in submitData && !submitData.password) {
        delete submitData.password;
      }

      // Remove empty optional fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          delete submitData[key];
        }
      });

      await onSubmit(submitData);
      onClose();
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    setCalendarOpen(false);
    onClose();
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

  const statusOptions = [
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '0' },
  ];

  return (
    <Sheet 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <SheetContent 
        className="w-full sm:max-w-lg p-0 flex flex-col h-full gap-0"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{user ? 'Edit User' : 'Create New User'}</SheetTitle>
        </SheetHeader>
        
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-background to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {user ? 'Edit User' : 'Create New User'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user ? 'Update user information' : 'Add a new user to the system'}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="px-6 py-4 space-y-5">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <User2 className="h-3.5 w-3.5" />
                    <span>Personal Information</span>
                  </div>

                  {/* Title and Name Row */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3">
                      <FormFloatingSelect
                        control={form.control}
                        name="title"
                        label="Title"
                        options={titleOptions}
                        triggerClassName="bg-background/50"
                      />
                    </div>
                    
                    <div className="col-span-4">
                      <FormFloatingInput
                        control={form.control}
                        name="firstName"
                        label="First Name"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="col-span-5">
                      <FormFloatingInput
                        control={form.control}
                        name="lastName"
                        label="Last Name"
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  {/* Date of Birth with Calendar */}
                  <div className="relative group">
                    <label className={cn(
                      "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
                      "transition-all duration-200",
                      "bg-background top-0 -translate-y-1/2 text-xs"
                    )}>
                      Date of Birth (Optional)
                    </label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal pt-3 pb-2",
                            "bg-background/50 hover:bg-background/80",
                            !dobValue && "text-muted-foreground",
                            form.formState.errors.dob && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dobValue ? format(new Date(dobValue), "dd/MM/yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 z-[9999]" 
                        align="start"
                        sideOffset={5}
                        side="bottom"
                      >
                        <Calendar
                          mode="single"
                          selected={dobValue ? new Date(dobValue) : undefined}
                          onSelect={(date) => {
                            form.setValue('dob', date ? format(date, 'yyyy-MM-dd') : '');
                            setCalendarOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.dob && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.dob.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Contact Information</span>
                  </div>

                  <div className="space-y-3">
                    <FormFloatingInput
                      control={form.control}
                      name="email"
                      label="Email Address"
                      type="email"
                      disabled={!!user}
                      className={cn(
                        "bg-background/50",
                        user && "opacity-70"
                      )}
                      inputClassName={cn(
                        user && "cursor-not-allowed"
                      )}
                    />

                    <FormFloatingInput
                      control={form.control}
                      name="phoneNumber"
                      label="Phone Number (Optional)"
                      type="tel"
                      className="bg-background/50"
                    />
                  </div>
                </div>

                {/* Security Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Security & Access</span>
                  </div>

                  <div className="space-y-3">
                    {!user && (
                      <FormFloatingInput
                        control={form.control}
                        name="password"
                        label="Password"
                        type="password"
                        className="bg-background/50"
                      />
                    )}

                    <FormSearchSelectWithCreate
                      control={form.control}
                      name="groupId"
                      label="User Group (Optional)"
                      options={groupOptions}
                      placeholder="Search groups..."
                      emptyText="No groups found"
                      createButtonText="Create Group"
                      showCreateButton={true}
                      onCreateClick={() => {
                        formSheetContext?.openSheet('group');
                      }}
                      className="bg-background/50"
                    />

                    {user && (
                      <FormFloatingSelect
                        control={form.control}
                        name="userStatus"
                        label="Status"
                        options={statusOptions}
                        triggerClassName={cn(
                          "bg-background/50",
                          form.watch('userStatus')?.toString() === '1' 
                            ? "border-green-500/30" 
                            : "border-destructive/30"
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* User Info Display */}
                {firstName && lastName && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Display name:</span>
                      <span className="font-medium text-foreground">
                        {`${firstName} ${lastName}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Fixed Footer */}
            <div className="px-6 py-3 border-t bg-gradient-to-r from-background to-primary/5">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-9"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-9 bg-primary-gradient hover:opacity-90"
                  size="sm"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      {user ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{user ? 'Update User' : 'Create User'}</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
