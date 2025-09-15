import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../../lib/api';

interface Permission {
  moduleId: string;
  moduleName: string;
  hasAccess: boolean;
  subModules: {
    subModuleId: string;
    subModuleName: string;
    allowed: boolean;
  }[];
}

interface PermissionContextType {
  permissions: Permission[];
  loading: boolean;
  hasModuleAccess: (moduleName: string) => boolean;
  hasSubModuleAccess: (moduleName: string, subModuleName: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      
      // Get user data from localStorage/sessionStorage (wherever JWT payload is stored)
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!userStr) {
        setPermissions([]);
        return;
      }

      const user = JSON.parse(userStr);
      
      // If user doesn't have a groupId, they have no permissions
      if (!user.groupId) {
        setPermissions([]);
        return;
      }

      // Since we already have the group info, we just need to get that group's details with permissions
      const response = await api.get(`/groups/${user.groupId}`);
      const groupData = response.data.data;
      console.log(groupData);
      
      
      // If the group has permissions in the response, use them
      if (groupData.permissions) {
        const transformedPermissions: Permission[] = groupData.permissions.map((perm: any) => ({
          moduleId: perm.moduleId,
          moduleName: perm.module.name,
          hasAccess: perm.hasAccess,
          subModules: perm.subModulePermissions?.map((sub: any) => ({
            subModuleId: sub.subModuleId,
            subModuleName: sub.subModule.name,
            allowed: sub.allowed,
          })) || [],
        }));
        
        setPermissions(transformedPermissions);
      } else {
        // For root/admin users without specific permissions, grant all access
        if (user.accountType === 'parent' && !user.parentId) {
          // Fetch all modules and grant full access
          const modulesResponse = await api.get('/groups/modules');
          const modules = modulesResponse.data.data;
          
          const fullPermissions: Permission[] = modules.map((module: any) => ({
            moduleId: module.id,
            moduleName: module.name,
            hasAccess: true,
            subModules: module.subModules?.map((sub: any) => ({
              subModuleId: sub.id,
              subModuleName: sub.name,
              allowed: true,
            })) || [],
          }));
          
          setPermissions(fullPermissions);
        } else {
          setPermissions([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      // For development/testing, you might want to grant all permissions on error
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const hasModuleAccess = (moduleName: string): boolean => {
    const permission = permissions.find(p => p.moduleName === moduleName);
    return permission?.hasAccess || false;
  };

  const hasSubModuleAccess = (moduleName: string, subModuleName: string): boolean => {
    const permission = permissions.find(p => p.moduleName === moduleName);
    if (!permission?.hasAccess) return false;
    
    const subModule = permission.subModules.find(sub => sub.subModuleName === subModuleName);
    return subModule?.allowed || false;
  };

  return (
    <PermissionContext.Provider 
      value={{ 
        permissions, 
        loading, 
        hasModuleAccess, 
        hasSubModuleAccess, 
        refreshPermissions: fetchUserPermissions 
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};
