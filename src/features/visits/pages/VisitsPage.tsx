import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/FormFloatingInput';
import { FormFloatingDatePicker } from '@/components/form/FormFloatingDatePicker';
import { Button } from '@/components/ui/button';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { VisitFilters as VisitFiltersType, VisitItem } from '../types/visit.types';
import { visitService } from '../services/visit.service';
import { createVisitColumns } from './visitColumns';
import VisitFilters from '../components/VisitFilters';
import { FormFloatingSelect } from '@/components/form/FormFloatingSelect';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../appointments/services/appointment.service';

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();

  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { dateFrom: undefined, dateTo: undefined, doctor: '', patient: '', reason: '', status: '' },
  });
  const _watch = filterForm.watch();

  const filters: VisitFiltersType = useMemo(() => {
    const vals = filterForm.getValues();
    return {
      dateFrom: vals.dateFrom ? new Date(vals.dateFrom as any).toISOString() : undefined,
      dateTo: vals.dateTo ? new Date(vals.dateTo as any).toISOString() : undefined,
      doctor: vals.doctor && vals.doctor !== 'none' ? vals.doctor : undefined,
      patient: vals.patient || undefined,
      reason: vals.reason || undefined,
      status: vals.status && vals.status !== 'none' ? vals.status : undefined,
      page,
      limit,
    };
  }, [filterForm, _watch, page, limit]);

  const { data, isLoading } = useQuery({
    queryKey: ['visits', filters],
    queryFn: () => visitService.list(filters),
  });

  const doctorsQuery = useQuery({
    queryKey: ['appointment-doctors'],
    queryFn: () => appointmentService.getDoctors(),
  });

  const doctorOptions = useMemo(() => {
    const base = [{ label: 'All', value: '' }];
    const items = (doctorsQuery.data ?? []).map((d) => ({ label: d.displayName, value: d.displayName }));
    return [...base, ...items];
  }, [doctorsQuery.data]);

  const onClearFilter = (key: string) => {
    filterForm.setValue(key as any, undefined);
  };

  const onClearAll = () => {
    filterForm.reset();
  };

  const columns: ColumnDef<VisitItem, unknown>[] = useMemo(
    () => createVisitColumns((item) => {
      if (item.patient_id) {
        navigate(`/main/patients/${item.patient_id}/visit`);
      }
    }),
    [navigate]
  );

  return (
    <div className="h-full w-full p-4 md:p-8 space-y-4">
      <h2 className="text-2xl font-bold">Visits</h2>

      {/* Filters */}
      <Form {...filterForm}>
        <form className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <FormFloatingDatePicker control={filterForm.control} name="dateFrom" label="From date" />
          <FormFloatingDatePicker control={filterForm.control} name="dateTo" label="To date" />
          <FormFloatingSelect
            control={filterForm.control}
            name="doctor"
            label="Doctor"
            options={doctorOptions}
            placeholder="Select doctor"
          />
          <FormFloatingInput control={filterForm.control} name="patient" label="Patient/MRN" />
          <FormFloatingInput control={filterForm.control} name="reason" label="Reason" />
          <FormFloatingSelect
            control={filterForm.control}
            name="status"
            label="Status"
            options={[
              { label: 'All', value: '' },
              { label: 'Scheduled', value: 'Scheduled' },
              { label: 'Confirmed', value: 'Confirmed' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
              { label: 'No-show', value: 'No-show' },
              { label: 'Rescheduled', value: 'Rescheduled' },
            ]}
            placeholder="Select status"
          />
          <div className="col-span-full flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClearAll}>Clear</Button>
          </div>
        </form>
      </Form>

      <VisitFilters filters={filterForm.getValues()} onClearFilter={onClearFilter} onClearAll={onClearAll} />

      {/* Table */}
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
  );
}

export default VisitsPage;
