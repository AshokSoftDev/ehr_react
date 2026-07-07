import { useEffect, useMemo } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { FormFloatingDatePicker } from '@/components/form/FormFloatingDatePicker';
import { Badge } from '@/components/ui/badge';
import type { CreateVitalPayload, PatientVital } from '../../types/vital.types';
import { format } from 'date-fns';

const vitalSchema = z.object({
  vital_date: z.string().min(1, 'Date is required'),
  vital_time: z.string().optional().nullable(),
  weight: z.preprocess(
    (val) => (val === '' || val == null ? undefined : Number(val)),
    z.number({ message: 'Weight is required' }).min(0.1, 'Weight must be > 0')
  ),
  weight_unit: z.string(),
  height: z.preprocess(
    (val) => (val === '' || val == null ? undefined : Number(val)),
    z.number({ message: 'Height is required' }).min(0.1, 'Height must be > 0')
  ),
  height_unit: z.string(),
  bmi: z.preprocess((val) => (val === '' || val == null ? null : Number(val)), z.number().nullable().optional()),
  temperature: z.preprocess((val) => (val === '' || val == null ? null : Number(val)), z.number().nullable().optional()),
  temperature_unit: z.string(),
  pulse: z.preprocess((val) => (val === '' || val == null ? null : Number(val)), z.number().nullable().optional()),
  rr: z.preprocess((val) => (val === '' || val == null ? null : Number(val)), z.number().nullable().optional()),
  bp_systolic: z.preprocess((val) => (val === '' || val == null ? null : Number(val)), z.number().nullable().optional()),
  bp_diastolic: z.preprocess((val) => (val === '' || val == null ? null : Number(val)), z.number().nullable().optional()),
});

type VitalFormValues = z.infer<typeof vitalSchema>;

interface PatientVitalsFormProps {
  initialData?: PatientVital | null;
  onSubmit: (data: CreateVitalPayload) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function PatientVitalsForm({ initialData, onSubmit, onCancel, isLoading }: PatientVitalsFormProps) {

  const form = useForm<VitalFormValues>({
    resolver: zodResolver(vitalSchema) as Resolver<VitalFormValues>, defaultValues: {
      vital_date: initialData?.vital_date
        ? format(new Date(initialData.vital_date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      vital_time: initialData?.vital_time || null,
      weight: (initialData?.weight ?? '') as any,
      weight_unit: initialData?.weight_unit || 'kg',
      height: (initialData?.height ?? '') as any,
      height_unit: initialData?.height_unit || 'cm',
      bmi: (initialData?.bmi ?? '') as any,
      temperature: (initialData?.temperature ?? '') as any,
      temperature_unit: initialData?.temperature_unit || 'celsius',
      pulse: (initialData?.pulse ?? '') as any,
      rr: (initialData?.rr ?? '') as any,
      bp_systolic: (initialData?.bp_systolic ?? '') as any,
      bp_diastolic: (initialData?.bp_diastolic ?? '') as any,
    },
  });

  const weight = form.watch('weight');
  const weight_unit = form.watch('weight_unit');
  const height = form.watch('height');
  const height_unit = form.watch('height_unit');

  // Auto-calculate BMI
  useEffect(() => {
    if (weight && height) {
      let weightInKg = weight;
      if (weight_unit === 'lbs') {
        weightInKg = weight * 0.453592;
      }

      let heightInMeters = height;
      if (height_unit === 'cm') {
        heightInMeters = height / 100;
      } else if (height_unit === 'ft/inch') {
        heightInMeters = height * 0.0254;
      }

      if (heightInMeters > 0) {
        const bmi = parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(2));
        form.setValue('bmi', bmi);
      }
    } else {
      form.setValue('bmi', null);
    }
  }, [weight, weight_unit, height, height_unit, form]);

  const bmiStatus = useMemo(() => {
    const bmi = form.watch('bmi');
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-pink-500' };
    if (bmi < 25) return { label: 'Normal weight', color: 'bg-green-500' };
    if (bmi < 30) return { label: 'Overweight', color: 'bg-orange-500' };
    return { label: 'Obese', color: 'bg-red-500' };
  }, [form.watch('bmi')]);

  const handleSubmit = (values: VitalFormValues) => {
    const payload: CreateVitalPayload = {
      vital_date: new Date(values.vital_date).toISOString(),
      vital_time: values.vital_time,
      weight: values.weight,
      weight_unit: values.weight_unit,
      height: values.height,
      height_unit: values.height_unit,
      bmi: values.bmi,
      temperature: values.temperature,
      temperature_unit: values.temperature_unit,
      pulse: values.pulse,
      rr: values.rr,
      bp_systolic: values.bp_systolic,
      bp_diastolic: values.bp_diastolic,
    };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-1 gap-8 max-w-xl">
            {/* Form Fields */}
            <div className="space-y-4 pt-2">
              <FormFloatingDatePicker
                control={form.control}
                name="vital_date"
                label="Date"
                required
              />

              <div className="flex gap-2 items-start">
                <FormFloatingInput
                  control={form.control}
                  name="weight"
                  label="Weight"
                  type="number"
                  step="0.01"
                  className="flex-1"
                  required
                />
                <Controller
                  control={form.control}
                  name="weight_unit"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[100px] h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex gap-2 items-start">
                <FormFloatingInput
                  control={form.control}
                  name="height"
                  label="Height"
                  type="number"
                  step="0.01"
                  className="flex-1"
                  required
                />
                <Controller
                  control={form.control}
                  name="height_unit"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[100px] h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="ft/inch">ft/inch</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex gap-2 items-center">
                <FormFloatingInput
                  control={form.control}
                  name="bmi"
                  label="BMI"
                  type="number"
                  step="0.01"
                  disabled
                  className="flex-1 opacity-70"
                  required
                />
                {bmiStatus && (
                  <Badge variant="outline" className={`${bmiStatus.color} text-white border-0 mt-2 whitespace-nowrap`}>
                    {bmiStatus.label}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <FormFloatingInput
                  control={form.control}
                  name="bp_systolic"
                  label="Systolic"
                  type="number"
                  className="flex-1"
                />
                <span className="text-muted-foreground">/</span>
                <FormFloatingInput
                  control={form.control}
                  name="bp_diastolic"
                  label="Diastolic"
                  type="number"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground pr-2">mmHg</span>
              </div>

              <div className="flex gap-2 items-start">
                <FormFloatingInput
                  control={form.control}
                  name="temperature"
                  label="Temperature"
                  type="number"
                  step="0.1"
                  className="flex-1"
                />
                <Controller
                  control={form.control}
                  name="temperature_unit"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[110px] h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celsius">Celsius</SelectItem>
                        <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <FormFloatingInput
                control={form.control}
                name="pulse"
                label="Pulse"
                type="number"
              />

              <FormFloatingInput
                control={form.control}
                name="rr"
                label="RR (Respiration Rate)"
                type="number"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border p-4 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              if (onCancel) onCancel();
            }}
            className="h-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-8"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
