import * as React from "react";
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { capitalizeFirst } from "@/utils/common";

type FormFloatingInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  placeholder?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "onChange" | "value" | "defaultValue" | "placeholder"
>;

export function FormFloatingInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>(props: FormFloatingInputProps<TFieldValues, TName>) {
  const {
    control,
    name,
    label,
    type = "text",
    className,
    inputClassName,
    disabled,
    placeholder = "",
    ...rest
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasValue = (field.value ?? "").toString().length > 0;
        const hasError = Boolean(fieldState.error);

        return (
          <FormItem className={cn("relative group", className)}>
            <label
              //   htmlFor={name as string}
              //   className={cn(
              //     "pointer-events-none absolute left-3 z-10 px-1 bg-background text-muted-foreground transition-all duration-200",
              //     !hasValue
              //       ? "top-1/2 -translate-y-1/2"
              //       : "top-0 -translate-y-1/2 text-xs",
              //     "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs"
              //   )}
              // >
              htmlFor={name as string}
              className={cn(
                "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
                // smoother transitions
                "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change:transform,top,background-color,color",
                // bg 0 by default, 100 on focus
                "bg-background/0 group-focus-within:bg-background/100",
                // float behavior
                !hasValue
                  ? "top-1/2 -translate-y-1/2"
                  : "top-0 -translate-y-1/2 text-xs",
                "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs"
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
                // autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={hasError}
                placeholder={placeholder}
                {...rest}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
