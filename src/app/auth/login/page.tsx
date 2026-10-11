"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Lock, Mail, ArrowRight, ShieldAlert, Key } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        setError("Invalid email or password. Please verify credentials.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-surface border border-neon-pink/40 flex items-center justify-center">
              <Camera className="w-5 h-5 text-neon-pink" />
            </div>
            <span className="font-headline font-bold text-2xl text-white">SUBAN</span>
          </Link>
          <h2 className="font-headline font-bold text-2xl text-white pt-2">
            Portal Access
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Sign in to access your orders, downloads, or administration suite
          </p>
        </div>

        {/* Login Form Container */}
        <div className="neon-card rounded-2xl p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-neon-pink/10 border border-neon-pink/40 text-neon-pink text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-label uppercase tracking-wider text-gray-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-2.5 rounded-lg text-sm neon-input"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-label uppercase tracking-wider text-gray-400">
                  Password
                </label>
                <a href="#" className="text-xs text-neon-cyan hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-lg text-sm neon-input"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-label text-xs uppercase tracking-wider btn-neon-pink flex items-center justify-center gap-2 font-semibold mt-2 disabled:opacity-50"
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <p className="text-[11px] font-label text-gray-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-neon-yellow" />
              Quick Fill Seed Credentials:
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-label">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@subanphotography.com", "Admin@123456")}
                className="py-1.5 px-2 rounded bg-surface border border-neon-pink/40 text-neon-pink hover:bg-neon-pink/10 transition-colors truncate"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("editor@subanphotography.com", "Editor@123456")}
                className="py-1.5 px-2 rounded bg-surface border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 transition-colors truncate"
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("collector@gmail.com", "Customer@123456")}
                className="py-1.5 px-2 rounded bg-surface border border-white/20 text-gray-300 hover:bg-white/5 transition-colors truncate"
              >
                Customer
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">
          Protected by server-side RBAC session guards.
        </p>
      </div>
    </div>
  );
}
