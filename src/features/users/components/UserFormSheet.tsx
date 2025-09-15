// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import type { UserFormData } from "../schemas/user.schema";
// import { userFormSchema } from "../schemas/user.schema";
// import { Button } from "@/components/ui/button";
// import { Form, FormField } from "@/components/ui/form";
// import { FormFloatingInput } from "@/components/form/FormFloatingInput";
// import { FormSearchSelectWithCreate } from "@/components/form/FormSearchSelectWithCreate";
// import { useGroups } from "../hooks/useUsers";
// import { useFormSheet } from "@/contexts/FormSheetContext";
// import { format } from "date-fns";
// import { CalendarIcon, Loader2 } from "lucide-react";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { cn } from "@/lib/utils";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface UserFormSheetProps {
//   onSubmit: (data: UserFormData) => void;
//   initialData?: Partial<UserFormData>;
//   isLoading?: boolean;
// }

// export function UserFormSheet({ onSubmit, initialData, isLoading }: UserFormSheetProps) {
//   const { data: groups, isLoading: groupsLoading } = useGroups();
//   const { openGroupForm } = useFormSheet();


//   const { user: currentUser } = useAuth();

//   const parentInfo = currentUser?.accountType === 'parent' 
//   ? currentUser 
//   : currentUser?.parent;

//   const form = useForm<UserFormData>({
//     resolver: zodResolver(userFormSchema),
//     defaultValues: {
//       fullName: "",
//       title: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       phoneNumber: "",
//       groupId: "",
//       userStatus: 1,
//       ...initialData,
//     },
//   });

//   // Auto-fill full name when first/last name or title changes
//   const firstName = form.watch("firstName");
//   const lastName = form.watch("lastName");
//   const title = form.watch("title");

//   useEffect(() => {
//     if (firstName && lastName && title) {
//       form.setValue("fullName", `${title} ${firstName} ${lastName}`);
//     }
//   }, [firstName, lastName, title, form]);

//   const groupOptions = groups?.map((group) => ({
//     label: group.name,
//     value: group.id,
//     keywords: [group.description || ""],
//   })) || [];

//   const handleReset = () => {
//     form.reset(initialData || {
//       fullName: "",
//       title: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       phoneNumber: "",
//       groupId: "",
//       userStatus: 1,
//     });
//   };


//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
//       <div className="p-4 bg-muted/50 rounded-lg space-y-2">
//           <div className="flex items-center gap-2">
//             <Building2 className="h-4 w-4 text-muted-foreground" />
//             <span className="text-sm font-medium">Organization Info</span>
//           </div>
//           <div className="text-sm text-muted-foreground">
//             <p>Company Admin: <strong>{parentInfo?.fullName}</strong></p>
//             <p>Your Role: <strong>{currentUser?.accountType}</strong></p>
//             <p>New users will be created under the main company account</p>
//           </div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="title"
//             render={({ field }) => (
//               <div className="relative group">
//                 <label
//                   className={cn(
//                     "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
//                     "transition-all duration-300",
//                     "bg-background/0 group-focus-within:bg-background/100",
//                     field.value ? "top-0 -translate-y-1/2 text-xs" : "top-1/2 -translate-y-1/2",
//                     "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs"
//                   )}
//                 >
//                   Title
//                 </label>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <SelectTrigger className="h-12">
//                     <SelectValue placeholder="" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Mr">Mr</SelectItem>
//                     <SelectItem value="Ms">Ms</SelectItem>
//                     <SelectItem value="Mrs">Mrs</SelectItem>
//                     <SelectItem value="Dr">Dr</SelectItem>
//                     <SelectItem value="Prof">Prof</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             )}
//           />

//           <FormFloatingInput
//             control={form.control}
//             name="firstName"
//             label="First Name"
//           />
//         </div>

//         <FormFloatingInput
//           control={form.control}
//           name="lastName"
//           label="Last Name"
//         />

//         <FormFloatingInput
//           control={form.control}
//           name="fullName"
//           label="Full Name"
//           readOnly
//           className="bg-muted/50"
//         />

//         <FormFloatingInput
//           control={form.control}
//           name="email"
//           label="Email Address"
//           type="email"
//           autoComplete="email"
//         />

//         <FormFloatingInput
//           control={form.control}
//           name="phoneNumber"
//           label="Phone Number (Optional)"
//           type="tel"
//         />

//         <FormSearchSelectWithCreate
//           control={form.control}
//           name="groupId"
//           label="User Group"
//           options={groupOptions}
//           placeholder="Search groups..."
//           emptyText="No groups found"
//           createButtonText="Create New Group"
//           onCreateClick={() => openGroupForm()}
//           showCreateButton={true}
//           disabled={groupsLoading}
//         />

//         <FormField
//           control={form.control}
//           name="dob"
//           render={({ field }) => (
//             <div className="relative group">
//               <label
//                 className={cn(
//                   "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
//                   "transition-all duration-300",
//                   "bg-background/0 group-focus-within:bg-background/100",
//                   field.value ? "top-0 -translate-y-1/2 text-xs" : "top-1/2 -translate-y-1/2",
//                   "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs"
//                 )}
//               >
//                 Date of Birth (Optional)
//               </label>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full h-12 justify-start text-left font-normal",
//                       !field.value && "text-muted-foreground"
//                     )}
//                   >
//                     {field.value ? (
//                       format(field.value, "PPP")
//                     ) : (
//                       <span className="invisible">Pick a date</span>
//                     )}
//                     <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0" align="start">
//                   <Calendar
//                     mode="single"
//                     selected={field.value}
//                     onSelect={field.onChange}
//                     disabled={(date) =>
//                       date > new Date() || date < new Date("1900-01-01")
//                     }
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>
//           )}
//         />

//         {!initialData && (
//           <FormFloatingInput
//             control={form.control}
//             name="password"
//             label="Password"
//             type="password"
//             autoComplete="new-password"
//           />
//         )}

//         <FormField
//           control={form.control}
//           name="userStatus"
//           render={({ field }) => (
//             <div className="relative group">
//               <label
//                 className={cn(
//                   "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
//                   "transition-all duration-300",
//                   "bg-background/0 group-focus-within:bg-background/100",
//                   "top-0 -translate-y-1/2 text-xs"
//                 )}
//               >
//                 Status
//               </label>
//               <Select
//                 onValueChange={(value) => field.onChange(parseInt(value))}
//                 defaultValue={field.value.toString()}
//               >
//                 <SelectTrigger className="h-12">
//                   <SelectValue placeholder="" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="1">Active</SelectItem>
//                   <SelectItem value="0">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           )}
//         />

//         <div className="flex gap-3 pt-4">
//           <Button 
//             type="button" 
//             variant="outline" 
//             className="flex-1"
//             onClick={handleReset}
//             disabled={isLoading}
//           >
//             Reset
//           </Button>
//           <Button 
//             type="submit" 
//             className="flex-1" 
//             disabled={isLoading}
//           >
//             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             {isLoading ? "Saving..." : initialData ? "Update User" : "Create User"}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }
