import { useQuery } from "@tanstack/react-query";
import { appointmentService } from "../services/appointment.service";
import type { AppointmentFilters } from "../types/appointment.types";

interface AppointmentDashboardStatsProps {
  filters: AppointmentFilters;
}

export function AppointmentDashboardStats({ filters }: AppointmentDashboardStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["appointment-stats", filters],
    queryFn: () => appointmentService.getDashboardStats(filters),
  });

  const getStat = (status: string) => stats?.[status] || 0;

  const statItems = [
    { label: "Scheduled", value: getStat("SCHEDULED"), isActive: true },
    { label: "Checked-in", value: getStat("CHECKED-IN") },
    { label: "Checked-out", value: getStat("CHECKED-OUT") },
    { label: "Wait List", value: getStat("WAIT LIST") },
  ];

  return (
    <div className="flex items-center gap-2 mb-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className={`flex flex-col items-center justify-center border bg-card w-24 h-16 rounded-md shadow-sm transition-colors ${
            item.isActive ? "border-t-4 border-t-orange-500" : "border-gray-200 dark:border-gray-800"
          }`}
        >
          {isLoading ? (
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-1" />
          ) : (
            <span className="text-xl font-medium text-foreground leading-none mb-1">
              {item.value}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
