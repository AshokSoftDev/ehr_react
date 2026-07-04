import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { AppointmentItem } from '../types/appointment.types';

interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, cancelledBy: string) => void;
  appointment?: AppointmentItem | null;
  isLoading?: boolean;
}

export function CancelAppointmentDialog({ open, onOpenChange, onConfirm, appointment, isLoading }: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState('');
  const [cancelledBy, setCancelledBy] = useState('PATIENT');

  useEffect(() => {
    if (open) {
      setReason('');
      setCancelledBy('PATIENT');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!reason.trim() || !cancelledBy) return;
    onConfirm(reason, cancelledBy);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Please provide a reason and indicate who is cancelling.
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md text-sm mb-2 border">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Patient:</span>
                <div className="font-medium">{appointment.patient_firstName} {appointment.patient_lastName}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Doctor:</span>
                <div className="font-medium">{appointment.doctor_firstName} {appointment.doctor_lastName}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <div className="font-medium">{format(new Date(appointment.appointment_date), 'dd/MM/yyyy')}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <div className="font-medium">
                  {format(new Date(appointment.start_time), 'hh:mm a')} - {format(new Date(appointment.end_time), 'hh:mm a')}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 py-2">
          <div className="space-y-3">
            <label className="text-sm font-medium">Cancelled By <span className="text-red-500">*</span></label>
            <RadioGroup value={cancelledBy} onValueChange={setCancelledBy} className="flex flex-row space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PATIENT" id="cancel-patient" />
                <Label htmlFor="cancel-patient">Patient</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DOCTOR" id="cancel-doctor" />
                <Label htmlFor="cancel-doctor">Doctor/Clinic</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Cancellation Reason <span className="text-red-500">*</span></label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Back
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={isLoading || !reason.trim() || !cancelledBy}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
