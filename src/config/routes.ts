import { lazy } from 'react';
import {
  LayoutDashboardIcon,
  Users,
  Settings,
} from 'lucide-react';
import { type RouteConfig } from '../interface/routes.interface';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const UserManagement = lazy(() => 
  import('../features/users/pages/UsersPage').then(module => ({ 
    default: module.UsersPage 
  }))
);

const GroupManagement = lazy(() => 
  import('../features/groups/pages/GroupsPage').then(module => ({ 
    default: module.GroupsPage 
  }))
);

export const routes: RouteConfig[] = [
  {
    id: 'Dashboard',
    path: '/main/Dashboard',
    name: 'Dashboard',
    icon: LayoutDashboardIcon,
    component: Dashboard,
    roles: [1],
    showInNav: true,
    module: 'Dashboard', // Add module name
  },
  {
    id: 'user-management',
    path: '/main/users',
    name: 'User Management',
    icon: Users,
    component: UserManagement,
    roles: [1],
    showInNav: true,
    module: 'User Management', // Add module name
  },
  {
    id: 'settings',
    path: '/main/settings',
    name: 'Settings',
    icon: Settings,
    roles: [1],
    showInNav: true,
    module: 'Settings',
    children: [
      {
        id: 'group-management',
        path: '/main/settings/groups',
        name: 'Group Management',
        icon: Users,
        component: GroupManagement,
        roles: [1],
        showInNav: true,
        module: 'Settings', // Add module name
      },
    ],
  },
];
