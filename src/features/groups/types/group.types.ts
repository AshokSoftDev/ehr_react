// import { Group } from '@prisma/client';

export interface GroupWithCounts {
  _count?: {
    users: number;
    permissions: number;
  };
}

export interface CreateGroupDto {
  name: string;
  description?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

export interface GroupFilters {
  search?: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  subModules?: SubModule[];
}

export interface SubModule {
  id: string;
  moduleId: string;
  name: string;
  description?: string;
}

export interface GroupModulePermission {
  id: string;
  groupId: string;
  moduleId: string;
  hasAccess: boolean;
  module?: Module;
  subModulePermissions?: GroupSubModulePermission[];
}

export interface GroupSubModulePermission {
  id: string;
  groupId: string;
  subModuleId: string;
  allowed: boolean;
  groupModulePermissionId?: string;
  subModule?: SubModule;
}

export interface GroupPermissionsData {
  permissions: GroupModulePermission[];
  modules: Module[];
}

export interface UpdateGroupPermissionsDto {
  permissions: {
    moduleId: string;
    hasAccess: boolean;
    subModules: {
      subModuleId: string;
      allowed: boolean;
    }[];
  }[];
}
