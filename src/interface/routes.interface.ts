import { type LucideIcon } from 'lucide-react';

export interface RouteConfig {
    id: string;
    path: string;
    name: string;
    icon: LucideIcon;
    component?: React.ComponentType; // Made component optional
    roles: number[];
    children?: RouteConfig[];
    showInNav?: boolean;
    module: string;
}

export interface UserRole {
    id: string;
    name: string;
    permissions: string[];
}
