import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudentStatusData {
  active: number;
  inactive: number;
  transferred: number;
  graduated: number;
  total: number;
}

interface StudentStatusWidgetProps {
  data: StudentStatusData;
}

export function StudentStatusWidget({ data }: StudentStatusWidgetProps) {
  const statusConfig = [
    {
      label: "সক্রিয়",
      value: data.active,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "নিষ্ক্রিয়",
      value: data.inactive,
      icon: UserX,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
    {
      label: "ট্রান্সফার",
      value: data.transferred,
      icon: ArrowRight,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "পাস",
      value: data.graduated,
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          শিক্ষার্থী অবস্থা
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center pb-4 border-b border-border/50">
            <p className="text-3xl font-bold">{data.total}</p>
            <p className="text-xs text-muted-foreground">মোট শিক্ষার্থী</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {statusConfig.map((item) => (
              <Link
                key={item.label}
                href="/dashboard/students"
                className="flex items-center gap-2 rounded-lg border border-border/50 p-2 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center`}
                >
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <Link
            href="/dashboard/students"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            সব শিক্ষার্থী দেখুন <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
