# EHR React Project Standards

## 1. Component Height Standards

### Input, Select & Textarea Heights

- **Standard height**: `h-10` (40px) for all inputs, selects, and textareas
- Use floating label components for consistent styling
- Never use `h-12` or `h-9` for form inputs

### Button Sizes

- Default buttons: Use CSS classes from `index.css`
- Small buttons in filters: `size="sm"`
- Icon-only buttons: `size="icon"`

---

## 2. Button Styling (Use CSS Classes from index.css)

**DO NOT use inline Tailwind classes for button colors. Use these CSS classes:**

### Primary Action Buttons (Add, Create, Submit)

```tsx
className = "btn-primary";
```

### Secondary/Cancel/Clear Buttons

```tsx
className = "btn-cancel";
```

### Outline Buttons

```tsx
className = "btn-outline";
```

---

## 3. Color Standards (Centralized in index.css)

### CRITICAL RULE

**All colors MUST be defined in `src/index.css` using CSS variables.**

- DO NOT add color classes directly in components (e.g., `bg-blue-500`)
- Use CSS custom properties defined in `:root` and `.dark`
- Create new CSS utility classes in `index.css` when needed

### Available Color Classes

```css
.bg-background, .text-foreground
.bg-card, .text-card-foreground
.bg-primary, .text-primary-foreground
.bg-muted, .text-muted-foreground
.bg-primary-gradient (gradient buttons)
.btn-primary, .btn-cancel, .btn-outline
.section-icon (for form section headers)
```

---

## 4. Form Components

### Use Floating Label Components

- `FormFloatingInput` - For text inputs (auto-capitalizes first letter)
- `FormFloatingSelect` - For dropdowns
- `FormFloatingDatePicker` - For date fields
- `FormFloatingTextarea` - For multi-line text

### Input Rules

1. **Auto-capitalize**: All text inputs capitalize first letter automatically (except email/password)
2. **Numeric only**: Use `type="text" inputMode="numeric" pattern="[0-9]*"` for pincode, phone
3. **Max length**: Set `maxLength` prop for constrained fields (e.g., pincode: 6, aadhar: 12)

### Form Sections with Icons

```tsx
<div className="flex items-center gap-2 border-b pb-2">
  <div className="section-icon">
    <User className="h-4 w-4" />
  </div>
  <div>
    <h3 className="text-sm font-semibold">Section Title</h3>
    <p className="text-xs text-muted-foreground">Description</p>
  </div>
</div>
```

---

## 5. Sheet/Modal Design

### Sheet Width Standards

- Small forms: `sm:w-[500px] lg:w-[600px]`
- Large forms: `sm:w-[600px] lg:w-[800px]`

### Sheet Structure

```tsx
<SheetContent className="w-full sm:w-[500px] lg:w-[600px] sm:max-w-none p-0 flex flex-col h-full">
  <SheetHeader className="px-5 py-3 border-b shrink-0">
    {/* Header */}
  </SheetHeader>
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Scrollable form */}
  </div>
</SheetContent>
```

### Form Footer (Fixed at Bottom)

```tsx
<div className="flex justify-end gap-3 px-5 py-3 border-t bg-background shrink-0">
  <Button className="btn-cancel">Cancel</Button>
  <Button className="btn-primary">Submit</Button>
</div>
```

---

## 6. Table Design (AdvancedDataTable)

### Spacing

- Table cell padding: `px-4 py-3`
- Table header: `h-11 px-4`
- Container gap: `space-y-2`

### Pagination

- Rows per page: Hidden by default
- Use numbered pagination with ellipsis
- Show "Showing X to Y of Z entries"

---

## 7. Spacing Guidelines

### Compact Design Rules

- Sheet padding: `px-5 py-4`
- Form section spacing: `space-y-5`
- Field gaps: `gap-3`
- Section internal spacing: `space-y-3`

---

## 8. Removed Features

### Do NOT include:

- Export buttons
- Rows per page selector
- Tabs in form sheets
- Card wrappers in sheets
- Inline color classes (use CSS variables)

---

## 9. File Naming & Organization

### Form Components

- `form-floating-input.tsx` - Text input with floating label
- `form-floating-textarea.tsx` - Textarea with floating label
- `FormFloatingSelect.tsx` - Select with floating label
- `FormFloatingDatePicker.tsx` - Date picker with floating label

### CSS

- All colors in `src/index.css`
- Use CSS custom properties for theming
- Create utility classes instead of inline styles
