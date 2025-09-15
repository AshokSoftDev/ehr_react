// import { useState, useEffect } from "react";
// import type { Module, SubModule, GroupModulePermission } from "@/shared/types/user.types";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useModules, useGroups } from "../hooks/useGroups";
// import { 
//   Shield, 
//   ShieldCheck, 
//   Search, 
//   Copy,
//   Loader2,
//   CheckCircle2,
//   XCircle
// } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";

// interface PermissionState {
//   hasAccess: boolean;
//   subModules: Record<string, boolean>;
// }

// interface GroupPermissionsProps {
//   groupId: string;
//   permissions: GroupModulePermission[];
//   onSave: (permissions: unknown) => void;
//   onClone?: (sourceGroupId: string) => void;
//   isLoading?: boolean;
// }

// export function GroupPermissions({
//   groupId,
//   permissions,
//   onSave,
//   onClone,
//   isLoading,
// }: GroupPermissionsProps) {
//   const { data: modules } = useModules();
//   const { data: groupsData } = useGroups();
//   const [permissionState, setPermissionState] = useState<Record<string, PermissionState>>({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedSourceGroup, setSelectedSourceGroup] = useState<string>("");

//   useEffect(() => {
//     // Initialize permission state from existing permissions
//     const state: Record<string, PermissionState> = {};
//     permissions.forEach((perm) => {
//       state[perm.moduleId] = {
//         hasAccess: perm.hasAccess,
//         subModules: {},
//       };
//       perm.subModulePermissions?.forEach((subPerm) => {
//         state[perm.moduleId].subModules[subPerm.subModuleId] = subPerm.allowed;
//       });
//     });
//     setPermissionState(state);
//   }, [permissions]);

//   const handleModuleToggle = (moduleId: string, hasSubModules: boolean) => {
//     setPermissionState((prev) => {
//       const newState = {
//         ...prev,
//         [moduleId]: {
//           ...prev[moduleId],
//           hasAccess: !prev[moduleId]?.hasAccess,
//           subModules: prev[moduleId]?.subModules || {},
//         },
//       };

//       // If turning off module access, turn off all sub-modules
//       if (prev[moduleId]?.hasAccess && hasSubModules) {
//         const subModules: Record<string, boolean> = {};
//         Object.keys(prev[moduleId]?.subModules || {}).forEach((key) => {
//           subModules[key] = false;
//         });
//         newState[moduleId].subModules = subModules;
//       }

//       return newState;
//     });
//   };

//   const handleSubModuleToggle = (moduleId: string, subModuleId: string) => {
//     setPermissionState((prev) => ({
//       ...prev,
//       [moduleId]: {
//         ...prev[moduleId],
//         subModules: {
//           ...prev[moduleId]?.subModules,
//           [subModuleId]: !prev[moduleId]?.subModules?.[subModuleId],
//         },
//       },
//     }));
//   };

//   const handleSelectAll = (moduleId: string, subModules: SubModule[]) => {
//     const allSelected = subModules.every(
//       (sm) => permissionState[moduleId]?.subModules?.[sm.id]
//     );

//     const newSubModules: Record<string, boolean> = {};
//     subModules.forEach((sm) => {
//       newSubModules[sm.id] = !allSelected;
//     });

//     setPermissionState((prev) => ({
//       ...prev,
//       [moduleId]: {
//         ...prev[moduleId],
//         hasAccess: true,
//         subModules: newSubModules,
//       },
//     }));
//   };

//   const handleSubmit = () => {
//     const formattedPermissions = Object.entries(permissionState).map(
//       ([moduleId, data]) => ({
//         moduleId,
//         hasAccess: data.hasAccess || false,
//         subModulePermissions: Object.entries(data.subModules || {}).map(
//           ([subModuleId, allowed]) => ({
//             subModuleId,
//             allowed: allowed as boolean,
//           })
//         ),
//       })
//     );

//     onSave({
//       groupId,
//       permissions: formattedPermissions,
//     });
//   };

//   const handleClonePermissions = () => {
//     if (selectedSourceGroup && onClone) {
//       onClone(selectedSourceGroup);
//       setSelectedSourceGroup("");
//     }
//   };

