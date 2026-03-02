import { Shield, Users, Award, Globe } from "lucide-react";

export function TrustStrip() {
  const stats = [
    {
      label: "স্কুল",
      value: "৫০০+",
      icon: SchoolIcon,
      description: "অনলাইনে",
    },
    {
      label: "শিক্ষার্থী",
      value: "৫০,০০০+",
      icon: Users,
      description: "ম্যানেজ করা হয়",
    },
    {
      label: "সন্তুষ্টি",
      value: "৯৮%",
      icon: Award,
      description: "গ্রাহক সন্তুষ্টি",
    },
    {
      label: "Uptime",
      value: "৯৯.৯%",
      icon: Globe,
      description: "নিরবচ্ছিন্ন সার্ভিস",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.label} {stat.description && `- ${stat.description}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SchoolIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 11v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <path d="M10 11V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" />
      <path d="M4 15v-3a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v3" />
      <line x1="4" x2="20" y1="12" y2="12" />
    </svg>
  );
}
