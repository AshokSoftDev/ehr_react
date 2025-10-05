import React from 'react';
import { Mail, MapPin, Clock, MoreVertical } from 'lucide-react';
// import { format } from 'date-fns';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { cn } from '../../../lib/utils';
import type { Doctor } from '../types/doctor.types';

interface DoctorCardProps {
  doctor: Doctor;
  onView: (doctor: Doctor) => void;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onView(doctor)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback 
                style={{ backgroundColor: doctor.displayColor }}
                className="text-white"
              >
                {doctor.firstName[0]}{doctor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{doctor.displayName}</CardTitle>
              <CardDescription>{doctor.degree}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onView(doctor);
              }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(doctor);
              }}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doctor);
                }}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{doctor.specialty}</Badge>
            <Badge 
              variant={doctor.status === 1 ? 'default' : 'destructive'}
              className={cn(
                doctor.status === 1 && 'bg-emerald-500/10 text-emerald-600',
              )}
            >
              {doctor.status === 1 ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{doctor.email}</span>
            </div>
            
            {doctor.city && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{doctor.city}</span>
              </div>
            )}
            
            {doctor.timeBlock && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{doctor.timeBlock} appointments</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
