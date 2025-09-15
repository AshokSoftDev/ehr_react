export type SheetType = 'group' | 'user';

export interface FormSheetContextType {
  sheets: Record<SheetType, boolean>;
  openSheet: (type: SheetType) => void;
  closeSheet: (type: SheetType) => void;
  toggleSheet: (type: SheetType) => void;
}
