import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventItem {
  id: string;
  title: string;
  startDate: Date;
  type: string;
  location?: string | null;
}

interface UpcomingEventsProps {
  events: EventItem[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <section className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-purple-500" />
          Upcoming Events
        </h2>
        <Link
          href="/dashboard/events"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-2 flex-1 relative z-10">
        {events.length ? (
          events.slice(0, 4).map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events`}
              className="relative flex items-start gap-3 rounded-xl border border-border/30 bg-muted/20 p-3 hover:bg-muted/50 transition-all group/event"
            >
              <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <span className="text-xs font-bold">
                  {new Date(event.startDate).getDate()}
                </span>
                <span className="text-[9px] uppercase">
                  {new Date(event.startDate).toLocaleString("default", {
                    month: "short",
                  })}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover/event:text-primary transition-colors">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {event.type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(event.startDate)}
                  </span>
                </div>
              </div>

              <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover/event:opacity-100 transition-opacity" />
            </Link>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-xl bg-muted/10">
            <CalendarDays className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              No upcoming events
            </p>
            <Button variant="outline" size="sm" asChild className="mt-3">
              <Link href="/dashboard/events">Add Event</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
