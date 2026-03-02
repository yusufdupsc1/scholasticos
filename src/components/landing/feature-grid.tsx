"use client";

import {
  CreditCard,
  FileText,
  MessageSquareText,
  CalendarCheck,
  Users,
  GraduationCap,
  BarChart3,
  Shield,
  Clock,
  CloudDownload,
} from "lucide-react";
import { useT } from "@/lib/i18n/client";

export function FeatureGrid() {
  const { t } = useT();

  const featureItems = [
    {
      title: "ডিজিটাল উপস্থিতি",
      description:
        "মোবাইল বা ট্যাবলেটে attendance নিন। auto-report generation।",
      icon: CalendarCheck,
      color: "bg-blue-500",
    },
    {
      title: "ফি রিসিট প্রিন্ট",
      description: "অটমেটিক receipt generate করুন। multiple payment methods।",
      icon: CreditCard,
      color: "bg-green-500",
    },
    {
      title: "রেজাল্ট কার্ড",
      description: "auto-grading সহ professional result sheet তৈরি করুন।",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "SMS নোটিশ",
      description: "অভিভাবকদের instant notification পাঠান।",
      icon: MessageSquareText,
      color: "bg-orange-500",
    },
    {
      title: "শিক্ষার্থী ম্যানেজমেন্ট",
      description: "complete student profile with admission, transfer, etc.",
      icon: Users,
      color: "bg-pink-500",
    },
    {
      title: "অ্যানালিটিক্স",
      description:
        "Real-time insights and custom reports for better decisions.",
      icon: BarChart3,
      color: "bg-indigo-500",
    },
  ];

  return (
    <section
      id="features"
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6"
    >
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
          সব প্রয়োজনীয় <span className="text-primary">ফিচার</span>
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
          আধুনিক স্কুল ম্যানেজমেন্টের জন্য সবকিছু এক জায়গায়। attendance থেকে
          payment, result থেকে analytics।
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featureItems.map((item, index) => (
          <article
            key={item.title}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div
                className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Arrow indicator */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
