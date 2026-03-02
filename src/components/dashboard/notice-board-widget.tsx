import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, ArrowUpRight, Megaphone, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: Date;
}

interface NoticeBoardWidgetProps {
  notices: Notice[];
}

const priorityConfig: Record<
  string,
  { color: string; bg: string; icon: React.ElementType }
> = {
  HIGH: { color: "text-red-600", bg: "bg-red-100", icon: AlertCircle },
  MEDIUM: { color: "text-amber-600", bg: "bg-amber-100", icon: Megaphone },
  LOW: { color: "text-blue-600", bg: "bg-blue-100", icon: Info },
};

export function NoticeBoardWidget({ notices }: NoticeBoardWidgetProps) {
  const recentNotices = notices.slice(0, 4);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          সাম্প্রতিক নোটিশ
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentNotices.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">কোনো নোটিশ নেই</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotices.map((notice) => {
              const config =
                priorityConfig[notice.priority] || priorityConfig.LOW;
              const Icon = config.icon;

              return (
                <Link
                  key={notice.id}
                  href="/dashboard/announcements"
                  className="block rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {notice.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {notice.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notice.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border/50">
          <Link
            href="/dashboard/announcements"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            সব নোটিশ দেখুন <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
