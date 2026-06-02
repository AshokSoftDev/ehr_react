'use client';
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { PageSkeleton } from '../layouts/PageSkeleton';
import { routes } from '../config/routes';
import { filterRoutesByRole } from '../utils/routeUtils';
import { type RouteConfig } from '../interface/routes.interface';

// Lazy load all components
const Layout = lazy(() => import('../layouts/Layout'));
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));

/**
 * Recursively renders routes from the route configuration.
 * This allows for nested routes that correspond to nested navigation items.
 */
const renderRoutesFromConfig = (routes: RouteConfig[]) => {
  return routes.map(({ path, component: Component, children, id }) => {
    // If a route has children, it creates a parent route.
    // If the parent has a component, it renders it; otherwise, it renders an Outlet
    // for the child routes to be rendered into.
    if (children && children.length > 0) {
      return (
        <Route key={id} path={path} element={Component ? <Component /> : <Outlet />}>
          {renderRoutesFromConfig(children)}
        </Route>
      );
    }

    // Renders a standard route if it has a component.
    if (Component) {
      return <Route key={id} path={path} element={<Component />} />;
    }

    return null;
  });
};

export const AppRouter: React.FC = () => {
  const userRoles = [1]; // Mock user role
  const authorizedRoutes = filterRoutesByRole(routes, userRoles);

  return (
    <Routes>
      {/* Routes that do not use the main Layout */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <Login />
          </Suspense>
        }
      />

      <Route
        path="/main/"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <Layout />
          </Suspense>
        }
      >
        <Route path="/main/" element={<Navigate to="/main/dashboard" replace />} />
        <Route index element={<Dashboard />} />

        {/* Render the rest of the authorized routes from the config file */}
        {renderRoutesFromConfig(authorizedRoutes)}
      </Route>

      {/* Redirects and catch-all routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
