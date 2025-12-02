import * as React from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Switch } from './switch';
import { Label } from './label';

interface FormSwitchProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function FormSwitch<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
}: FormSwitchProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={name}>{label}</Label>
            <Switch
              id={name}
              checked={!!field.value}
              onCheckedChange={(val) => field.onChange(val)}
              disabled={disabled}
            />
          </div>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      )}
    />
  );
}

