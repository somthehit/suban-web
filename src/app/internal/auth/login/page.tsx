"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ShieldAlert,
  KeyRound,
  Terminal,
  Eye,
  EyeOff,
  ArrowLeft,
  Camera,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function InternalAdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid administrative credentials or insufficient clearance.");
        setLoading(false);
        return;
      }

      // Check session status / role by fetching /api/auth/session
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "EDITOR") {
        setError("Access Denied: Your account does not have administrative clearance.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Secure gateway connection error. Please verify authentication service.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-gateway-canvas min-h-screen flex flex-col justify-between items-center py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none transition-colors duration-300">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-50">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-emerald-400/20 via-teal-400/10 to-transparent dark:from-emerald-500/15 dark:via-teal-500/10 dark:to-transparent rounded-full blur-[140px]" />
      </div>

      {/* Top Utility Header: Navigation & Theme Toggle */}
      <header className="w-full max-w-4xl flex items-center justify-between z-20 py-2">
        <Link
          href="/"
          className="admin-gateway-navlink inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium shadow-xs backdrop-blur-md transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Public Gallery</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="pill" className="backdrop-blur-md" />
        </div>
      </header>

      {/* Center Auth Card */}
      <div className="w-full max-w-md my-auto space-y-6 relative z-10 py-6">
        {/* Terminal & Brand Header */}
        <div className="text-center space-y-3">
          <div className="admin-gateway-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono tracking-widest uppercase shadow-xs">
            <Terminal className="w-3.5 h-3.5" />
            <span>SUBAN STUDIO • INTERNAL GATEWAY</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <span className="admin-gateway-heading font-headline font-extrabold text-2xl tracking-wider">
              SUBAN CMS
            </span>
          </div>

          <h1 className="admin-gateway-heading font-headline font-bold text-lg sm:text-xl tracking-tight flex items-center justify-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-500" />
            <span>Administrative Authentication</span>
          </h1>

          <p className="admin-gateway-subtext text-xs max-w-sm mx-auto leading-relaxed">
            Restricted staff access. Unauthorised connection attempts are logged with client fingerprinting.
          </p>
        </div>

        {/* Security Login Card */}
        <div className="admin-gateway-card rounded-2xl backdrop-blur-2xl p-7 sm:p-8 space-y-6 transition-colors duration-300">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-500 dark:text-red-300 text-xs flex items-start gap-2.5 shadow-xs">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="admin-gateway-label block text-[11px] font-mono uppercase tracking-widest mb-1.5 font-bold">
                Staff Identity / Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@subanphotography.com"
                  autoComplete="username"
                  className="admin-gateway-input w-full px-4 py-2.5 pl-10 rounded-xl text-sm focus:outline-none transition-all font-mono"
                />
                <Mail className="w-4 h-4 admin-gateway-subtext absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="admin-gateway-label block text-[11px] font-mono uppercase tracking-widest mb-1.5 font-bold">
                Master Passphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  autoComplete="current-password"
                  className="admin-gateway-input w-full px-4 py-2.5 pl-10 pr-10 rounded-xl text-sm focus:outline-none transition-all font-mono"
                />
                <Lock className="w-4 h-4 admin-gateway-subtext absolute left-3.5 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 admin-gateway-subtext hover:text-emerald-500 cursor-pointer p-0.5 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-gateway-btn w-full py-3 px-4 rounded-xl font-label font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Clearance...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Studio Session</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200/50 dark:border-[#163e26]/80 flex items-center justify-between text-[11px] admin-gateway-subtext font-mono">
            <span>TLS 1.3 End-to-End</span>
            <span>Zero Public Enrollment</span>
          </div>
        </div>

        {/* Security Credential Prompt / Note */}
        <div className="admin-gateway-pill-footer p-3.5 rounded-xl text-[11px] text-center flex items-center justify-center gap-2 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Biometric & MFA Token Security Enabled</span>
        </div>
      </div>

      {/* Footer Infrastructure Notice */}
      <footer className="w-full max-w-md text-center py-2 z-10">
        <p className="admin-gateway-subtext text-[11px] font-mono">
          SUBAN DAHIT Wildlife Photography Studio • Internal Control Infrastructure
        </p>
      </footer>
    </div>
  );
}
