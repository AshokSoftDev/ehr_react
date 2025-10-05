import { lazy } from 'react';
import {
  LayoutDashboardIcon,
  Users,
  Settings,
  ThermometerIcon,
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

const Doctors = lazy(()=> import('../features/doctors/pages/DoctorsPage').then(module => ({default: module.DoctorsPage})))
const DoctorsDetails = lazy(()=> import('../features/doctors/pages/DoctorDetailsPage').then(module => ({default: module.DoctorDetailsPage})))

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
    id: 'doctor-management',
    path: '/main/doctor',
    name: 'Doctor Management',
    icon: ThermometerIcon,
    component: Doctors,
    roles: [1],
    showInNav: true,
    module: 'Doctor Management',
  },
  {
    id: 'doctor-details-management',
    path: '/main/doctor/:id',
    name: 'Doctor Management',
    icon: ThermometerIcon,
    component: DoctorsDetails,
    roles: [1],
    showInNav: false,
    module: 'Doctor Details Management',
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
