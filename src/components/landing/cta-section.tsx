"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

export function CTASection() {
  const { t } = useT();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-green-700 p-8 text-white sm:p-12">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>এখনই শুরু করুন</span>
          </div>

          <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl max-w-2xl">
            আপনার স্কুলকে ডিজিটাল workflow-এ নিন
          </h2>

          <p className="mt-4 max-w-xl text-base text-white/90">
            প্রথমে attendance register + fee receipt print flow setup করুন,
            তারপর পুরো অফিস process সহজ করুন। ১৪ দিন ফ্রি ট্রায়াল।
          </p>

          {/* Features checkmarks */}
          <div className="mt-6 grid gap-2 sm:grid-cols-2 max-w-lg">
            {[
              "কোনো ক্রেডিট কার্ড নেই",
              "২৪/৭ সাপোর্ট",
              "বিনামূল্যে মাইগ্রেশন",
              "নিয়মিত আপডেট",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="rounded-full bg-white text-primary hover:bg-white/90 px-8 h-12 text-base font-semibold shadow-lg"
            >
              <Link href="/#demo-booking" prefetch={false}>
                ফ্রি ডেমো বুক করুন
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white px-8 h-12 text-base font-semibold backdrop-blur-sm"
            >
              <Link href="/auth/register" prefetch={false}>
                বিনামূল্যে শুরু করুন
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
