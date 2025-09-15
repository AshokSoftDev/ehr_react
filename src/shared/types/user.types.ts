// ------------------- USER TYPES -------------------
export interface User {
    userId: string;
    fullName: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    groupId?: string | null;
    password?: string; // Don't include in responses
    createdAt: Date | string;
    createdBy?: string | null;
    updatedAt: Date | string;
    updatedBy?: string | null;
    userStatus: number; // 1=active, 0=inactive
    dob?: Date | string | null;
    otp?: string | null;
    otpExpiry?: Date | string | null;
    group?: Group | null;
  }
  
  // ------------------- GROUP TYPES -------------------
  export interface Group {
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date | string;
    createdBy?: string | null;
    updatedAt: Date | string;
    updatedBy?: string | null;
    users?: User[];
    permissions?: GroupModulePermission[];
    subModulePermissions?: GroupSubModulePermission[];
  }
  
  // ------------------- MODULE TYPES -------------------
  export interface Module {
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    subModules?: SubModule[];
    permissions?: GroupModulePermission[];
  }
  
  // ------------------- SUB-MODULE TYPES -------------------
  export interface SubModule {
    id: string;
    moduleId: string;
    name: string; // e.g. "Add", "Edit", "Delete", "Export"
    description?: string | null;
    module?: Module;
    permissions?: GroupSubModulePermission[];
  }
  
  // ------------------- GROUP MODULE PERMISSION TYPES -------------------
  export interface GroupModulePermission {
    id: string;
    groupId: string;
    moduleId: string;
    hasAccess: boolean;
    group?: Group;
    module?: Module;
    subModulePermissions?: GroupSubModulePermission[];
  }
  
  // ------------------- GROUP SUB-MODULE PERMISSION TYPES -------------------
  export interface GroupSubModulePermission {
    id: string;
    groupId: string;
    subModuleId: string;
    allowed: boolean;
    groupModulePermissionId?: string | null;
    group?: Group;
    subModule?: SubModule;
    groupModulePermission?: GroupModulePermission | null;
  }
  
  // ------------------- UTILITY TYPES -------------------
  export type UserStatus = 0 | 1;
  
  export interface UserWithGroup extends User {
    group: Group;
  }
  
  export interface GroupWithPermissions extends Group {
    permissions: GroupModulePermission[];
  }
  
  export interface ModuleWithSubModules extends Module {
    subModules: SubModule[];
  }
  
  export interface PermissionCheck {
    moduleId: string;
    subModuleId?: string;
    hasAccess: boolean;
  }
  
  // ------------------- API RESPONSE TYPES -------------------
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  export interface ApiError {
    success: false;
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
  }
  
  // ------------------- FILTER TYPES -------------------
  export interface UserFilters {
    search?: string;
    groupId?: string;
    status?: UserStatus;
    dateFrom?: Date | string;
    dateTo?: Date | string;
  }
  
  export interface GroupFilters {
    search?: string;
    hasUsers?: boolean;
    hasPermissions?: boolean;
  }
  
  // ------------------- CREATE/UPDATE DTOs -------------------
  export interface CreateUserDto {
    fullName: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    groupId?: string;
    password: string;
    userStatus?: UserStatus;
    dob?: Date | string;
  }
  
  export interface UpdateUserDto {
    fullName?: string;
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string | null;
    groupId?: string | null;
    password?: string;
    userStatus?: UserStatus;
    dob?: Date | string | null;
  }
  
  export interface CreateGroupDto {
    name: string;
    description?: string;
  }
  
  export interface UpdateGroupDto {
    name?: string;
    description?: string | null;
  }
  
  export interface PermissionUpdateDto {
    moduleId: string;
    hasAccess: boolean;
    subModulePermissions: {
      subModuleId: string;
      allowed: boolean;
    }[];
  }
  
  export interface BulkPermissionUpdateDto {
    groupId: string;
    permissions: PermissionUpdateDto[];
  }
  
  // ------------------- HELPER TYPES -------------------
  export interface UserSession {
    userId: string;
    email: string;
    fullName: string;
    groupId?: string;
    permissions?: PermissionCheck[];
  }
  
  export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    oldValue?: unknown;
    newValue?: unknown;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date | string;
  }
  
  export interface SystemStats {
    totalUsers: number;
    activeUsers: number;
    totalGroups: number;
    totalModules: number;
    recentActivities: AuditLog[];
  }
  
  // ------------------- CONSTANTS -------------------
  export const USER_STATUS = {
    INACTIVE: 0,
    ACTIVE: 1,
  } as const;
  
  export const DEFAULT_PAGE_SIZE = 10;
  export const MAX_PAGE_SIZE = 100;
  
  export const SYSTEM_GROUPS = {
    ADMINISTRATORS: "administrators",
    USERS: "users",
  } as const;
  
  export const COMMON_PERMISSIONS = {
    VIEW: "View",
    ADD: "Add",
    EDIT: "Edit",
    DELETE: "Delete",
    EXPORT: "Export",
    IMPORT: "Import",
  } as const;
  