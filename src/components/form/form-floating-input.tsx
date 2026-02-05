import * as React from "react";
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { capitalizeFirst } from "@/utils/common";

type FormFloatingInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  label: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  control?: Control<TFieldValues, unknown, TFieldValues>;
  name?: TName;
  required?: boolean;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "onChange" | "value" | "defaultValue" | "placeholder" | "required"
>;

export function FormFloatingInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>(props: FormFloatingInputProps<TFieldValues, TName>) {
  const {
    label,
    type = "text",
    className,
    inputClassName,
    disabled,
    placeholder = "",
    value,
    onValueChange,
    control,
    name,
    required,
    ...rest
  } = props;

  // External controlled mode (used outside RHF forms, e.g. filters)
  if (value !== undefined && onValueChange) {
    const hasValue = value.toString().length > 0;

    return (
      <div className={cn("grid gap-2", className)}>
        <div className="relative group">
          <label
            className={cn(
              "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground text-sm rounded-sm",
              "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change:transform,top,background-color,color",
              !hasValue
                ? "top-1/2 -translate-y-1/2 bg-transparent"
                : "top-0 -translate-y-1/2 text-xs bg-card",
              "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs group-focus-within:bg-card"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>

          <Input
            type={type}
            className={cn(
              "h-9 pt-2 pb-1 px-3 placeholder-transparent",
              "border border-input bg-background rounded-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              inputClassName
            )}
            disabled={disabled}
            onChange={(e) => {
              let raw = e.target.value ?? "";
              // Filter non-numeric characters if inputMode is numeric
              if (rest.inputMode === "numeric") {
                raw = raw.replace(/[^0-9]/g, "");
              }
              const next = type === "text" && rest.inputMode !== "numeric" ? capitalizeFirst(raw) : raw;
              onValueChange(next);
            }}
            value={value}
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            {...rest}
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
                  "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground text-sm rounded-sm",
                  "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change:transform,top,background-color,color",
                  !hasValue
                    ? "top-1/2 -translate-y-1/2 bg-transparent"
                    : "top-0 -translate-y-1/2 text-xs bg-card",
                  "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs group-focus-within:bg-card",
                  hasError && "text-destructive"
                )}
              >
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
              </label>

              <FormControl>
                <Input
                  id={name as string}
                  type={type}
                  className={cn(
                    "h-10 pt-2 pb-1 px-3 placeholder-transparent",
                    "border border-input bg-background rounded-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    hasError &&
                      "border-destructive focus-visible:ring-destructive",
                    inputClassName
                  )}
                  disabled={disabled}
                  onChange={(e) => {
                    let raw = e.target.value ?? "";
                    // Filter non-numeric characters if inputMode is numeric
                    if (rest.inputMode === "numeric") {
                      raw = raw.replace(/[^0-9]/g, "");
                    }
                    const next = type === "text" && rest.inputMode !== "numeric" ? capitalizeFirst(raw) : raw;
                    field.onChange(next);
                  }}
                  value={field.value ?? ""}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={hasError}
                  placeholder={placeholder}
                  {...rest}
                />
              </FormControl>
            </FormItem>
            {hasError && (
              <p className="text-destructive text-xs -mt-1 px-1">
                {fieldState.error?.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
