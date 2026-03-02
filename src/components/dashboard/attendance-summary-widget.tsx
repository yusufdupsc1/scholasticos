import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface AttendanceSummaryWidgetProps {
  data: AttendanceSummary;
}

export function AttendanceSummaryWidget({
  data,
}: AttendanceSummaryWidgetProps) {
  const presentPercent =
    data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
  const absentPercent =
    data.total > 0 ? Math.round((data.absent / data.total) * 100) : 0;
  const latePercent =
    data.total > 0 ? Math.round((data.late / data.total) * 100) : 0;

  const statusConfig = [
    {
      label: "উপস্থিত",
      value: data.present,
      percent: presentPercent,
      color: "bg-green-500",
      icon: CheckCircle2,
      trend: "+5%",
    },
    {
      label: "অনুপস্থিত",
      value: data.absent,
      percent: absentPercent,
      color: "bg-red-500",
      icon: XCircle,
      trend: "-2%",
    },
    {
      label: "বিলম্বিত",
      value: data.late,
      percent: latePercent,
      color: "bg-amber-500",
      icon: Clock,
      trend: "+1%",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          আজকের উপস্থিতি
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusConfig.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${item.color}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm font-bold">{item.value}</span>
                </div>
                <div className="h-2 mt-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
              <span
                className={`text-xs ${item.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}
              >
                {item.trend}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <Link
            href="/dashboard/attendance"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            বিস্তারিত দেখুন <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
