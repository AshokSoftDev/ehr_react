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
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  className?: string;
  disabled?: boolean;
} & Omit<React.ComponentPropsWithoutRef<"button">, "name">;

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
    ...rest
  } = props;
  
  // State to control popover open/close
  const [open, setOpen] = React.useState(false);

  // Helper function to parse date string to Date object at noon local time
  const parseDate = (dateValue: unknown): Date | undefined => {
    if (!dateValue) return undefined;
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    if (typeof dateValue === 'string') {
      // Parse YYYY-MM-DD format at noon to avoid timezone issues
      const parts = dateValue.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month - 1, day, 12, 0, 0);
        }
      }
    }
    
    return undefined;
  };

  // Helper function to format date to YYYY-MM-DD in local timezone
  const formatToDateString = (date: Date | undefined): string => {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasValue = Boolean(field.value && String(field.value).length > 0);
        const hasError = Boolean(fieldState.error);
        const selectedDate = parseDate(field.value);

        return (
          <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
              <FormItem className="relative group">
                <label
                  htmlFor={name as string}
                  className={cn(
                    "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
                    "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform,top,background-color,color",
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

                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 pt-3 pb-2 px-3 justify-start text-left font-normal bg-card",
                        !field.value && "text-muted-foreground",
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
                <Calendar
                  captionLayout="dropdown"  
                  fromYear={new Date().getFullYear() - 100}
                  toYear={new Date().getFullYear()}
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      // Format date to YYYY-MM-DD string in local timezone
                      field.onChange(formatToDateString(date));
                      // Close the popover after selection
                      setOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
