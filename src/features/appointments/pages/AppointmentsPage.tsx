import { useMemo, useState } from "react";
import { startOfDay, endOfDay } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { FormFloatingDatePicker } from "@/components/form/FormFloatingDatePicker";
import { appointmentService } from "../services/appointment.service";
import type {
  AppointmentItem,
  AppointmentFilters,
} from "../types/appointment.types";
import AppointmentFormSheet, {
  type AppointmentFormValues,
} from "../components/AppointmentFormSheet";
import AppointmentsCalendar from "../components/AppointmentsCalendar";
import { createAppointmentColumns } from "../components/AppointmentTableColumns";
import { CancelAppointmentDialog } from "../components/CancelAppointmentDialog";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { CalendarDays, Table, X, Plus } from "lucide-react";

const filterSchema = z.object({
  search: z.string().optional(),
  dateFrom: z.union([z.string(), z.date()]).optional(),
  dateTo: z.union([z.string(), z.date()]).optional(),
});
type FilterValues = z.infer<typeof filterSchema>;

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "calendar">("table");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: "", dateFrom: new Date(), dateTo: new Date() },
  });
  const _watch = filterForm.watch();

  const filters: AppointmentFilters = useMemo(() => {
    const vals = filterForm.getValues();
    return {
      search: vals.search || undefined,
      dateFrom: vals.dateFrom
        ? startOfDay(new Date(vals.dateFrom as string)).toISOString()
        : undefined,
      dateTo: vals.dateTo
        ? endOfDay(new Date(vals.dateTo as string)).toISOString()
        : undefined,
      page,
      limit,
    };
  }, [filterForm, _watch, page, limit]);

  const listQuery = useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => appointmentService.list(filters),
  });

  const doctorsQuery = useQuery({
    queryKey: ["appointment-doctors"],
    queryFn: () => appointmentService.getDoctors(),
  });

  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<AppointmentItem | null>(null);
  const [cancelAppointmentItem, setCancelAppointmentItem] = useState<AppointmentItem | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: AppointmentFormValues) =>
      appointmentService.create({
        patient_id: payload.patient_id,
        doctor_id: payload.doctor_id,
        appointment_date: payload.appointment_date,
        start_time: payload.start_time,
        end_time: payload.end_time,
        duration: payload.duration,
        appointment_type: payload.appointment_type,
        reason_for_visit: payload.reason_for_visit,
        appointment_status: payload.appointment_status,
        notes: payload.notes,
      }),
    onSuccess: () => {
      setOpenForm(false);
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; payload: AppointmentFormValues }) =>
      appointmentService.update(input.id, {
        patient_id: input.payload.patient_id,
        doctor_id: input.payload.doctor_id,
        appointment_date: input.payload.appointment_date,
        start_time: input.payload.start_time,
        end_time: input.payload.end_time,
        duration: input.payload.duration,
        appointment_type: input.payload.appointment_type,
        reason_for_visit: input.payload.reason_for_visit,
        appointment_status: input.payload.appointment_status,
        notes: input.payload.notes,
      }),
    onSuccess: () => {
      setOpenForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });


  const onReschedule = (id: number, targetDate: Date) => {
    const appt = listQuery.data?.appointments.find(
      (a) => a.appointment_id === id
    );
    if (!appt) return;
    const newStart = new Date(appt.start_time);
    newStart.setFullYear(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const newEnd = new Date(appt.end_time);
    newEnd.setFullYear(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    appointmentService
      .update(id, {
        appointment_date: targetDate.toISOString(),
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
      })
      .then(() =>
        queryClient.invalidateQueries({ queryKey: ["appointments"] })
      );
  };

  const clearAllFilters = () => {
    filterForm.reset();
  };

  const statusUpdateMutation = useMutation({
    mutationFn: ({ id, status, cancellation_reason, cancelled_by }: { id: number; status: string; cancellation_reason?: string, cancelled_by?: string }) =>
      appointmentService.update(id, { appointment_status: status, cancellation_reason, cancelled_by }),
    onSuccess: () => {
      setCancelAppointmentItem(null);
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const tableColumns = useMemo(
    () =>
      createAppointmentColumns({
        onEdit: (appointment) => {
          setEditItem(appointment);
          setOpenForm(true);
        },
        onStatusChange: (id, status) => {
          if (status.toUpperCase() === 'CANCELLED') {
            const appt = listQuery.data?.appointments.find(a => a.appointment_id === id);
            if (appt) setCancelAppointmentItem(appt);
          } else {
            statusUpdateMutation.mutate({ id, status: status.toUpperCase() });
          }
        },
        navigate,
      }),
    [statusUpdateMutation, navigate]
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Appointments
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Manage patient appointments and scheduling
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("table")}
              className="gap-2"
            >
              <Table className="h-4 w-4" />
              Table
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
              className="gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </Button>
            <Button
              onClick={() => {
                setEditItem(null);
                setOpenForm(true);
              }}
              className="ml-2 bg-primary-gradient hover:opacity-90 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Form {...filterForm}>
          <form className="grid gap-3 md:grid-cols-5 items-end">
            <div className="md:col-span-1">
              <FormFloatingInput
                control={filterForm.control}
                name="search"
                label="Search by patient, doctor, or type..."
                className="h-10"
              />
            </div>
            <div>
              <FormFloatingDatePicker
                control={filterForm.control}
                name="dateFrom"
                label="From"
                className="h-10"
              />
            </div>
            <div>
              <FormFloatingDatePicker
                control={filterForm.control}
                name="dateTo"
                label="To"
                className="h-10"
              />
            </div>
            <div className="flex gap-2">
             <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={clearAllFilters}
                className="h-10 w-10 shrink-0"
                title="Clear Filters"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="">
          {view === "table" ? (
            <>
              <AdvancedDataTable
                columns={tableColumns}
                data={listQuery.data?.appointments ?? []}
                isLoading={listQuery.isLoading}
                page={page}
                limit={limit}
                total={listQuery.data?.total ?? 0}
                onPageChange={setPage}
                onLimitChange={setLimit}
                searchPlaceholder="Search by patient, doctor, or type..."
              />
            </>
          ) : (
            <AppointmentsCalendar
              items={listQuery.data?.appointments ?? []}
              onReschedule={onReschedule}
              onStatusChange={(id, status) =>
                statusUpdateMutation.mutate({ id, status })
              }
            />
          )}
        </div>
      </ScrollArea>

      <AppointmentFormSheet
        open={openForm}
        onOpenChange={setOpenForm}
        onSubmit={(vals) => {
          if (editItem)
            updateMutation.mutate({
              id: editItem.appointment_id,
              payload: vals,
            });
          else createMutation.mutate(vals);
        }}
        doctors={doctorsQuery.data ?? []}
        initial={editItem ?? undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <CancelAppointmentDialog
        open={cancelAppointmentItem !== null}
        onOpenChange={(open) => !open && setCancelAppointmentItem(null)}
        appointment={cancelAppointmentItem}
        onConfirm={(reason, cancelledBy) => {
          if (cancelAppointmentItem !== null) {
            statusUpdateMutation.mutate({ 
              id: cancelAppointmentItem.appointment_id, 
              status: 'CANCELLED', 
              cancellation_reason: reason,
              cancelled_by: cancelledBy
            });
          }
        }}
        isLoading={statusUpdateMutation.isPending}
      />
    </div>
  );
}

export default AppointmentsPage;
