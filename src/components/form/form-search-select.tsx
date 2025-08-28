import * as React from "react";
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";

export type SearchOption = {
  label: string;
  value: string;
  keywords?: string[];
  disabled?: boolean;
};

type FormSearchSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  options: SearchOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  emptyText?: string;
};

export function FormSearchSelect<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>(props: FormSearchSelectProps<TFieldValues, TName>) {
  const {
    control,
    name,
    label,
    options,
    placeholder = "Search...",
    className,
    buttonClassName,
    disabled,
    emptyText = "No results found",
  } = props;

  const [open, setOpen] = React.useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = options.find((o) => o.value === field.value);
        const hasValue = Boolean(selected);
        const hasError = Boolean(fieldState.error);

        return (
          <FormItem className={cn("relative group", className)}>
            <label
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
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between h-12 pt-3 pb-2 px-3 text-left truncate",
                      "border border-input bg-background rounded-md",
                      "focus-visible:ring-2 focus-visible:ring-ring",
                      hasError &&
                        "border-destructive focus-visible:ring-destructive",
                      buttonClassName
                    )}
                  >
                    <span
                      className={cn(
                        !selected && "text-muted-foreground",
                        "truncate"
                      )}
                    >
                      {selected ? selected.label : ""}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  sideOffset={4}
                  className={cn(
                    "p-0 w-[--radix-popover-trigger-width] max-w-[calc(100vw-1rem)] sm:max-w-none",
                    "max-h-[70vh] sm:max-h-[60vh] overflow-hidden rounded-md"
                  )}
                >
                  <Command
                    filter={(value, search) => {
                      const opt = options.find((o) => o.value === value);
                      const hay = `${opt?.label ?? ""} ${(
                        opt?.keywords ?? []
                      ).join(" ")}`.toLowerCase();
                      return hay.includes(search.toLowerCase()) ? 1 : 0;
                    }}
                  >
                    <CommandInput
                      placeholder={placeholder}
                      className="h-11 text-base sm:h-9 sm:text-sm"
                    />

                    <ScrollArea className="max-h-[60vh] sm:max-h-[50vh]">
                      <CommandList className="p-1">
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                          {options.map((opt) => (
                            <CommandItem
                              key={opt.value}
                              value={opt.value}
                              disabled={opt.disabled}
                              className="text-base sm:text-sm"
                              onSelect={(val) => {
                                field.onChange(val);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === opt.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate">{opt.label}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
