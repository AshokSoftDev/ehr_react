import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { FormFloatingDatePicker } from "@/components/form/FormFloatingDatePicker";
import { Button } from "@/components/ui/button";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X } from "lucide-react";
import type {
  VisitFilters as VisitFiltersType,
  VisitItem,
} from "../types/visit.types";
import { visitService } from "../services/visit.service";
import { createVisitColumns } from "./visitColumns";
import { FormFloatingSelect } from "@/components/form/FormFloatingSelect";
import { useNavigate } from "react-router-dom";
import { appointmentService } from "../../appointments/services/appointment.service";
import { CreateVisitSheet } from "../components/CreateVisitSheet";

const filterSchema = z.object({
  dateFrom: z.union([z.string(), z.date()]).optional(),
  dateTo: z.union([z.string(), z.date()]).optional(),
  doctor: z.string().optional(),
  patient: z.string().optional(),
  reason: z.string().optional(),
  status: z.string().optional(), // '1' or '0'
});
type FilterValues = z.infer<typeof filterSchema>;

export function VisitsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const navigate = useNavigate();

  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      dateFrom: undefined,
      dateTo: undefined,
      doctor: "",
      patient: "",
      reason: "",
      status: "",
    },
  });
  const _watch = filterForm.watch();

  const filters: VisitFiltersType = useMemo(() => {
    const vals = filterForm.getValues();
    return {
      dateFrom: vals.dateFrom
        ? new Date(vals.dateFrom as any).toISOString()
        : undefined,
      dateTo: vals.dateTo
        ? new Date(vals.dateTo as any).toISOString()
        : undefined,
      doctor: vals.doctor && vals.doctor !== "none" ? vals.doctor : undefined,
      patient: vals.patient || undefined,
      reason: vals.reason || undefined,
      status: vals.status && vals.status !== "none" ? vals.status : undefined,
      page,
      limit,
    };
  }, [filterForm, _watch, page, limit]);

  const { data, isLoading } = useQuery({
    queryKey: ["visits", filters],
    queryFn: () => visitService.list(filters),
  });

  const doctorsQuery = useQuery({
    queryKey: ["appointment-doctors"],
    queryFn: () => appointmentService.getDoctors(),
  });

  const doctorOptions = useMemo(() => {
    const base = [{ label: "All", value: "" }];
    const items = (doctorsQuery.data ?? []).map((d) => ({
      label: d.displayName,
      value: d.displayName,
    }));
    return [...base, ...items];
  }, [doctorsQuery.data]);

  const onClearAll = () => {
    filterForm.reset();
  };

  const columns: ColumnDef<VisitItem, unknown>[] = useMemo(
    () =>
      createVisitColumns((item) => {
        if (item.patient_id && item.visit_id) {
          const params = new URLSearchParams();
          params.set("tab", "notes");
          params.set("visitId", String(item.visit_id));
          navigate(`/main/patients/${item.patient_id}/visit?${params.toString()}`);
        } else if (item.patient_id) {
          navigate(`/main/patients/${item.patient_id}/visit`);
        }
      }),
    [navigate]
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Visits
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              View and filter patient visits history
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreateSheet(true)} className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            Create Visit
          </Button>
        </div>

        {/* Filters */}
        <Form {...filterForm}>
          <form className="grid gap-3 md:grid-cols-6 items-end">
            <div className="md:col-span-1">
              <FormFloatingDatePicker
                control={filterForm.control}
                name="dateFrom"
                label="From date"
                className="h-10"
              />
            </div>
            <div className="md:col-span-1">
               <FormFloatingDatePicker
                control={filterForm.control}
                name="dateTo"
                label="To date"
                className="h-10"
              />
            </div>
            <div className="md:col-span-1">
               <FormFloatingSelect
                control={filterForm.control}
                name="doctor"
                label="Doctor"
                options={doctorOptions}
                placeholder="Select doctor"
                className="h-10"
              />
            </div>
            <div className="md:col-span-1">
               <FormFloatingInput
                control={filterForm.control}
                name="patient"
                label="Patient/MRN"
                className="h-10"
              />
            </div>
            <div className="md:col-span-1">
              <FormFloatingInput
                control={filterForm.control}
                name="reason"
                label="Reason"
                className="h-10"
              />
            </div>
            <div className="md:col-span-1 flex gap-2">
               <FormFloatingSelect
                control={filterForm.control}
                name="status"
                label="Status"
                options={[
                  { label: "All", value: "" },
                  { label: "Active", value: "1" },
                  { label: "Inactive", value: "0" },
                ]}
                placeholder="Select status"
                className="h-10 w-full"
              />
               <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={onClearAll}
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
          <AdvancedDataTable<VisitItem, unknown>
            columns={columns}
            data={data?.visits ?? []}
            isLoading={isLoading}
            page={page}
            limit={limit}
            total={data?.total ?? 0}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>
      </ScrollArea>

      <CreateVisitSheet
        open={showCreateSheet}
        onOpenChange={setShowCreateSheet}
      />
    </div>
  );
}

export default VisitsPage;
