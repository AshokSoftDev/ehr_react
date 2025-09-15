import React, { useContext, useState } from 'react';
import { FormSheetContext } from '../contexts/FormSheetContext/index';
import { GroupForm } from '../features/groups/components/GroupForm';
import { UserForm } from '../features/users/components/UserForm';
import { useCreateGroup, useModules } from '../features/groups/hooks/useGroups';
import { useCreateUser } from '../features/users/hooks/useUsers';
import { useQueryClient } from '@tanstack/react-query';
import type { GroupFormData, CreateUserFormData, UpdateUserFormData } from '../features/shared/types/form.types';

interface ModuleData {
  id: string;
  name: string;
  description?: string;
  subModules?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

interface ModulesResponse {
  data: ModuleData[];
}

export const GlobalFormSheets: React.FC = () => {
  const context = useContext(FormSheetContext);
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createGroupMutation = useCreateGroup();
  const createUserMutation = useCreateUser();
  const { data: modulesData } = useModules();

  if (!context) return null;

  const { sheets, closeSheet } = context;
  const modules = (modulesData as ModulesResponse)?.data || [];

  const handleGroupSubmit = async (data: GroupFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      const submitData = JSON.parse(JSON.stringify(data));
      await createGroupMutation.mutateAsync(submitData);
      closeSheet('group');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSubmit = async (data: CreateUserFormData | UpdateUserFormData): Promise<void> => {
    // Since this is global form sheets, we only handle creation
    if ('email' in data && 'password' in data) {
      try {
        setIsSubmitting(true);
        const submitData = JSON.parse(JSON.stringify(data));
        await createUserMutation.mutateAsync(submitData);
        closeSheet('user');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } catch (error) {
        // Error handled by mutation
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <GroupForm
        open={sheets.group}
        onClose={() => !isSubmitting && closeSheet('group')}
        group={null}
        modules={modules}
        onSubmit={handleGroupSubmit}
      />

      <UserForm
        open={sheets.user}
        onClose={() => !isSubmitting && closeSheet('user')}
        user={null} // null indicates creation mode
        onSubmit={handleUserSubmit}
      />
    </>
  );
};
