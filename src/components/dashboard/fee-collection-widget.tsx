import Link from "next/link";
import {
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  Wallet,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeeData {
  collected: number;
  pending: number;
  overdue: number;
  totalStudents: number;
}

interface FeeCollectionWidgetProps {
  data: FeeData;
}

export function FeeCollectionWidget({ data }: FeeCollectionWidgetProps) {
  const collectionRate =
    data.collected + data.pending > 0
      ? Math.round((data.collected / (data.collected + data.pending)) * 100)
      : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          ফি সংগ্রহ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              ৳{data.collected.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">সংগ্রহিত (এই মাসে)</p>
          </div>

          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <Wallet className="h-4 w-4 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-amber-700">
                ৳{data.pending.toLocaleString()}
              </p>
              <p className="text-[10px] text-amber-600">বকেয়া</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-center">
              <Receipt className="h-4 w-4 text-red-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-700">{data.overdue}</p>
              <p className="text-[10px] text-red-600">জরিমানা</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <Link
            href="/dashboard/finance"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            বিস্তারিত দেখুন <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
