import { useContext } from 'react';
import { FormSheetContext } from './index';

export const useFormSheet = () => {
  const context = useContext(FormSheetContext);
  if (context === undefined) {
    throw new Error('useFormSheet must be used within a FormSheetProvider');
  }
  return context;
};
