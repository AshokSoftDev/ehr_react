export interface GroupData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count?: {
    users: number;
    permissions: number;
  };
  permissions?: Array<{
    moduleId: string;
    hasAccess: boolean;
    module?: {
      id: string;
      name: string;
      description?: string;
      subModules?: Array<{
        id: string;
        name: string;
        description?: string;
      }>;
    };
    subModulePermissions?: Array<{
      subModule: {
        id: string;
        name: string;
        description?: string;
      };
      allowed: boolean;
    }>;
  }>;
}

