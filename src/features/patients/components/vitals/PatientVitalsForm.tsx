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
import type { CreateVitalPayload, PatientVital } from '../../types/vital.types';
import { format } from 'date-fns';

const emptyToNull = (val: unknown) => {
  if (val === '') return null;
  return val;
};

const vitalSchema = z.object({
  vital_date: z.string().min(1, 'Date is required'),
  vital_time: z.string().optional().nullable(),
  weight: z.preprocess(emptyToNull, z.coerce.number().nullable().optional()),
  weight_unit: z.string(),
  height: z.preprocess(emptyToNull, z.coerce.number().nullable().optional()),
  height_unit: z.string(),
  bmi: z.preprocess(emptyToNull, z.coerce.number().nullable().optional()),
  temperature: z.preprocess(emptyToNull, z.coerce.number().nullable().optional()),
  temperature_unit: z.string(),
  pulse: z.preprocess(emptyToNull, z.coerce.number().nullable().optional()),
  rr: z.preprocess(emptyToNull, z.coerce.number().nullable().optional()),
  bp_systolic: z.preprocess(emptyToNull, z.coerce.number().nullable().optional()),
  bp_diastolic: z.preprocess(emptyToNull, z.coerce.number().nullable().optional()),
});

type VitalFormValues = z.infer<typeof vitalSchema>;

interface PatientVitalsFormProps {
  initialData?: PatientVital | null;
  onSubmit: (data: CreateVitalPayload) => void;
  isLoading?: boolean;
}

export function PatientVitalsForm({ initialData, onSubmit, isLoading }: PatientVitalsFormProps) {

  const form = useForm<VitalFormValues>({
    resolver: zodResolver(vitalSchema) as Resolver<VitalFormValues>, defaultValues: {
      vital_date: initialData?.vital_date
        ? format(new Date(initialData.vital_date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      vital_time: initialData?.vital_time || null,
      weight: initialData?.weight ?? null,
      weight_unit: initialData?.weight_unit || 'kg',
      height: initialData?.height ?? null,
      height_unit: initialData?.height_unit || 'cm',
      bmi: initialData?.bmi ?? null,
      temperature: initialData?.temperature ?? null,
      temperature_unit: initialData?.temperature_unit || 'celsius',
      pulse: initialData?.pulse ?? null,
      rr: initialData?.rr ?? null,
      bp_systolic: initialData?.bp_systolic ?? null,
      bp_diastolic: initialData?.bp_diastolic ?? null,
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-8 max-w-xl">
            {/* Form Fields */}
            <div className="space-y-4 pt-2">
              <FormFloatingInput
                control={form.control}
                name="vital_date"
                label="Date"
                type="date"
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
                  <span className={`h-3 w-3 rounded-full ${bmiStatus.color} mt-2`} title={bmiStatus.label} />
                )}
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
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border p-4 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            className="h-8"
          >
            Clear
          </Button>
          <Button
            type="submit"
            className="h-8 bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