//   const filteredModules = modules?.filter((module) =>
//     module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     module.description?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const otherGroups = groupsData?.groups.filter(g => g.id !== groupId) || [];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <Shield className="h-5 w-5 text-primary" />
//           <h3 className="text-lg font-semibold">Module Permissions</h3>
//         </div>
//         <Button onClick={handleSubmit} disabled={isLoading}>
//           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//           Save Permissions
//         </Button>
//       </div>

//       {otherGroups.length > 0 && (
//         <div className="flex gap-2">
//           <Select value={selectedSourceGroup} onValueChange={setSelectedSourceGroup}>
//             <SelectTrigger className="flex-1">
//               <SelectValue placeholder="Clone permissions from another group" />
//             </SelectTrigger>
//             <SelectContent>
//               {otherGroups.map((group) => (
//                 <SelectItem key={group.id} value={group.id}>
//                   {group.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           <Button
//             variant="outline"
//             onClick={handleClonePermissions}
//             disabled={!selectedSourceGroup}
//           >
//             <Copy className="h-4 w-4 mr-2" />
//             Clone
//           </Button>
//         </div>
//       )}

//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//         <Input
//           placeholder="Search modules..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="pl-9"
//         />
//       </div>

//       <ScrollArea className="h-[400px] pr-4">
//         <Accordion type="multiple" className="w-full">
//           {filteredModules?.map((module) => {
//             const modulePermission = permissionState[module.id];
//             const hasAccess = modulePermission?.hasAccess || false;
//             const subModules = module.subModules || [];
//             const selectedCount = subModules.filter(
//               (sm) => modulePermission?.subModules?.[sm.id]
//             ).length;

//             return (
//               <AccordionItem key={module.id} value={module.id}>
//                 <AccordionTrigger className="hover:no-underline">
//                   <div className="flex items-center justify-between w-full pr-4">
//                     <div className="flex items-center gap-3">
//                       <Checkbox
//                         checked={hasAccess}
//                         onCheckedChange={() => handleModuleToggle(module.id, subModules.length > 0)}
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                       <div className="text-left">
//                         <p className="font-medium">{module.name}</p>
//                         {module.description && (
//                           <p className="text-sm text-muted-foreground">
//                             {module.description}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                     {hasAccess && subModules.length > 0 && (
//                       <div className="flex items-center gap-2">
//                         <ShieldCheck className="h-4 w-4 text-muted-foreground" />
//                         <span className="text-sm text-muted-foreground">
//                           {selectedCount} / {subModules.length}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </AccordionTrigger>
//                 <AccordionContent>
//                   {hasAccess && subModules.length > 0 && (
//                     <div className="ml-6 space-y-4 pt-4">
//                       <div className="flex items-center justify-between pb-2 border-b">
//                         <Label className="text-sm font-medium">Actions</Label>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleSelectAll(module.id, subModules)}
//                         >
//                           {selectedCount === subModules.length
//                             ? "Deselect All"
//                             : "Select All"}
//                         </Button>
//                       </div>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         {subModules.map((subModule) => {
//                           const isAllowed = modulePermission?.subModules?.[subModule.id] || false;
                          
//                           return (
//                             <div
//                               key={subModule.id}
//                               className={cn(
//                                 "flex items-center space-x-2 p-3 rounded-lg border",
//                                 isAllowed ? "bg-primary/5 border-primary/20" : "bg-background"
//                               )}
//                             >
//                               <Checkbox
//                                 id={`${module.id}-${subModule.id}`}
//                                 checked={isAllowed}
//                                 onCheckedChange={() =>
//                                   handleSubModuleToggle(module.id, subModule.id)
//                                 }
//                               />
//                               <Label
//                                 htmlFor={`${module.id}-${subModule.id}`}
//                                 className="text-sm font-normal cursor-pointer flex items-center gap-2 flex-1"
//                               >
//                                 {subModule.name}
//                                 {isAllowed ? (
//                                   <CheckCircle2 className="h-3 w-3 text-primary" />
//                                 ) : (
//                                   <XCircle className="h-3 w-3 text-muted-foreground" />
//                                 )}
//                               </Label>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                   {!hasAccess && (
//                     <div className="ml-6 py-4 text-sm text-muted-foreground">
//                       Enable module access to configure permissions
//                     </div>
//                   )}
//                 </AccordionContent>
//               </AccordionItem>
//             );
//           })}
//         </Accordion>
//       </ScrollArea>
//     </div>
//   );
// }
