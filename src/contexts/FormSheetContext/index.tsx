import React, { createContext, useState, useCallback, type ReactNode } from 'react';
import type { SheetType, FormSheetContextType } from './types';

export const FormSheetContext = createContext<FormSheetContextType | undefined>(undefined);

interface FormSheetProviderProps {
  children: ReactNode;
}

export const FormSheetProvider: React.FC<FormSheetProviderProps> = ({ children }) => {
  const [sheets, setSheets] = useState<Record<SheetType, boolean>>({
    group: false,
    user: false,
  });

  const openSheet = useCallback((type: SheetType) => {
    setSheets((prev) => ({ ...prev, [type]: true }));
  }, []);

  const closeSheet = useCallback((type: SheetType) => {
    setSheets((prev) => ({ ...prev, [type]: false }));
  }, []);

  const toggleSheet = useCallback((type: SheetType) => {
    setSheets((prev) => ({ ...prev, [type]: false }));
  }, []);

  return (
    <FormSheetContext.Provider value={{ sheets, openSheet, closeSheet, toggleSheet }}>
      {children}
    </FormSheetContext.Provider>
  );
};
