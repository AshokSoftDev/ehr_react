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
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "onChange" | "value" | "defaultValue" | "placeholder"
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
              "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
              "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change:transform,top,background-color,color",
              "bg-background/0 group-focus-within:bg-background/100",
              !hasValue
                ? "top-1/2 -translate-y-1/2"
                : "top-0 -translate-y-1/2 text-xs",
              "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs"
            )}
          >
            {label}
          </label>

          <Input
            type={type}
            className={cn(
              "h-12 pt-3 pb-2 px-3 placeholder-transparent",
              "border border-input bg-background rounded-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              inputClassName
            )}
            disabled={disabled}
            onChange={(e) => {
              const raw = e.target.value ?? "";
              const next = type === "text" ? capitalizeFirst(raw) : raw;
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
                  "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
                  "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change:transform,top,background-color,color",
                  "bg-background/0 group-focus-within:bg-background/100",
                  !hasValue
                    ? "top-1/2 -translate-y-1/2"
                    : "top-0 -translate-y-1/2 text-xs",
                  "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs",
                  hasError && "text-destructive"
                )}
              >
                {label}
              </label>

              <FormControl>
                <Input
                  id={name as string}
                  type={type}
                  className={cn(
                    "h-12 pt-3 pb-2 px-3 placeholder-transparent",
                    "border border-input bg-background rounded-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    hasError &&
                      "border-destructive focus-visible:ring-destructive",
                    inputClassName
                  )}
                  disabled={disabled}
                  onChange={(e) => {
                    const raw = e.target.value ?? "";
                    const next = type === "text" ? capitalizeFirst(raw) : raw;
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
