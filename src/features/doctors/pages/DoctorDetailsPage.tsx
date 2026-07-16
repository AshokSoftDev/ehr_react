import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  ShieldCheck,
  ShieldAlert,
  Settings,
  Activity,
  Save,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Switch } from "../../../components/ui/switch";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { cn } from "../../../lib/utils";
import { useDoctorDetails } from "../hooks";
import { DoctorFormSheet } from "../components";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { useAppointmentTypes } from "../../masters/hooks/useAppointmentTypes";
import type { UpdateDoctorDto } from "../types/doctor.types";
import type { DoctorFormData } from "../schemas/doctor.schema";

const tabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "appointments", label: "Appointment Types", icon: Activity }
] as const;

type TabId = (typeof tabs)[number]["id"];

export const DoctorDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get("tab") as TabId) || "overview";

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const {
    doctor,
    isLoading,
    updateDoctor,
    deleteDoctor,
    syncAppointmentTypes,
    isUpdating,
    isDeleting,
    isSyncingAppointmentTypes
  } = useDoctorDetails();

  const { data: masters, isLoading: isMastersLoading } = useAppointmentTypes();

  // Local state for Appointment Types Form
  const [doctorApptTypes, setDoctorApptTypes] = useState<Record<string, { enabled: boolean; duration: number }>>({});

  useEffect(() => {
    if (doctor && masters) {
      const initial: Record<string, { enabled: boolean; duration: number }> = {};
      masters.forEach((m) => {
        const mapped = doctor.appointmentTypes?.find((da) => da.appointment_type === m.code);
        initial[m.code] = {
          enabled: !!mapped,
          duration: mapped ? mapped.duration_minutes : m.duration_minutes,
        };
      });
      setDoctorApptTypes(initial);
    }
  }, [doctor, masters]);

  const handleTabChange = (tabId: TabId) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tabId);
    setSearchParams(next, { replace: true });
  };

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

  const handleSaveApptTypes = async () => {
    if (!doctor) return;
    const typesToSave = Object.entries(doctorApptTypes)
      .filter(([_, config]) => config.enabled)
      .map(([code, config]) => ({
        appointment_type: code,
        duration_minutes: config.duration,
      }));

    await syncAppointmentTypes(doctor.id, typesToSave);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-8 space-y-8 animate-pulse max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-12 w-full max-w-xl rounded-lg" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[250px] w-full rounded-2xl" />
          <Skeleton className="h-[250px] w-full rounded-2xl" />
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
    <div className="flex-1 w-full p-2 md:p-2 lg:p-2">
      {/* Small Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main/doctor")}
            className="rounded-full shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-14 w-14 rounded-xl border border-border shadow-sm">
            <AvatarFallback
              style={{ backgroundColor: doctor.displayColor }}
              className="text-white text-xl font-bold rounded-xl"
            >
              {doctor.firstName[0]}
              {doctor.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {doctor.displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-sm text-muted-foreground font-medium">
              <span>{doctor.specialty}</span>
              <span className="w-1 h-1 rounded-full bg-primary/50" />
              <span>{doctor.degree}</span>
              <span className="w-1 h-1 rounded-full bg-primary/50" />
              <span className="text-foreground/70">{doctor.licenceNo}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pl-12 md:pl-0">
          <Button
            variant="outline"
            onClick={() => setIsEditOpen(true)}
            className="shadow-sm"
            size="icon"
          >
            <Edit className="h-4 w-4 text-primary" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDeleteOpen(true)}
            className="shadow-sm"
            size="icon"
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Tabs Layout matching Patient Dashboard */}
      <Card className="border-none shadow-sm overflow-hidden mb-2">
        <div className="px-1 bg-muted/10">
          <nav
            className="flex items-center overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = currentTab === id;
              return (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`
                    group relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all duration-150 whitespace-nowrap
                    ${isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${!isActive && "group-hover:scale-110 transition-transform"}`} />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-primary rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </Card>

      {/* Tab Content */}
      <div className="mt-0">
        {currentTab === "overview" && (
          <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
            <Card className="rounded-2xl shadow-sm border-muted/60 hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-muted/30 pb-4 border-b border-muted/40">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
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

            <Card className="rounded-2xl shadow-sm border-muted/60 hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-muted/30 pb-4 border-b border-muted/40">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
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
          </div>
        )}

        {currentTab === "settings" && (
          <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
            <Card className="rounded-2xl shadow-sm border-muted/60 hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-muted/30 pb-4 border-b border-muted/40">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  Professional
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
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

            <Card className="rounded-2xl shadow-sm border-muted/60 hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-muted/30 pb-4 border-b border-muted/40">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <Settings className="h-5 w-5" />
                  </div>
                  System & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-muted/40">
                  <span className="font-medium">Account Status</span>
                  <Badge
                    variant={doctor.status === 1 ? "default" : "destructive"}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-semibold shadow-sm",
                      doctor.status === 1
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 p-4 rounded-xl bg-muted/20 border border-muted/40">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</p>
                    <p className="text-sm font-semibold">
                      {format(new Date(doctor.createdAt), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-4 rounded-xl bg-muted/20 border border-muted/40">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Modified</p>
                    <p className="text-sm font-semibold">
                      {format(new Date(doctor.updatedAt), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentTab === "appointments" && (
          <Card className="rounded-2xl shadow-sm border-muted/60 hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 pb-4 border-b border-muted/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  Custom Appointment Durations
                </CardTitle>
                <CardDescription className="mt-1">
                  Assign appointment types and customize durations for this specific doctor.
                </CardDescription>
              </div>
              <Button onClick={handleSaveApptTypes} disabled={isSyncingAppointmentTypes} className="rounded-xl shadow-sm gap-2">
                {isSyncingAppointmentTypes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {isMastersLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : masters?.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {masters.map((m) => {
                    const config = doctorApptTypes[m.code] || { enabled: false, duration: m.duration_minutes };
                    return (
                      <div key={m.code} className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl border transition-colors", config.enabled ? "bg-muted/10 border-primary/20 shadow-sm" : "bg-background border-muted")}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {m.color_code && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color_code }}></span>}
                              <h4 className="font-semibold text-sm truncate">{m.name}</h4>
                            </div>
                            {m.description && <p className="text-xs text-muted-foreground truncate">{m.description}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className={cn("flex items-center gap-2 transition-opacity duration-200", config.enabled ? "opacity-100" : "opacity-40 pointer-events-none")}>
                            <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Duration</Label>
                            <div className="relative w-24">
                              <Input
                                type="number"
                                min={1}
                                value={config.duration}
                                onChange={(e) => setDoctorApptTypes(prev => ({ ...prev, [m.code]: { ...prev[m.code], duration: parseInt(e.target.value) || 0 } }))}
                                className="h-8 pl-8 pr-2 rounded-md bg-background text-sm"
                              />
                              <Clock className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                            </div>
                            <span className="text-xs text-muted-foreground">min</span>
                          </div>
                          
                          <div className="w-px h-6 bg-border hidden sm:block"></div>
                          
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) => setDoctorApptTypes(prev => ({ ...prev, [m.code]: { ...prev[m.code], enabled: checked } }))}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-muted rounded-xl bg-muted/10">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground font-medium">No appointment types found. Create them in master settings first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
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
