// import React, { createContext, useState, useCallback, ReactNode } from 'react';

// export type SheetType = 'group' | 'user';

// interface FormSheetContextType {
//   sheets: Record<SheetType, boolean>;
//   openSheet: (type: SheetType) => void;
//   closeSheet: (type: SheetType) => void;
//   toggleSheet: (type: SheetType) => void;
// }

// export const FormSheetContext = createContext<FormSheetContextType | undefined>(undefined);

// interface FormSheetProviderProps {
//   children: ReactNode;
// }

// export const FormSheetProvider: React.FC<FormSheetProviderProps> = ({ children }) => {
//   const [sheets, setSheets] = useState<Record<SheetType, boolean>>({
//     group: false,
//     user: false,
//   });

//   const openSheet = useCallback((type: SheetType) => {
//     setSheets((prev) => ({ ...prev, [type]: true }));
//   }, []);

//   const closeSheet = useCallback((type: SheetType) => {
//     setSheets((prev) => ({ ...prev, [type]: false }));
//   }, []);

//   const toggleSheet = useCallback((type: SheetType) => {
//     setSheets((prev) => ({ ...prev, [type]: !prev[type] }));
//   }, []);

//   return (
//     <FormSheetContext.Provider value={{ sheets, openSheet, closeSheet, toggleSheet }}>
//       {children}
//     </FormSheetContext.Provider>
//   );
// };

// export const useFormSheet = () => {
//   const context = React.useContext(FormSheetContext);
//   if (context === undefined) {
//     throw new Error('useFormSheet must be used within a FormSheetProvider');
//   }
//   return context;
// };
