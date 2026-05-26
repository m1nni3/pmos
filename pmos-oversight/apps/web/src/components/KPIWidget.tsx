import type { LucideIcon } from "lucide-react";

interface KPIWidgetProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: { direction: "up" | "down"; label: string };
}

export default function KPIWidget({ title, value, icon: Icon, trend }: KPIWidgetProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
              {trend.label}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-brand-50 p-3">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
      </div>
    </div>
  );
}
