import { type Permission } from './permissions.interface';

export interface Group {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}
