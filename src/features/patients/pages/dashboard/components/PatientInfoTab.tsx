import { useMemo, useState, type JSX } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type Control } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { FormFloatingSelect } from "@/components/form/FormFloatingSelect";
import { FormFloatingDatePicker } from "@/components/form/FormFloatingDatePicker";
import { FormSearchSelect } from "@/components/form/form-search-select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { Loader2, Pencil, Plus } from "lucide-react";

import {
  patientInfoService,
  type PatientInfo,
} from "@/features/patients/services/patient-info.service";
import { doctorService } from "@/features/doctors/services/doctor.service";
import type { Doctor } from "@/features/doctors/types/doctor.types";
import { toast } from "@/lib/toast";
import { isAxiosError } from "axios";

type Props = Readonly<{ patientId: number }>;

import { patientService } from "@/features/patients/services/patient.service";
import type { Patient } from "@/features/patients/types/patient.types";
import { cn } from "@/lib/utils";

export function PatientInfoTab({ patientId }: Props) {
  const queryClient = useQueryClient();

  // Patient
  const { data: patient } = useQuery<Patient>({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });

  const coerceDate = (d: unknown): Date | null => {
    if (!d) return null;
    if (d instanceof Date) return d;
    if (typeof d === "string" || typeof d === "number") {
      const dt = new Date(d);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    return null;
  };

  const getAxiosMessage = (e: unknown, fallback: string): string => {
    if (isAxiosError(e)) {
      const data = e.response?.data as { message?: string } | undefined;
      return data?.message ?? fallback;
    }
    return fallback;
  };

  // Patient Info
  const infoQuery = useQuery<PatientInfo | null>({
    queryKey: ["patient-info", patientId],
    queryFn: () => patientInfoService.get(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });

  // Doctors options
  const doctorsQuery = useQuery({
    queryKey: ["doctors", { page: 1, limit: 100 }],
    queryFn: () => doctorService.getAllDoctors({}, { page: 1, limit: 100 }),
  });
  const doctorOptions = useMemo(() => {
    const list: Doctor[] = doctorsQuery.data?.doctors || [];
    return list.map((d) => ({
      label: d.displayName || `${d.firstName} ${d.lastName}`.trim(),
      value: d.id,
    }));
  }, [doctorsQuery.data]);

  // Form
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const schema = z
    .object({
      bloodGroup: z.string().optional(),
      overseas: z.boolean().optional(),
      passportNumber: z.string().optional().nullable(),
      validityDate: z.union([
        z.date(),
        z.string().transform((val) => {
          if (!val) return null;
          const d = new Date(val);
          return isNaN(d.getTime()) ? null : d;
        }),
        z.null(),
      ]).nullable().optional(),
      occupation: z.string().optional().nullable(),
      department: z.string().optional().nullable(),
      companyName: z.string().optional().nullable(),
      designation: z.string().optional().nullable(),
      employeeCode: z.string().optional().nullable(),
      primaryDoctorId: z.string().optional().nullable(),
    })
    .refine(
      (data) => {
        if (!data.validityDate) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const max = new Date(today);
        max.setFullYear(2100);
        return data.validityDate >= today && data.validityDate <= max;
      },
      {
        message: "Passport expiry must be between today and year 2100",
        path: ["validityDate"],
      }
    );
  type FormValues = z.infer<typeof schema>;
  type FormInput = z.input<typeof schema>;

  const form = useForm<FormInput, any, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bloodGroup: "",
      overseas: false,
      passportNumber: "",
      validityDate: null,
      occupation: "",
      department: "",
      companyName: "",
      designation: "",
      employeeCode: "",
      primaryDoctorId: "",
    },
  });

  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const info = infoQuery.data;
  useMemo(() => {
    if (info) {
      form.reset({
        bloodGroup: info.bloodGroup || "",
        overseas: !!info.overseas,
        passportNumber: info.passportNumber ?? "",
        validityDate: coerceDate(info.validityDate),
        occupation: info.occupation ?? "",
        department: info.department ?? "",
        companyName: info.companyName ?? "",
        designation: info.designation ?? "",
        employeeCode: info.employeeCode ?? "",
        primaryDoctorId: info.primaryDoctorId ?? "",
      });
    }
  }, [info, form]);

  const createMutation = useMutation({
    mutationFn: (payload: FormValues) =>
      patientInfoService.create(patientId, payload),
    onSuccess: () => {
      toast.success("Patient info saved");
      queryClient.invalidateQueries({ queryKey: ["patient-info", patientId] });
      setOpen(false);
      setEditing(false);
    },
    onError: (err: unknown) =>
      toast.error(getAxiosMessage(err, "Failed to save")),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<FormValues>) =>
      patientInfoService.update(patientId, payload),
    onSuccess: () => {
      toast.success("Patient info updated");
      queryClient.invalidateQueries({ queryKey: ["patient-info", patientId] });
      setOpen(false);
      setEditing(false);
    },
    onError: (err: unknown) =>
      toast.error(getAxiosMessage(err, "Failed to update")),
  });

  const onSubmit = (values: FormValues) => {
    // Sanitize empty strings to null
    const payload = {
      ...values,
      bloodGroup: values.bloodGroup || null,
      passportNumber: values.passportNumber || null,
      occupation: values.occupation || null,
      department: values.department || null,
      companyName: values.companyName || null,
      designation: values.designation || null,
      employeeCode: values.employeeCode || null,
      primaryDoctorId: values.primaryDoctorId || null,
    };

    if (info) {
      updateMutation.mutate(payload as any);
    } else {
      createMutation.mutate(payload as any);
    }
  };

  // Avoid potential Control type identity issues across modules
  const control = form.control as unknown as Control<FormValues>;

  // Extract nested ternary into independent statement for readability
  let viewBody: JSX.Element;
  if (infoQuery.isLoading) {
    viewBody = <div className="text-sm text-muted-foreground">Loading...</div>;
  } else if (info) {
    viewBody = (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="text-xs text-muted-foreground">Blood Group</div>
          <div className="mt-1">
            <Badge variant="secondary">{info.bloodGroup}</Badge>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Overseas</div>
          <div className="mt-1">
            {info.overseas ? (
              <Badge>Yes</Badge>
            ) : (
              <Badge variant="outline">No</Badge>
            )}
          </div>
        </div>
        {info.primaryDoctorId && (
          <div>
            <div className="text-xs text-muted-foreground">Primary Doctor</div>
            <div className="mt-1">
              {doctorOptions.find((o) => o.value === info.primaryDoctorId)
                ?.label || "—"}
            </div>
          </div>
        )}
        {info.passportNumber && (
          <div>
            <div className="text-xs text-muted-foreground">Passport No.</div>
            <div className="mt-1">{info.passportNumber}</div>
          </div>
        )}
        {info.validityDate && (
          <div>
            <div className="text-xs text-muted-foreground">Passport Expiry</div>
            <div className="mt-1">
              {coerceDate(info.validityDate)?.toLocaleDateString()}
            </div>
          </div>
        )}
        {info.occupation && (
          <div>
            <div className="text-xs text-muted-foreground">Occupation</div>
            <div className="mt-1">{info.occupation}</div>
          </div>
        )}
        {info.department && (
          <div>
            <div className="text-xs text-muted-foreground">Department</div>
            <div className="mt-1">{info.department}</div>
          </div>
        )}
        {info.companyName && (
          <div>
            <div className="text-xs text-muted-foreground">Company</div>
            <div className="mt-1">{info.companyName}</div>
          </div>
        )}
        {info.designation && (
          <div>
            <div className="text-xs text-muted-foreground">Designation</div>
            <div className="mt-1">{info.designation}</div>
          </div>
        )}
        {info.employeeCode && (
          <div>
            <div className="text-xs text-muted-foreground">Employee Code</div>
            <div className="mt-1">{info.employeeCode}</div>
          </div>
        )}
      </div>
    );
  } else {
    viewBody = (
      <div className="flex items-center justify-between rounded-md border p-4">
        <div>
          <div className="text-sm font-medium text-foreground">
            No patient info yet
          </div>
          <div className="text-sm text-muted-foreground">
            Add blood group, doctor, and other details.
          </div>
        </div>
        <Button
          onClick={() => {
            setEditing(false);
            setOpen(true);
          }}
          size="sm"
        >
          Add
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>
          {patient ? `${patient.title} ${patient.firstName} ${patient.lastName}  Information` : "Patient Information"}
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          className={cn(info ? "text-blue-500 hover:text-blue-700 hover:bg-blue-50" : "")}
          disabled={infoQuery.isLoading}
          onClick={() => {
            if (info) {
              setEditing(true);
              form.reset({
                bloodGroup: info.bloodGroup || "",
                overseas: !!info.overseas,
                passportNumber: info.passportNumber ?? "",
                validityDate: coerceDate(info.validityDate),
                occupation: info.occupation ?? "",
                department: info.department ?? "",
                companyName: info.companyName ?? "",
                designation: info.designation ?? "",
                employeeCode: info.employeeCode ?? "",
                primaryDoctorId: info.primaryDoctorId ?? "",
              });
            } else {
              setEditing(false);
              form.reset();
            }
            setOpen(true);
          }}
        >
          {info ? (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Info
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div>{viewBody}</div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" preventClose className="w-full sm:max-w-lg p-0 flex flex-col">
            <SheetHeader className="px-4 py-3 border-b shrink-0">
              <SheetTitle>{editing ? "Edit Patient Info" : "Add Patient Info"}</SheetTitle>
            </SheetHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto px-2 py-4">
                  <div className="space-y-5 px-1">
                    <FormFloatingSelect
                      control={control}
                      name="bloodGroup"
                      label="Blood Group"
                      options={bloodGroupOptions.map((g) => ({
                        label: g,
                        value: g,
                      }))}
                      placeholder="Select blood group"
                    />
                    <div className="flex items-center gap-4 rounded-md border p-3">
                      <Label htmlFor="overseas">Overseas</Label>
                      <Controller
                        control={form.control}
                        name="overseas"
                        render={({ field }) => (
                          <Switch
                            id="overseas"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <FormSearchSelect
                      control={control}
                      name="primaryDoctorId"
                      label="Primary Doctor"
                      options={doctorOptions}
                      placeholder="Search doctor..."
                    />
                    <FormFloatingInput
                      control={control}
                      name="passportNumber"
                      label="Passport Number"
                    />
                    <FormFloatingDatePicker
                      control={control}
                      name="validityDate"
                      label="Passport Expiry Date"
                      fromDate={new Date()}
                      toDate={new Date(2100, 11, 31)}
                    />
                    <FormFloatingInput
                      control={control}
                      name="occupation"
                      label="Occupation"
                    />
                    <FormFloatingInput
                      control={control}
                      name="department"
                      label="Department"
                    />
                    <FormFloatingInput
                      control={control}
                      name="companyName"
                      label="Company Name"
                    />
                    <FormFloatingInput
                      control={control}
                      name="designation"
                      label="Designation"
                    />
                    <FormFloatingInput
                      control={control}
                      name="employeeCode"
                      label="Employee Code"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 px-5 py-3 border-t bg-background shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary-gradient hover:opacity-90"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}

export default PatientInfoTab;
