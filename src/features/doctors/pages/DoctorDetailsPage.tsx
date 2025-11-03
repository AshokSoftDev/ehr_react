import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Mail, 
//   Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Clock, 
  CreditCard,
  User,
  Briefcase,
  FileText,
  Palette
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
//   CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
// import { Separator } from '../../../components/ui/separator';
import { cn } from '../../../lib/utils';
import { useDoctorDetails } from '../hooks';
import { DoctorFormSheet, DoctorDeleteDialog } from '../components';
import type { UpdateDoctorDto } from '../types/doctor.types';
import type { DoctorFormData } from '../schemas/doctor.schema';

export const DoctorDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  
  const {
    doctor,
    isLoading,
    updateDoctor,
    deleteDoctor,
    isUpdating,
    isDeleting,
  } = useDoctorDetails();

  const handleUpdate = (data: DoctorFormData) => {
    if (doctor) {
      updateDoctor(doctor.id, data as UpdateDoctorDto);
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    if (doctor) {
      await deleteDoctor(doctor.id);
      navigate('/doctors');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Doctor not found</h3>
            <Button onClick={() => navigate('/main/doctor')} className="mt-4">
              Back to Doctors
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/main/doctor')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback 
                style={{ backgroundColor: doctor.displayColor }}
                className="text-white text-lg"
              >
                {doctor.firstName[0]}{doctor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {doctor.displayName}
              </h1>
              <p className="text-muted-foreground">
                {doctor.specialty} • {doctor.degree}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <Badge 
          variant={doctor.status === 1 ? 'default' : 'destructive'}
          className={cn(
            'px-3 py-1',
            doctor.status === 1 && 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
          )}
        >
          {doctor.status === 1 ? 'Active' : 'Inactive'}
        </Badge>
        {doctor.timeBlock && (
          <Badge variant="secondary" className="px-3 py-1 gap-1">
            <Clock className="h-3 w-3" />
            {doctor.timeBlock} appointments
          </Badge>
        )}
      </div>

      {/* Information Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{doctor.title} {doctor.firstName} {doctor.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {format(new Date(doctor.dob), 'dd/MM/yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {doctor.email}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4" />
              Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">License Number</p>
              <p className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {doctor.licenceNo}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Degree</p>
              <p className="font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                {doctor.degree}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specialty</p>
              <Badge variant="secondary">{doctor.specialty}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {doctor.address || doctor.city || doctor.state ? (
              <div className="space-y-2">
                {doctor.address && (
                  <p className="text-sm">{doctor.address}</p>
                )}
                {(doctor.area || doctor.city) && (
                  <p className="text-sm">
                    {doctor.area && `${doctor.area}, `}
                    {doctor.city}
                  </p>
                )}
                {(doctor.state || doctor.country || doctor.pincode) && (
                  <p className="text-sm">
                    {doctor.state && `${doctor.state}, `}
                    {doctor.country}
                    {doctor.pincode && ` - ${doctor.pincode}`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No address provided</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {format(new Date(doctor.createdAt), 'dd/MM/yyyy, HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {format(new Date(doctor.updatedAt), 'dd/MM/yyyy, HH:mm')}
              </p>
            </div>
            {doctor.deletedAt && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Deleted At</p>
                  <p className="font-medium text-destructive">
                    {format(new Date(doctor.deletedAt), 'dd/MM/yyyy, HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deleted By</p>
                  <p className="font-medium text-destructive">
                    {doctor.deletedBy || 'Unknown'}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-semibold text-xl shadow-md"
              style={{ backgroundColor: doctor.displayColor }}
            >
              {doctor.firstName[0]}{doctor.lastName[0]}
            </div>
            <div>
              <p className="font-medium">{doctor.displayName}</p>
              <p className="text-sm text-muted-foreground">
                Color: {doctor.displayColor}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <DoctorFormSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        doctor={doctor}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
      />

      {/* Delete Dialog */}
      <DoctorDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        doctor={doctor}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
