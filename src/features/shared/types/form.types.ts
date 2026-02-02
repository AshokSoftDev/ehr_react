// Group form types
export interface GroupFormData {
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
  
  // User form types - separate create and update
  export interface CreateUserFormData {
    title: string;
    fullName?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    groupId?: string;
    dob?: Date | string;
  }
  
  export interface UpdateUserFormData {
    title?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    groupId?: string;
    userStatus?: number;
    dob?: Date | string;
  }
  
  // Union type for user forms
  export type UserFormData = CreateUserFormData | UpdateUserFormData;
  