import React from 'react';
import { MoreHorizontal, Mail, Award, Clock, MapPin, Edit, Trash } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { cn } from '../../../lib/utils';
import type { Doctor } from '../types/doctor.types';

interface DoctorListProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
  onView: (doctor: Doctor) => void;
}

export const DoctorList: React.FC<DoctorListProps> = ({ 
  doctors, 
  onEdit, 
  onDelete,
  onView 
}) => {
  if (!doctors.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Award className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No doctors found</h3>
        <p className="text-muted-foreground mt-1">
          Get started by adding your first doctor
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Doctor</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Time Block</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow 
              key={doctor.id} 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => onView(doctor)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback 
                      style={{ backgroundColor: doctor.displayColor }}
                      className="text-white"
                    >
                      {doctor.firstName[0]}{doctor.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{doctor.displayName}</p>
                    <p className="text-sm text-muted-foreground">{doctor.degree}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {doctor.email}
                  </p>
                  {doctor.city && (
                    <p className="text-sm flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {doctor.city}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{doctor.specialty}</Badge>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm">{doctor.licenceNo}</span>
              </TableCell>
              <TableCell>
                {doctor.timeBlock ? (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {doctor.timeBlock}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={doctor.status === 1 ? 'default' : 'destructive'}
                  className={cn(
                    doctor.status === 1 && 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
                  )}
                >
                  {doctor.status === 1 ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onView(doctor)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(doctor)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(doctor)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
