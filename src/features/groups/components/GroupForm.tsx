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
import { Loader2, ChevronDown, ChevronRight, Shield, Lock, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
    if(open){
      setExpandedModules(new Set());
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
  }
  }, [group, modules, form, open]);

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
    
    // If module is checked, check all submodules
    // If module is unchecked, uncheck all submodules
    permissions[moduleIndex].subModules.forEach(sub => {
      sub.allowed = checked;
    });
    
    form.setValue('permissions', [...permissions]);
  };

  const handleSubModuleToggle = (moduleIndex: number, subModuleIndex: number, checked: boolean) => {
    const permissions = form.getValues('permissions');
    permissions[moduleIndex].subModules[subModuleIndex].allowed = checked;
    
    // Check if all submodules are selected
    const allSubModulesChecked = permissions[moduleIndex].subModules.every(sub => sub.allowed);
    const anySubModuleChecked = permissions[moduleIndex].subModules.some(sub => sub.allowed);
    
    // Auto-select/deselect module based on submodule states
    if (allSubModulesChecked) {
      permissions[moduleIndex].hasAccess = true;
    } else if (!anySubModuleChecked) {
      permissions[moduleIndex].hasAccess = false;
    } else {
      // If some are checked but not all, keep module checked
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
      console.log(error);
      
    }
  };

  // Calculate permission stats
  const permissions = form.watch('permissions');
  const totalModules = modules?.length || 0;
  const enabledModules = permissions.filter(p => p.hasAccess).length;

  return (
    <Sheet 
      open={open} 
      onOpenChange={onClose}
    >
      <SheetContent 
        className="w-full sm:max-w-2xl p-0"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
         <SheetHeader className="sr-only">
          <SheetTitle>{group ? 'Edit Group' : 'Create New Group'}</SheetTitle>
        </SheetHeader>
        <div className="h-full flex flex-col">
          {/* Fixed Header */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-background to-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{group ? 'Edit Group' : 'Create New Group'}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {enabledModules} of {totalModules} modules enabled
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Content Area */}
              <ScrollArea className="flex-1 h-full max-h-[90%]">
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {/* Basic Information Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Circle className="h-3 w-3" />
                        <span>Basic Information</span>
                      </div>
                      
                      <FormFloatingInput
                        control={form.control}
                        name="name"
                        label="Group Name *"
                        className="bg-background/50"
                      />

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Description (Optional)</Label>
                        <Textarea
                          {...form.register('description')}
                          className="min-h-[60px] resize-none text-sm bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Module Permissions Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Lock className="h-3 w-3" />
                        <span>Module Permissions</span>
                      </div>
                      
                      <div className="space-y-2 pb-4">
                        {modules?.map((module, moduleIndex) => {
                          const modulePermission = permissions[moduleIndex];
                          const isExpanded = expandedModules.has(module.id);
                          const hasSubModules = module.subModules && module.subModules.length > 0;
                          const allSubModulesChecked = modulePermission?.subModules.every(sub => sub.allowed) || false;
                          const someSubModulesChecked = modulePermission?.subModules.some(sub => sub.allowed) || false;

                          return (
                            <Card 
                              key={module.id} 
                              className={cn(
                                "border transition-all duration-200 cursor-pointer",
                                modulePermission?.hasAccess 
                                  ? "border-primary/30 bg-primary/5 shadow-sm" 
                                  : "border-border hover:border-primary/20",
                                "overflow-hidden"
                              )}
                              onClick={(e) => {
                                // Only expand if clicking on the card but not on checkbox or buttons
                                const target = e.target as HTMLElement;
                                if (!target.closest('button') && !target.closest('input[type="checkbox"]') && !target.closest('[role="checkbox"]')) {
                                  if (hasSubModules) {
                                    toggleModuleExpansion(module.id);
                                  }
                                }
                              }}
                            >
                              <div className="p-3">
                                {/* Module Header */}
                                <div className="flex items-start gap-3">
                                  {hasSubModules && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 mt-0.5"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleModuleExpansion(module.id);
                                      }}
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-3 w-3" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3" />
                                      )}
                                    </Button>
                                  )}
                                  
                                  <div className="flex-1 space-y-0.5">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                      {module.name}
                                      {modulePermission?.hasAccess && (
                                        <CheckCircle2 className="h-3 w-3 text-primary" />
                                      )}
                                    </Label>
                                    {module.description && (
                                      <p className="text-xs text-muted-foreground">
                                        {module.description}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                      checked={modulePermission?.hasAccess || false}
                                      onCheckedChange={(checked) =>
                                        handleModuleToggle(moduleIndex, checked as boolean)
                                      }
                                      className={cn(
                                        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                                        someSubModulesChecked && !allSubModulesChecked && "data-[state=checked]:bg-primary/70"
                                      )}
                                    />
                                  </div>
                                </div>

                                {/* SubModules */}
                                {hasSubModules && isExpanded && (
                                  <div className="mt-3 ml-4 space-y-1 border-l-2 border-primary/10 pl-3">
                                    {module.subModules?.map((subModule, subModuleIndex) => {
                                      const isChecked = modulePermission?.subModules[subModuleIndex]?.allowed || false;

                                      return (
                                        <div
                                          key={subModule.id}
                                          className={cn(
                                            "flex items-center justify-between py-1.5 px-2 rounded-md transition-colors cursor-pointer",
                                            isChecked 
                                              ? "bg-primary/10" 
                                              : "hover:bg-muted/50"
                                          )}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSubModuleToggle(moduleIndex, subModuleIndex, !isChecked);
                                          }}
                                        >
                                          <div className="space-y-0.5 flex-1">
                                            <Label className="text-xs cursor-pointer flex items-center gap-1.5">
                                              {subModule.name}
                                              {isChecked && (
                                                <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                                              )}
                                            </Label>
                                            {subModule.description && (
                                              <p className="text-[10px] text-muted-foreground">
                                                {subModule.description}
                                              </p>
                                            )}
                                          </div>
                                          <div onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                              checked={isChecked}
                                              onCheckedChange={(checked) =>
                                                handleSubModuleToggle(moduleIndex, subModuleIndex, checked as boolean)
                                              }
                                              className="h-3.5 w-3.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                          </div>
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
                </div>
              </ScrollArea>

              {/* Fixed Footer */}
              <div className="px-6 py-3 border-t bg-gradient-to-r from-background to-primary/5">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
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
                        {group ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>{group ? 'Update Group' : 'Create Group'}</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
