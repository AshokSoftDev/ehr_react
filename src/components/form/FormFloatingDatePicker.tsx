import * as React from "react";
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormControl, FormItem } from "@/components/ui/form";

type FormFloatingDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  control?: Control<TFieldValues, unknown, TFieldValues>;
  name?: TName;
  label: string;
  className?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  // External controlled mode props
  value?: Date | string;
  onValueChange?: (date: Date | undefined) => void;
  required?: boolean;
} & Omit<React.ComponentPropsWithoutRef<"button">, "name" | "value">;

export function FormFloatingDatePicker<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>(props: FormFloatingDatePickerProps<TFieldValues, TName>) {
  const {
    control,
    name,
    label,
    className,
    disabled,
    fromDate,
    toDate,
    value,
    onValueChange,
    required,
    ...rest
  } = props;

  const [open, setOpen] = React.useState(false);

  const parseDate = (val: unknown): Date | undefined => {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    if (typeof val === "string") {
      const [y, m, d] = val.split("-").map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m - 1, d);
    }
    return undefined;
  };

  const formatDateString = (date: Date | undefined): string =>
    date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`
      : "";

  // External controlled mode (used outside RHF forms, e.g. filters)
  if (value !== undefined && onValueChange) {
    const selectedDate = value instanceof Date ? value : parseDate(value);
    const hasValue = Boolean(selectedDate);

    return (
      <div className={cn("grid gap-2", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <div className="relative group">
            <label
              className={cn(
                "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
                "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change:transform,top,background-color,color",
                !hasValue
                  ? "top-1/2 -translate-y-1/2 bg-transparent"
                  : "top-0 -translate-y-1/2 text-xs bg-card",
                "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs group-focus-within:bg-card",
                // Also float label when popover is open
                open && "top-0 -translate-y-1/2 text-xs bg-card"
              )}
            >
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </label>

            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-10 pt-2 pb-1 px-3 justify-start text-left font-normal",
                  "border border-input bg-card rounded-md", // Use bg-card to match global Input style
                  !hasValue && "text-muted-foreground"
                )}
                disabled={disabled}
                {...rest}
              >
                {selectedDate ? (
                  format(selectedDate, "dd/MM/yyyy")
                ) : (
                  <span> </span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </div>

          <PopoverContent className="w-auto p-0 z-[9999]" align="start">
            <Calendar
              captionLayout="dropdown"
              mode="single"
              selected={selectedDate}
              fromDate={fromDate ?? new Date(1900, 0, 1)}
              toDate={toDate ?? new Date(2100, 11, 31)}
              onSelect={(date) => {
                onValueChange(date);
                setOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Default behavior with form control
  return (
    <Controller
      control={control}
      name={name!}
      render={({ field, fieldState }) => {
        const selectedDate = parseDate(field.value);
        const hasValue = Boolean(selectedDate);
        const hasError = Boolean(fieldState.error);

        return (
          <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
              <FormItem className="relative group">
                <label
                  htmlFor={name as string}
                  className={cn(
                    "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
                    "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change:transform,top,background-color,color",
                    !hasValue
                      ? "top-1/2 -translate-y-1/2 bg-transparent"
                      : "top-0 -translate-y-1/2 text-xs bg-card",
                    "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs group-focus-within:bg-card",
                    // Also float label when popover is open
                    open && "top-0 -translate-y-1/2 text-xs bg-card",
                    hasError && "text-destructive"
                  )}
                >
                  {label}
                  {required && <span className="text-destructive ml-0.5">*</span>}
                </label>

                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-10 pt-2 pb-1 px-3 justify-start text-left font-normal",
                        "border border-input bg-card rounded-md", // Use bg-card to match global Input style
                        !hasValue && "text-muted-foreground",
                        hasError &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                      disabled={disabled}
                      {...rest}
                    >
                      {selectedDate ? (
                        format(selectedDate, "dd/MM/yyyy")
                      ) : (
                        <span> </span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
              </FormItem>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar className="bg-card"
                  captionLayout="dropdown"
                  mode="single"
                  selected={selectedDate}
                  fromDate={fromDate ?? new Date(1900, 0, 1)}
                  toDate={toDate ?? new Date()}
                  onSelect={(date) => {
                    if (date) {
                      // ensure selected date is within range
                      if (
                        (fromDate && date < fromDate) ||
                        (toDate && date > toDate)
                      ) {
                        return; // ignore invalid selection
                      }
                      field.onChange(formatDateString(date));
                      setOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

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
