"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck, KeyRound, Camera } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/account";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/customer/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to set password. Please try again.");
        setLoading(false);
        return;
      }

      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("Network or server error. Please try again.");
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push(nextUrl);
  };

  return (
    <div className="min-h-screen bg-[#f6f9f7] dark:bg-[#020d06] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#081e12] border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shadow-sm">
              <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-headline font-bold text-2xl tracking-wider text-slate-900 dark:text-white">
              SUBAN
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono tracking-widest uppercase">
            <KeyRound className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>ACCOUNT COMPLETION</span>
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Set Your Website Password
          </h1>
          <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Create a custom password for your SUBAN account. This gives you the flexibility to sign in anytime with either Google or email &amp; password.
          </p>
        </div>

        <div className="bg-white dark:bg-[#06180e]/95 border border-slate-200/80 dark:border-[#163e26] rounded-2xl p-7 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-6 transition-colors">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1.5 font-semibold">
                Create Password (min. 8 characters)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600/30 dark:focus:ring-emerald-500/40 transition-all font-sans"
                />
                <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1.5 font-semibold">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600/30 dark:focus:ring-emerald-500/40 transition-all font-sans"
                />
                <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 font-label font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving Password...</span>
                </>
              ) : (
                <>
                  <span>Save Password &amp; Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200 dark:border-[#163e26] text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
            >
              Skip for now (I will sign in with Google) →
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-neutral-500 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600/80 dark:text-emerald-500/60" />
          <span>Encrypted with bcrypt (10 rounds) • Private &amp; Secure</span>
        </div>
      </div>
    </div>
  );
}
