import React from 'react';
import { usePermissions } from '../../contexts/PermissionContext';
import { Alert, AlertDescription } from '../ui/alert';
import { ShieldOff } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface PermissionGuardProps {
  module: string;
  subModule?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  subModule,
  fallback,
  children,
}) => {
  const { hasModuleAccess, hasSubModuleAccess, loading } = usePermissions();

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  const hasAccess = subModule 
    ? hasSubModuleAccess(module, subModule)
    : hasModuleAccess(module);

  if (!hasAccess) {
    return fallback || (
      <Alert variant="destructive" className="max-w-md mx-auto mt-8">
        <ShieldOff className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this feature. 
          Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
