import { LockKeyhole, ShieldCheck } from "lucide-react";
import { ownerSignInAction } from "@/server/actions/owner-auth";

export function SuperAdminAccess() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-8">
      <div
        id="owner-signin"
        className="rounded-2xl border border-[#006a4e]/20 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#006a4e]">
              Owner Control Access
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              সুপার অ্যাডমিন সাইন-ইন (মন্ত্রণালয় নিয়ন্ত্রিত)
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#006a4e]/25 bg-[#f2faf7] px-3 py-1 text-xs font-semibold text-[#006a4e]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Ministry Authority Only
          </span>
        </div>

        <p className="mb-4 text-sm text-slate-700">
          কেবল অনুমোদিত মালিক-স্তরের অ্যাকাউন্ট এই কনসোলে প্রবেশ করতে পারবে।
          সফল লগইনের পর সরাসরি Owner Dashboard-এ নেওয়া হবে।
        </p>

        <form action={ownerSignInAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            name="username"
            autoComplete="username"
            defaultValue="Yusuf_Ali"
            aria-label="Owner username"
            className="h-11 rounded-md border border-[#006a4e]/25 bg-white px-3 text-sm outline-none ring-offset-1 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20"
            placeholder="Owner username"
            required
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            aria-label="Owner password"
            className="h-11 rounded-md border border-[#006a4e]/25 bg-white px-3 text-sm outline-none ring-offset-1 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20"
            placeholder="Owner password"
            required
          />
          <button
            type="submit"
            className="primary-cta inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-bold"
          >
            <LockKeyhole className="mr-2 h-4 w-4" />
            Owner Sign In
          </button>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
        </form>
      </div>
    </section>
  );
}
