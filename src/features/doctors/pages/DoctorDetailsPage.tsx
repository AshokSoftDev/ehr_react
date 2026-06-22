import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash,
  Mail,
  MapPin,
  Calendar,
  Award,
  Clock,
  CreditCard,
  User,
  Briefcase,
  FileText,
  Palette,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { cn } from "../../../lib/utils";
import { useDoctorDetails } from "../hooks";
import { DoctorFormSheet } from "../components";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import type { UpdateDoctorDto } from "../types/doctor.types";
import type { DoctorFormData } from "../schemas/doctor.schema";

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
      navigate("/doctors");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-8 space-y-8 animate-pulse max-w-7xl mx-auto w-full">
        <div className="h-48 rounded-3xl bg-muted w-full relative">
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <Skeleton className="h-32 w-32 rounded-2xl border-4 border-background" />
            <div className="mb-2 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
        </div>
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-[250px] w-full rounded-2xl" />
            <Skeleton className="h-[250px] w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-1">Doctor not found</h3>
            <p className="text-muted-foreground mb-6">The doctor you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/main/doctor")} className="rounded-full px-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Doctors
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-12 w-full space-y-6 p-4 md:p-6 lg:p-8">
      {/* Hero Banner Section */}
      <div className="relative mb-24 h-48 md:h-56">
        {/* Background container with overflow hidden for the gradient and blur */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 shadow-lg overflow-hidden">
          {/* Abstract Pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px]" />
        </div>
        
        {/* Top actions */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main/doctor")}
            className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10 backdrop-blur-sm transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setIsEditOpen(true)} 
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md rounded-full shadow-sm transition-all"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            className="rounded-full shadow-sm shadow-red-500/20 transition-all hover:shadow-md hover:shadow-red-500/40"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>

        {/* Profile overlapping info */}
        <div className="absolute -bottom-16 left-6 md:left-10 flex flex-col md:flex-row items-start md:items-end gap-5">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-background shadow-xl transition-transform hover:scale-105 duration-300">
            <AvatarFallback
              style={{ backgroundColor: doctor.displayColor }}
              className="text-white text-4xl md:text-5xl font-bold rounded-xl"
            >
              {doctor.firstName[0]}
              {doctor.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="mb-2 hidden md:block">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
              {doctor.displayName}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-lg text-muted-foreground font-medium">
              <span>{doctor.specialty}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              <span>{doctor.degree}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Title (visible only on small screens) */}
      <div className="md:hidden px-4 mb-8 mt-20">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {doctor.displayName}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-base text-muted-foreground font-medium">
          <span>{doctor.specialty}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          <span>{doctor.degree}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3 px-4 md:px-0">
        
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* Personal Information */}
          <Card className="rounded-2xl shadow-sm border-muted/60 hover:shadow-md transition-all duration-300 overflow-hidden group">
            <CardHeader className="bg-muted/30 pb-4 border-b border-muted/40">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <User className="h-5 w-5" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Full Name</p>
                <p className="text-base font-semibold text-foreground">
                  {doctor.title} {doctor.firstName} {doctor.lastName}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Date of Birth</p>
                <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  {format(new Date(doctor.dob), "dd MMM, yyyy")}
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email Address</p>
                <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href={`mailto:${doctor.email}`} className="hover:text-primary transition-colors">{doctor.email}</a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="rounded-2xl shadow-sm border-muted/60 hover:shadow-md transition-all duration-300 overflow-hidden group">
            <CardHeader className="bg-muted/30 pb-4 border-b border-muted/40">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <MapPin className="h-5 w-5" />
                </div>
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {doctor.address || doctor.city || doctor.state ? (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-muted/40">
                  <div className="p-3 bg-background rounded-full shadow-sm shrink-0">
                    <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    {doctor.address && <p className="text-base font-medium">{doctor.address}</p>}
                    <p className="text-muted-foreground">
                      {[doctor.area, doctor.city].filter(Boolean).join(", ")}
                      <br />
                      {[doctor.state, doctor.country, doctor.pincode ? `PIN: ${doctor.pincode}` : null].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-muted rounded-xl bg-muted/10">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground font-medium">No location provided</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="rounded-2xl shadow-sm border-muted/60 hover:shadow-md transition-all duration-300 overflow-hidden group">
            <CardHeader className="bg-muted/30 pb-4 border-b border-muted/40">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5" />
                </div>
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Created</p>
                <p className="text-base font-medium">
                  {format(new Date(doctor.createdAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Last Modified</p>
                <p className="text-base font-medium">
                  {format(new Date(doctor.updatedAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
              {doctor.deletedAt && (
                <>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Deleted At</p>
                    <p className="text-base font-semibold text-destructive flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      {format(new Date(doctor.deletedAt), "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Deleted By</p>
                    <p className="text-base font-medium text-destructive">
                      {doctor.deletedBy || "Unknown"}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="space-y-6 md:space-y-8">
          
          {/* Status Widget */}
          <Card className="rounded-2xl shadow-sm border-muted/60 overflow-hidden border-t-4 border-t-primary hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Current Status</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="font-medium">Account Status</span>
                  <Badge
                    variant={doctor.status === 1 ? "default" : "destructive"}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-semibold shadow-sm",
                      doctor.status === 1
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-800/30"
                        : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    )}
                  >
                    {doctor.status === 1 ? (
                      <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Active</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> Inactive</span>
                    )}
                  </Badge>
                </div>
                {doctor.timeBlock && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <span className="font-medium">Time Block</span>
                    <Badge variant="secondary" className="px-3 py-1 gap-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                      <Clock className="h-3.5 w-3.5" />
                      {doctor.timeBlock} mins
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card className="rounded-2xl shadow-sm border-muted/60 hover:shadow-md transition-all duration-300 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-5 w-5" />
                </div>
                Professional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">License Number</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-md"><CreditCard className="h-4 w-4 text-foreground/70" /></div>
                  <p className="font-semibold text-base">{doctor.licenceNo}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Degree</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-md"><Award className="h-4 w-4 text-foreground/70" /></div>
                  <p className="font-semibold text-base">{doctor.degree}</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Specialty</p>
                <Badge variant="outline" className="px-4 py-1.5 text-sm bg-background border-primary/20 text-primary font-semibold">
                  {doctor.specialty}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="rounded-2xl shadow-sm border-muted/60 hover:shadow-md transition-all duration-300 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Palette className="h-5 w-5" />
                </div>
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-muted/20 border border-muted/40">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-background transform transition-transform group-hover:rotate-3"
                  style={{ backgroundColor: doctor.displayColor }}
                >
                  {doctor.firstName[0]}
                  {doctor.lastName[0]}
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{doctor.displayName}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center justify-center gap-2">
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: doctor.displayColor }}></span>
                    {doctor.displayColor}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Forms & Dialogs */}
      <DoctorFormSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        doctor={doctor}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Doctor Profile"
        description={
          doctor ? (
            <div className="mt-2 text-left">
              <p>Are you sure you want to permanently delete <span className="font-bold text-foreground">{doctor.displayName}</span>?</p>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                 <div className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: doctor.displayColor }}>
                    {doctor.firstName[0]}{doctor.lastName[0]}
                 </div>
                 <div>
                    <p className="font-medium text-sm">{doctor.specialty}</p>
                    <p className="text-xs text-muted-foreground">{doctor.degree}</p>
                 </div>
              </div>
              <p className="mt-4 text-sm text-destructive font-medium">This action cannot be undone and will remove all associated profile data.</p>
            </div>
          ) : (
            "This action cannot be undone."
          )
        }
        isDeleting={isDeleting}
      />
    </div>
  );
};
