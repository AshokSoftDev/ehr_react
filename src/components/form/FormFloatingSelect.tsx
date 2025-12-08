import * as React from "react";
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type FormFloatingSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  control?: Control<TFieldValues, unknown, TFieldValues>;
  name?: TName;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
};

export function FormFloatingSelect<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>(props: FormFloatingSelectProps<TFieldValues, TName>) {
  const {
    control,
    name,
    label,
    options,
    // placeholder = "Select an option",
    className,
    triggerClassName,
    disabled,
    value,
    onValueChange,
  } = props;

  // If external value/onChange provided, use them instead of form control
  if (value !== undefined && onValueChange) {
    const hasValue = value.length > 0;

    return (
      <FormItem className={cn("relative group", className)}>
        <label
          className={cn(
            "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
            "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "bg-background/0 group-focus-within:bg-background/100",
            !hasValue
              ? "top-1/2 -translate-y-1/2"
              : "top-0 -translate-y-1/2 text-xs",
            "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs"
          )}
        >
          {label}
        </label>

        <Select disabled={disabled} onValueChange={onValueChange} value={value}>
          <SelectTrigger
            className={cn(
              "h-12 min-h-[48px] pt-3 pb-2 px-3 w-full",
              "border border-input bg-background rounded-md",
              "focus-visible:ring-2 focus-visible:ring-ring",
              "text-left",
              triggerClassName,
              "bg-card"
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72 overflow-auto z-[9999]">
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value || "none"}
                disabled={opt.disabled}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
    );
  }

  // Default behavior with form control
  return (
    <Controller
      control={control}
      name={name!}
      render={({ field, fieldState }) => {
        const hasValue = (field.value ?? "").toString().length > 0;
        const hasError = Boolean(fieldState.error);

        return (
          <FormItem className={cn("relative group", className)}>
            <label
              className={cn(
                "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
                "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "bg-background/0 group-focus-within:bg-background/100",
                !hasValue
                  ? "top-1/2 -translate-y-1/2"
                  : "top-0 -translate-y-1/2 text-xs",
                "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs"
              )}
            >
              {label}
            </label>

            <FormControl>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                value={field.value ?? ""}
              >
                <SelectTrigger
                  className={cn(
                    "h-12 min-h-[48px] pt-3 pb-2 px-3 w-full",
                    "border border-input bg-background rounded-md",
                    "focus-visible:ring-2 focus-visible:ring-ring bg-card",
                    hasError &&
                      "border-destructive focus-visible:ring-destructive",
                    "text-left",
                    triggerClassName
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72 overflow-auto z-[9999]">
                  {options.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value || "none"}
                      disabled={opt.disabled}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
