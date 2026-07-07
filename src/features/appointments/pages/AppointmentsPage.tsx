import { useMemo, useState } from "react";
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
import { FormFloatingSelect } from "@/components/form/FormFloatingSelect";
import { appointmentService } from "../services/appointment.service";
import type {
  AppointmentItem,
  AppointmentFilters,
} from "../types/appointment.types";
import AppointmentFormSheet, {
  type AppointmentFormValues,
} from "../components/AppointmentFormSheet";
import AppointmentsCalendar from "../components/AppointmentsCalendar";
import { CancelAppointmentDialog } from "../components/CancelAppointmentDialog";
import { AppointmentDashboardStats } from "../components/AppointmentDashboardStats";
import { AppointmentList } from "../components/AppointmentList";
import { CalendarDays, List, X, Plus, RefreshCw } from "lucide-react";

const filterSchema = z.object({
  search: z.string().optional(),
  appointment_date: z.union([z.string(), z.date()]).optional(),
  status: z.string().optional(),
});
type FilterValues = z.infer<typeof filterSchema>;

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [calendarRange, setCalendarRange] = useState<{ start?: Date; end?: Date }>({});

  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: "", appointment_date: new Date(), status: "ALL" },
  });
  const _watch = filterForm.watch();

  const filters: AppointmentFilters = useMemo(() => {
    const vals = filterForm.getValues();
    return {
      search: vals.search || undefined,
      appointment_date: vals.appointment_date
        ? new Date(vals.appointment_date as string).toISOString()
        : undefined,
      status: vals.status && vals.status !== "ALL" ? vals.status : undefined,

    };
  }, [filterForm, _watch]);

  const listQuery = useQuery({
    queryKey: ["appointments", filters, view, calendarRange],
    queryFn: () => {
      if (view === "calendar") {
        return appointmentService.list({
          ...filters,
          appointment_date: undefined, // Ignore single date in calendar view
          startDate: calendarRange.start ? calendarRange.start.toISOString() : undefined,
          endDate: calendarRange.end ? calendarRange.end.toISOString() : undefined,
          limit: 500, // Fetch enough to populate the calendar
        });
      }
      return appointmentService.list(filters);
    },
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
      queryClient.invalidateQueries({ queryKey: ["appointment-stats"] });
    },
  });

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Appointments
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                Manage patient appointments and scheduling
              </p>
            </div>
            <AppointmentDashboardStats
              filters={filters}
              onCardClick={(status) => filterForm.setValue("status", status)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
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
        <div className="px-0 pb-0">
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
                  name="appointment_date"
                  label="Date"
                  className="h-10"
                />
              </div>
              <div>
                <FormFloatingSelect
                  control={filterForm.control}
                  name="status"
                  label="Status"
                  placeholder="All Statuses"
                  options={[
                    { value: "ALL", label: "All" },
                    { value: "SCHEDULED", label: "Scheduled" },
                    { value: "CONFIRMED", label: "Confirmed" },
                    { value: "CHECKED-IN", label: "Checked-In" },
                    { value: "WITH DOCTOR", label: "With Doctor" },
                    { value: "CHECKED-OUT", label: "Checked-Out" },
                    { value: "RESCHEDULED", label: "Rescheduled" },
                    { value: "NO-SHOW", label: "No-Show" },
                    { value: "CANCELLED", label: "Cancelled" },
                    { value: "WAIT LIST", label: "Wait List" },
                  ]}
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["appointments"] })}
                  className="h-10 w-10 shrink-0"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {view === "list" ? (
            <div className="flex flex-col gap-2">
              <AppointmentList
                appointments={listQuery.data?.appointments ?? []}
                isLoading={listQuery.isLoading}
                onEdit={(appt) => {
                  setEditItem(appt);
                  setOpenForm(true);
                }}
                onStatusChange={(id, status) => {
                  if (status.toUpperCase() === 'CANCELLED') {
                    const appt = listQuery.data?.appointments.find(a => a.appointment_id === id);
                    if (appt) setCancelAppointmentItem(appt);
                  } else {
                    statusUpdateMutation.mutate({ id, status: status.toUpperCase() });
                  }
                }}
                navigate={navigate}
              />
              {/* Pagination */}
              {/* {listQuery.data && listQuery.data.total > 0 && (
                <div className="flex justify-between items-center px-4 py-3 mt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, listQuery.data.total)} of {listQuery.data.total}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= listQuery.data.totalPages}>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )} */}
            </div>
          ) : (
            <AppointmentsCalendar
              items={listQuery.data?.appointments ?? []}
              onReschedule={onReschedule}
              onStatusChange={(id, status) =>
                statusUpdateMutation.mutate({ id, status })
              }
              onDateRangeChange={(start, end) => setCalendarRange(prev => {
                if (prev.start?.getTime() === start.getTime() && prev.end?.getTime() === end.getTime()) {
                  return prev;
                }
                return { start, end };
              })}
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
