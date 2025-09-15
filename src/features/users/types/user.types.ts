export interface User {
  userId: string;
  title: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  groupId?: string;
  accountType: string;
  parentId?: string;
  userStatus: number;
  dob?: string;
  createdAt: string;
  updatedAt: string;
  group?: {
    id: string;
    name: string;
  };
  parent?: {
    userId: string;
    fullName: string;
  };
  children?: User[];
}

export interface CreateUserDto {
  title: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  groupId?: string;
  dob?: string;
}

export interface UpdateUserDto {
  title?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  groupId?: string;
  userStatus?: number;
  dob?: string;
}

// Add these type aliases for consistency
export type CreateUserInput = CreateUserDto;
export type UpdateUserInput = UpdateUserDto;

export interface UserFilters {
  search?: string;
  groupId?: string;
  userStatus?: number;
  accountType?: string;
  parentId?: string;
}
