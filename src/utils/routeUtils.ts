import { type RouteConfig } from '../interface/routes.interface';

export const filterRoutesByRole = (routes: RouteConfig[], userRoles: number[]): RouteConfig[] => {
    return routes.filter(route => {
        const hasAccess = route.roles.some(role => userRoles.includes(role));
        if (hasAccess && route.children) {
            route.children = filterRoutesByRole(route.children, userRoles);
        }
        return hasAccess;
    });
};

export const generateBreadcrumbs = (pathname: string, routes: RouteConfig[]): Array<{ name: string, path: string }> => {
    const breadcrumbs: Array<{ name: string, path: string }> = [];

    const findRoute = (routes: RouteConfig[], path: string): RouteConfig | null => {
        for (const route of routes) {
            if (route.path === path) return route;
            if (route.children) {
                const found = findRoute(route.children, path);
                if (found) return found;
            }
        }
        return null;
    };

    const pathSegments = pathname.split('/').filter(Boolean);
    let currentPath = '';

    pathSegments.forEach(segment => {
        currentPath += `/${segment}`;
        const route = findRoute(routes, currentPath);
        if (route) {
            breadcrumbs.push({ name: route.name, path: route.path });
        }
    });

    return breadcrumbs;
};