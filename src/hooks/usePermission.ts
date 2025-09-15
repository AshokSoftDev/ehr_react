import { usePermissions } from '../contexts/PermissionContext';

export const usePermission = () => {
  const { hasModuleAccess, hasSubModuleAccess } = usePermissions();

  const can = (module: string, subModule?: string): boolean => {
    return subModule 
      ? hasSubModuleAccess(module, subModule)
      : hasModuleAccess(module);
  };

  return { can };
};
