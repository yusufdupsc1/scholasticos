import Link from "next/link";
import { Users, UserCheck, UserX, BookOpen, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeacherStatusData {
  active: number;
  onLeave: number;
  total: number;
}

interface TeacherStatusWidgetProps {
  data: TeacherStatusData;
}

export function TeacherStatusWidget({ data }: TeacherStatusWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          শিক্ষক অবস্থা
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center pb-4 border-b border-border/50">
            <p className="text-3xl font-bold">{data.total}</p>
            <p className="text-xs text-muted-foreground">মোট শিক্ষক</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/teachers"
              className="flex items-center gap-2 rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{data.active}</p>
                <p className="text-[10px] text-muted-foreground">সক্রিয়</p>
              </div>
            </Link>

            <Link
              href="/dashboard/teachers"
              className="flex items-center gap-2 rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <UserX className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{data.onLeave}</p>
                <p className="text-[10px] text-muted-foreground">ছুটিতে</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <Link
            href="/dashboard/teachers"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            সব শিক্ষক দেখুন <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
