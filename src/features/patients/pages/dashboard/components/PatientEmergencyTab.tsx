import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { SheetForm } from '@/components/ui/sheet-form';
import { Trash2, Pencil } from 'lucide-react';
import { toast } from '@/lib/toast';
import { isAxiosError } from 'axios';

import { patientEmergencyService, type PatientEmergency } from '@/features/patients/services/patient-emergency.service';

type Props = { patientId: number };

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  relation: z.string().min(1, 'Relation is required'),
  contactNumber: z.string().regex(/^\d{10}$/i, 'Enter 10 digit number'),
});
type FormValues = z.infer<typeof schema>;

export function PatientEmergencyTab({ patientId }: Props) {
  const queryClient = useQueryClient();
  const listQuery = useQuery<PatientEmergency[]>({
    queryKey: ['patient-emergency', patientId],
    queryFn: () => patientEmergencyService.list(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });

  const MAX_CONTACTS = 5;
  const count = listQuery.data?.length ?? 0;
  const canAdd = count < MAX_CONTACTS;

  // Sheet state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PatientEmergency | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', relation: '', contactNumber: '' },
  });

  const resetForm = (data?: FormValues) => form.reset(data ?? { name: '', relation: '', contactNumber: '' });

  const createMutation = useMutation({
    mutationFn: (payload: FormValues) => patientEmergencyService.create(patientId, payload),
    onSuccess: () => {
      toast.success('Emergency contact added');
      queryClient.invalidateQueries({ queryKey: ['patient-emergency', patientId] });
      setOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const message = isAxiosError(err) ? ((err.response?.data as { message?: string } | undefined)?.message ?? 'Failed to add contact') : 'Failed to add contact';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: FormValues) => patientEmergencyService.update(patientId, editing!.pe_id, payload),
    onSuccess: () => {
      toast.success('Emergency contact updated');
      queryClient.invalidateQueries({ queryKey: ['patient-emergency', patientId] });
      setOpen(false);
      setEditing(null);
      resetForm();
    },
    onError: (err: unknown) => {
      const message = isAxiosError(err) ? ((err.response?.data as { message?: string } | undefined)?.message ?? 'Failed to update contact') : 'Failed to update contact';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (peId: number) => patientEmergencyService.remove(patientId, peId),
    onSuccess: () => {
      toast.success('Emergency contact deleted');
      queryClient.invalidateQueries({ queryKey: ['patient-emergency', patientId] });
    },
    onError: (err: unknown) => {
      const message = isAxiosError(err) ? ((err.response?.data as { message?: string } | undefined)?.message ?? 'Failed to delete contact') : 'Failed to delete contact';
      toast.error(message);
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editing) {
      updateMutation.mutate(values);
    } else {
      if (!canAdd) {
        toast.info(`You can add up to ${MAX_CONTACTS} emergency contacts`);
        return;
      }
      createMutation.mutate(values);
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Emergency Contacts</CardTitle>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            disabled={!canAdd}
            onClick={() => {
              if (!canAdd) {
                toast.info(`You can add up to ${MAX_CONTACTS} emergency contacts`);
                return;
              }
              setEditing(null);
              resetForm();
              setOpen(true);
            }}
          >
            {canAdd ? 'Add Contact' : 'Limit Reached'}
          </Button>
          <span className="text-xs text-muted-foreground">{count}/{MAX_CONTACTS}</span>
        </div>
      </CardHeader>
      <CardContent>
        {listQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : count === 0 ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">No emergency contacts added.</div>
        ) : (
          <div className="grid gap-3">
            {listQuery.data!.map((item) => (
              <div key={item.pe_id} className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <div className="font-medium text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.relation} • {item.contactNumber}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setEditing(item);
                      resetForm({ name: item.name, relation: item.relation, contactNumber: item.contactNumber });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(item.pe_id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <SheetForm open={open} onOpenChange={setOpen} title={editing ? 'Edit Emergency Contact' : 'Add Emergency Contact'}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
              <FormFloatingInput control={form.control} name="name" label="Full Name" />
              <FormFloatingInput control={form.control} name="relation" label="Relation" />
              <FormFloatingInput control={form.control} name="contactNumber" label="Contact Number" inputMode="numeric" />
              <div className="sticky bottom-0 flex items-center justify-end gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3 -mx-2 -mb-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </SheetForm>
      </CardContent>
    </Card>
  );
}

export default PatientEmergencyTab;
