import { Calendar, Clock, FileText, CheckCircle2 } from "lucide-react";

interface StatusCountCardsProps {
  counts: {
    scheduled: number;
    pending: number;
    notesGenerated: number;
    postedToEHR: number;
  };
  isLoading?: boolean;
}

const statusCards = [
  {
    key: "scheduled" as const,
    label: "Scheduled",
    icon: Calendar,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  {
    key: "pending" as const,
    label: "Pending",
    icon: Clock,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  {
    key: "notesGenerated" as const,
    label: "Notes Generated",
    icon: FileText,
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-600",
    textColor: "text-purple-700 dark:text-purple-300",
  },
  {
    key: "postedToEHR" as const,
    label: "Posted to EHR",
    icon: CheckCircle2,
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
];

export function StatusCountCards({ counts, isLoading }: StatusCountCardsProps) {
  return (
    <div className="flex items-center gap-2">
      {statusCards.map((card) => {
        const Icon = card.icon;
        const count = counts[card.key];

        return (
          <div
            key={card.key}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${card.bgColor} transition-all hover:shadow-sm`}
          >
            <div
              className={`h-7 w-7 rounded-full ${card.iconBg} flex items-center justify-center`}
            >
              <Icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-bold leading-none ${card.textColor}`}>
                {isLoading ? "–" : count}
              </span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {card.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusCountCards;
