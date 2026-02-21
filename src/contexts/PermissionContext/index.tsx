import  {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../../lib/api";

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
  hasModuleAccess: (moduleKey: string) => boolean;
  hasSubModuleAccess: (moduleKey: string, subModuleId: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);

      // Get user data from localStorage/sessionStorage (wherever JWT payload is stored)
      const userStr =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!userStr) {
        setPermissions([]);
        return;
      }

      const user = JSON.parse(userStr);

      // Root users get full access to all modules — no group needed
      if (user.accountType === "root") {
        const modulesResponse = await api.get("/groups/modules");
        const modules = modulesResponse.data.data;
        const fullPermissions: Permission[] = modules.map((module: any) => ({
          moduleId: module.id,
          moduleName: module.name,
          hasAccess: true,
          subModules:
            module.subModules?.map((sub: any) => ({
              subModuleId: sub.id,
              subModuleName: sub.name,
              allowed: true,
            })) || [],
        }));
        setPermissions(fullPermissions);
        return;
      }

      // Non-root users without a group have no permissions
      if (!user.groupId) {
        setPermissions([]);
        return;
      }

      // Fetch group-based permissions for child users
      const response = await api.get(`/groups/${user.groupId}`);
      const groupData = response.data.data;

      if (groupData.permissions) {
        const transformedPermissions: Permission[] = groupData.permissions.map(
          (perm: any) => ({
            moduleId: perm.moduleId,
            moduleName: perm.module.name,
            hasAccess: perm.hasAccess,
            subModules:
              perm.subModulePermissions?.map((sub: any) => ({
                subModuleId: sub.subModule.id,
                subModuleName: sub.subModule.name,
                allowed: sub.allowed,
              })) || [],
          })
        );
        setPermissions(transformedPermissions);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const hasModuleAccess = (moduleKey: string): boolean => {
    const permission = permissions.find(
      (p) =>
        p.moduleId === moduleKey ||
        p.moduleName.toLowerCase() === moduleKey.toLowerCase()
    );
    return permission?.hasAccess || false;
  };

  const hasSubModuleAccess = (
    moduleKey: string,
    subModuleId: string
  ): boolean => {
    const permission = permissions.find(
      (p) =>
        p.moduleId === moduleKey ||
        p.moduleName.toLowerCase() === moduleKey.toLowerCase()
    );
    if (!permission?.hasAccess) return false;

    const subModule = permission.subModules.find(
      (sub) => sub.subModuleId === subModuleId
    );
    return subModule?.allowed || false;
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        loading,
        hasModuleAccess,
        hasSubModuleAccess,
        refreshPermissions: fetchUserPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }
  return context;
};
