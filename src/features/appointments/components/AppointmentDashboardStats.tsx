import { useQuery } from "@tanstack/react-query";
import { appointmentService } from "../services/appointment.service";
import type { AppointmentFilters } from "../types/appointment.types";

interface AppointmentDashboardStatsProps {
  filters: AppointmentFilters;
  onCardClick?: (status: string) => void;
}

export function AppointmentDashboardStats({ filters, onCardClick }: AppointmentDashboardStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["appointment-stats", filters],
    queryFn: () => appointmentService.getDashboardStats(filters),
  });

  const getStat = (status: string) => stats?.[status] || 0;

  const statItems = [
    { label: "Scheduled", value: getStat("SCHEDULED"), statusValue: "SCHEDULED", 
      baseClass: "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20",
      activeClass: "bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/50 shadow-md",
      textClass: "text-blue-700 dark:text-blue-400" },
    { label: "Checked-in", value: getStat("CHECKED-IN"), statusValue: "CHECKED-IN", 
      baseClass: "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
      activeClass: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/50 shadow-md",
      textClass: "text-emerald-700 dark:text-emerald-400" },
    { label: "Checked-out", value: getStat("CHECKED-OUT"), statusValue: "CHECKED-OUT", 
      baseClass: "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/50",
      activeClass: "bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-600 ring-2 ring-slate-500/50 shadow-md",
      textClass: "text-slate-700 dark:text-slate-400" },
    { label: "Cancelled", value: getStat("CANCELLED"), statusValue: "CANCELLED", 
      baseClass: "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20",
      activeClass: "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600 ring-2 ring-red-500/50 shadow-md",
      textClass: "text-red-700 dark:text-red-400" },
  ];

  return (
    <div className="flex items-center gap-2">
      {statItems.map((item) => {
        const isActive = filters.status === item.statusValue;
        return (
          <div
            key={item.label}
            onClick={() => onCardClick?.(item.statusValue)}
            className={`flex flex-col items-center justify-center border w-22 px-3 h-14 rounded-md transition-all cursor-pointer ${
              isActive ? item.activeClass : item.baseClass
            }`}
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin mb-0.5" />
            ) : (
              <span className={`text-lg font-bold leading-none mb-0.5 ${item.textClass}`}>
                {item.value}
              </span>
            )}
            <span className={`text-[9px] font-semibold uppercase tracking-wider ${item.textClass} opacity-80`}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
