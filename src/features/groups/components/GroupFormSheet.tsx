// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import type { GroupFormData } from "../schemas/group.schema";
// import { groupFormSchema } from "../schemas/group.schema";
// import { Button } from "@/components/ui/button";
// import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
// import { FormFloatingInput } from "@/components/form/FormFloatingInput";
// import { Textarea } from "@/components/ui/textarea";
// import { Loader2, Users } from "lucide-react";

// interface GroupFormSheetProps {
//   onSubmit: (data: GroupFormData) => void;
//   initialData?: Partial<GroupFormData>;
//   isLoading?: boolean;
// }

// export function GroupFormSheet({ onSubmit, initialData, isLoading }: GroupFormSheetProps) {
//   const form = useForm<GroupFormData>({
//     resolver: zodResolver(groupFormSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       ...initialData,
//     },
//   });

//   const handleReset = () => {
//     form.reset(initialData || {
//       name: "",
//       description: "",
//     });
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
//         <div className="p-4 bg-muted/50 rounded-lg">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-primary/10 rounded-lg">
//               <Users className="h-5 w-5 text-primary" />
//             </div>
//             <div>
//               <p className="font-medium">Create User Group</p>
//               <p className="text-sm text-muted-foreground">
//                 Groups help organize users and manage permissions
//               </p>
//             </div>
//           </div>
//         </div>

//         <FormFloatingInput
//           control={form.control}
//           name="name"
//           label="Group Name"
//           autoFocus
//         />

//         <FormField
//           control={form.control}
//           name="description"
//           render={({ field }) => (
//             <FormItem>
//               <div className="relative">
//                 <label
//                   className="absolute left-3 top-3 px-1 text-muted-foreground text-sm bg-background z-10"
//                 >
//                   Description (Optional)
//                 </label>
//                 <Textarea
//                   placeholder=""
//                   className="resize-none min-h-[120px] pt-8"
//                   maxLength={200}
//                   {...field}
//                 />
//                 <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
//                   {field.value?.length || 0}/200
//                 </div>
//               </div>
//               <FormMessage />
//             </FormItem>
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
//             {isLoading ? "Creating..." : initialData ? "Update Group" : "Create Group"}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }
