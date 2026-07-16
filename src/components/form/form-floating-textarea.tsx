
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { capitalizeFirst } from "@/utils/common";

type FormFloatingTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  label: string;
  className?: string;
  textareaClassName?: string;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  value?: string;
  onValueChange?: (value: string) => void;
  control?: Control<TFieldValues, any>;
  name?: TName;
  autoCapitalize?: boolean;
  required?: boolean;
};

export function FormFloatingTextarea<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>(props: FormFloatingTextareaProps<TFieldValues, TName>) {
  const {
    label,
    className,
    textareaClassName,
    disabled,
    placeholder = "",
    rows = 3,
    value,
    onValueChange,
    control,
    name,
    autoCapitalize = true,
    required,
  } = props;

  // External controlled mode
  if (value !== undefined && onValueChange) {
    const hasValue = value.toString().length > 0;

    return (
      <div className={cn("grid gap-2", className)}>
        <div className="relative group">
          <label
            className={cn(
              "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
              "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change:transform,top,background-color,color",
              "bg-background/0 group-focus-within:bg-background/100",
              !hasValue
                ? "top-3"
                : "top-0 -translate-y-1/2 text-xs",
              "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>

          <Textarea
            className={cn(
              "min-h-[80px] h-10 pt-4 pb-2 px-3 placeholder-transparent resize-none",
              "border border-input bg-background rounded-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              textareaClassName
            )}
            disabled={disabled}
            onChange={(e) => {
              const raw = e.target.value ?? "";
              const next = autoCapitalize ? capitalizeFirst(raw) : raw;
              onValueChange(next);
            }}
            value={value}
            rows={rows}
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
          />
        </div>
      </div>
    );
  }

  return (
    <Controller
      control={control}
      name={name as TName}
      render={({ field, fieldState }) => {
        const hasValue = (field.value ?? "").toString().length > 0;
        const hasError = Boolean(fieldState.error);

        return (
          <div className={cn("grid gap-2", className)}>
            <FormItem className="relative group">
              <label
                htmlFor={name as string}
                className={cn(
                  "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
                  "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change:transform,top,background-color,color",
                  "bg-background/0 group-focus-within:bg-background/100",
                  !hasValue
                    ? "top-3"
                    : "top-0 -translate-y-1/2 text-xs",
                  "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs",
                  hasError && "text-destructive"
                )}
              >
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
              </label>

              <FormControl>
                <Textarea
                  id={name as string}
                  className={cn(
                    "min-h-[80px] pt-4 pb-2 px-3 placeholder-transparent resize-none",
                    "border border-input bg-background rounded-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    hasError &&
                    "border-destructive focus-visible:ring-destructive",
                    textareaClassName
                  )}
                  disabled={disabled}
                  onChange={(e) => {
                    const raw = e.target.value ?? "";
                    const next = autoCapitalize ? capitalizeFirst(raw) : raw;
                    field.onChange(next);
                  }}
                  value={field.value ?? ""}
                  rows={rows}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={hasError}
                  placeholder={placeholder}
                />
              </FormControl>
            </FormItem>
            {hasError && (
              <p className="text-destructive text-sm -mt-2 px-1">
                {fieldState.error?.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
