import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Clock,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClassStats {
  name: string;
  studentCount: number;
  attendanceRate: number;
  avgGrade: number;
}

interface ClassOverviewWidgetProps {
  classes: ClassStats[];
}

export function ClassOverviewWidget({ classes }: ClassOverviewWidgetProps) {
  const sortedByAttendance = [...classes].sort(
    (a, b) => b.attendanceRate - a.attendanceRate,
  );
  const topClass = sortedByAttendance[0];
  const needsAttention = sortedByAttendance[sortedByAttendance.length - 1];

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          শ্রেণি ভিত্তিক অবস্থা
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {classes.slice(0, 3).map((cls) => (
            <Link
              key={cls.name}
              href={`/dashboard/classes`}
              className="rounded-xl border border-border/50 bg-muted/30 p-3 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{cls.name}</span>
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{cls.studentCount}</span>
                <div
                  className={`flex items-center gap-1 text-xs ${cls.attendanceRate >= 90 ? "text-green-600" : cls.attendanceRate >= 75 ? "text-amber-600" : "text-red-600"}`}
                >
                  {cls.attendanceRate >= 90 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {cls.attendanceRate}%
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">সেরা শ্রেণি</p>
              <p className="font-semibold text-sm">{topClass?.name || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">মনোযোগ দরকার</p>
              <p className="font-semibold text-sm">
                {needsAttention?.name || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
