"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, ShieldCheck, Camera, Sparkles } from "lucide-react";

export default function CustomerRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/customer/login?registered=true");
      } else {
        router.push("/account");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/account" });
  };

  return (
    <div className="min-h-screen bg-[#f6f9f7] dark:bg-[#020d06] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
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
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>COLLECTOR ENROLLMENT</span>
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Join the Collector Circle
          </h1>
          <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Create an account to acquire limited edition prints, license RAW assets, and manage private certificates.
          </p>
        </div>

        {/* Auth Container Card */}
        <div className="bg-white dark:bg-[#06180e]/95 border border-slate-200/80 dark:border-[#163e26] rounded-2xl p-7 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-6 transition-colors">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Continue with Google */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-white text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? "Connecting to Google..." : "Enroll with Google"}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 border-t border-slate-200 dark:border-[#163e26]" />
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-mono shrink-0">
              or register with email
            </span>
            <div className="flex-1 border-t border-slate-200 dark:border-[#163e26]" />
          </div>

          {/* 2. Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1.5 font-semibold">
                Full Name / Collector Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600/30 dark:focus:ring-emerald-500/40 transition-all font-sans"
                />
                <User className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1.5 font-semibold">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collector@domain.com"
                  className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600/30 dark:focus:ring-emerald-500/40 transition-all font-sans"
                />
                <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1.5 font-semibold">
                Choose Password (min. 8 characters)
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

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="newsletter"
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="newsletter" className="text-xs text-slate-600 dark:text-neutral-400 cursor-pointer leading-tight">
                Receive private gallery invitations and early access to limited edition print drops.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 font-label font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Enrolling Account...</span>
                </>
              ) : (
                <>
                  <span>Create Collector Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#163e26] text-center">
            <p className="text-xs text-slate-600 dark:text-neutral-400">
              Already have a collector account?{" "}
              <Link
                href="/customer/login"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold underline underline-offset-4 ml-1"
              >
                Sign In →
              </Link>
            </p>
          </div>
        </div>

        {/* Fine Art Guarantee Footnote */}
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-neutral-500 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600/80 dark:text-emerald-500/60" />
          <span>Encrypted Credentials • Strict Privacy • Zero Spam</span>
        </div>
      </div>
    </div>
  );
}
