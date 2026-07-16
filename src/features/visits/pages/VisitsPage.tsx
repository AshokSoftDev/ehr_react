import { useMemo, useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { FormFloatingDatePicker } from "@/components/form/FormFloatingDatePicker";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X } from "lucide-react";
import type {
  VisitFilters as VisitFiltersType,
} from "../types/visit.types";
import { visitService } from "../services/visit.service";
import { FormFloatingSelect } from "@/components/form/FormFloatingSelect";
import { useNavigate } from "react-router-dom";
import { appointmentService } from "../../appointments/services/appointment.service";
import { CreateVisitSheet } from "../components/CreateVisitSheet";
import { VisitList } from "../components/VisitList";

const filterSchema = z.object({
  dateFrom: z.union([z.string(), z.date()]).optional(),
  dateTo: z.union([z.string(), z.date()]).optional(),
  doctor: z.string().optional(),
  patient: z.string().optional(),
  reason: z.string().optional(),
  status: z.string().optional(),
});
type FilterValues = z.infer<typeof filterSchema>;

export function VisitsPage() {
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
    };
  }, [filterForm, _watch]);

  const listQuery = useInfiniteQuery({
    queryKey: ["visits", filters],
    queryFn: ({ pageParam = 1 }) => visitService.list({ ...filters, limit: 15, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const visits = useMemo(() => {
    return listQuery.data?.pages.flatMap(page => page.visits) || [];
  }, [listQuery.data]);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage && !listQuery.isLoading) {
          listQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage, listQuery.isLoading, listQuery.fetchNextPage]);

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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10 px-2 py-2">
        <div className="flex items-center justify-between mb-4 mt-2">
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
      <ScrollArea className="flex-1 px-2 pb-6">
        <div className="pt-2">
          <VisitList
            visits={visits}
            isLoading={listQuery.isLoading}
            navigate={navigate}
          />
          
          {listQuery.hasNextPage && (
            <div ref={observerTarget} className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
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
