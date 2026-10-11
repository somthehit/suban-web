"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Camera, CheckCircle2, ArrowLeft } from "lucide-react";

export default function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/customer/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("Forgot password dispatch error:", err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
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
          <h1 className="font-headline text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-2">
            Reset Collector Password
          </h1>
          <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Enter the email address registered with your collector account to receive a secure recovery link.
          </p>
        </div>

        <div className="bg-white dark:bg-[#06180e]/95 border border-slate-200/80 dark:border-[#163e26] rounded-2xl p-7 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-6 transition-colors">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-semibold text-slate-900 dark:text-white text-base">Check Your Inbox</h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                  If an account exists for <strong className="text-emerald-600 dark:text-emerald-400">{email}</strong>, we have dispatched a password reset link. Please check your spam folder if it doesn&apos;t arrive shortly.
                </p>
              </div>
              <Link
                href="/customer/login"
                className="inline-flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1.5 font-semibold">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 font-label font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Sending Link...</span>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/customer/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
