import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Button } from '../../../components/ui/button';
import { Form } from '../../../components/ui/form';
import { FormFloatingInput } from '../../../components/form/form-floating-input';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
import { Card } from '../../../components/ui/card';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

// interface Module {
//   id: string;
//   name: string;
//   description?: string;
//   subModules?: SubModule[];
// }

// interface SubModule {
//   id: string;
//   moduleId: string;
//   name: string;
//   description?: string;
// }

// interface Permission {
//   moduleId: string;
//   hasAccess: boolean;
//   module?: Module;
//   subModulePermissions?: Array<{
//     subModule: SubModule;
//     allowed: boolean;
//   }>;
// }
interface SubModuleData {
    id: string;
    name: string;
    description?: string;
  }
  
  interface ModuleData {
    id: string;
    name: string;
    description?: string;
    subModules?: SubModuleData[];
  }

  interface Permission {
    moduleId: string;
    hasAccess: boolean;
    module?: ModuleData;
    subModulePermissions?: Array<{
      subModule: SubModuleData;
      allowed: boolean;
    }>;
  }
  
interface GroupFormData {
  name: string;
  description: string;
  permissions: Array<{
    moduleId: string;
    hasAccess: boolean;
    subModules: Array<{
      subModuleId: string;
      allowed: boolean;
    }>;
  }>;
}

interface GroupData {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

interface GroupFormProps {
  open: boolean;
  onClose: () => void;
  group?: GroupData | null;
  modules: ModuleData[];
  onSubmit: (data: GroupFormData) => Promise<void>;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  open,
  onClose,
  group,
  modules,
  onSubmit,
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
  const form = useForm<GroupFormData>({
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  useEffect(() => {
    if (group && group.permissions) {
      const permissionsMap = new Map<string, {
        hasAccess: boolean;
        subModules: Map<string, boolean>;
      }>();
      
      group.permissions.forEach(perm => {
        const subModulesMap = new Map<string, boolean>();
        perm.subModulePermissions?.forEach(sub => {
          subModulesMap.set(sub.subModule.id, sub.allowed);
        });
        
        permissionsMap.set(perm.moduleId, {
          hasAccess: perm.hasAccess,
          subModules: subModulesMap,
        });
      });

      const formPermissions = modules?.map(module => {
        const modulePerm = permissionsMap.get(module.id);
        return {
          moduleId: module.id,
          hasAccess: modulePerm?.hasAccess || false,
          subModules: module.subModules?.map(sub => ({
            subModuleId: sub.id,
            allowed: modulePerm?.subModules.get(sub.id) || false,
          })) || [],
        };
      }) || [];

      form.reset({
        name: group.name,
        description: group.description || '',
        permissions: formPermissions,
      });
    } else {
      const formPermissions = modules?.map(module => ({
        moduleId: module.id,
        hasAccess: false,
        subModules: module.subModules?.map(sub => ({
          subModuleId: sub.id,
          allowed: false,
        })) || [],
      })) || [];

      form.reset({
        name: '',
        description: '',
        permissions: formPermissions,
      });
    }
  }, [group, modules, form]);

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleModuleToggle = (moduleIndex: number, checked: boolean) => {
    const permissions = form.getValues('permissions');
    permissions[moduleIndex].hasAccess = checked;
    
    if (!checked) {
      permissions[moduleIndex].subModules.forEach(sub => {
        sub.allowed = false;
      });
    }
    
    form.setValue('permissions', [...permissions]);
  };

  const handleSubModuleToggle = (moduleIndex: number, subModuleIndex: number, checked: boolean) => {
    const permissions = form.getValues('permissions');
    permissions[moduleIndex].subModules[subModuleIndex].allowed = checked;
    
    if (checked && !permissions[moduleIndex].hasAccess) {
      permissions[moduleIndex].hasAccess = true;
    }
    
    form.setValue('permissions', [...permissions]);
  };

  const handleSubmit = async (data: GroupFormData) => {
    try {
      await onSubmit(data);
      onClose();
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{group ? 'Edit Group' : 'Create New Group'}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
                  
                  <FormFloatingInput
                    control={form.control}
                    name="name"
                    label="Group Name"
                    placeholder="Enter group name"
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Textarea
                      {...form.register('description')}
                      placeholder="Enter group description..."
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Module Permissions</h3>
                  
                  <div className="space-y-3">
                    {modules?.map((module, moduleIndex) => {
                      const permissions = form.watch('permissions');
                      const modulePermission = permissions[moduleIndex];
                      const isExpanded = expandedModules.has(module.id);
                      const hasSubModules = module.subModules && module.subModules.length > 0;

                      return (
                        <Card key={module.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  {hasSubModules && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => toggleModuleExpansion(module.id)}
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                  <Label className="text-base font-medium cursor-pointer">
                                    {module.name}
                                  </Label>
                                </div>
                                {module.description && (
                                  <p className="text-sm text-muted-foreground ml-8">
                                    {module.description}
                                  </p>
                                )}
                              </div>
                              <Checkbox
                                checked={modulePermission?.hasAccess || false}
                                onCheckedChange={(checked) =>
                                  handleModuleToggle(moduleIndex, checked as boolean)
                                }
                              />
                            </div>

                            {hasSubModules && isExpanded && (
                              <div className="ml-8 space-y-2 pt-2 border-t">
                                {module.subModules?.map((subModule, subModuleIndex) => {
                                  const isChecked = modulePermission?.subModules[subModuleIndex]?.allowed || false;
                                  const isDisabled = !modulePermission?.hasAccess;

                                  return (
                                    <div
                                      key={subModule.id}
                                      className={cn(
                                        "flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50",
                                        isDisabled && "opacity-50"
                                      )}
                                    >
                                      <div className="space-y-0.5">
                                        <Label
                                          className={cn(
                                            "text-sm cursor-pointer",
                                            isDisabled && "cursor-not-allowed"
                                          )}
                                        >
                                          {subModule.name}
                                        </Label>
                                        {subModule.description && (
                                          <p className="text-xs text-muted-foreground">
                                            {subModule.description}
                                          </p>
                                        )}
                                      </div>
                                      <Checkbox
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onCheckedChange={(checked) =>
                                          handleSubModuleToggle(moduleIndex, subModuleIndex, checked as boolean)
                                        }
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex gap-3 pt-4 border-t">
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
                    {group ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{group ? 'Update Group' : 'Create Group'}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
