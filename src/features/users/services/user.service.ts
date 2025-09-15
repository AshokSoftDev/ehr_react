import { api } from '../../../lib/api';
import type { User, UserFilters, CreateUserDto, UpdateUserDto } from '../types/user.types';

// Define response types with proper User type
interface UsersResponse {
  status: string;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface UserResponse {
  status: string;
  data: User;
}

interface AuthResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

// Define query params interface
interface UserQueryParams extends UserFilters {
  page?: number;
  limit?: number;
}

export const userService = {
  async getUsers(params: UserQueryParams): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>('/users', { params });
    return response.data;
  },

  async getUser(id: string): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserDto): Promise<UserResponse> {
    const response = await api.post<UserResponse>('/users/create', data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponse> {
    const response = await api.put<UserResponse>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async register(data: CreateUserDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/register', data);
    return response.data;
  },
};
