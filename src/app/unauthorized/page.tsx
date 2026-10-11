import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="neon-card max-w-md w-full p-8 rounded-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-neon-pink/10 border border-neon-pink/40 flex items-center justify-center mx-auto text-neon-pink">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-label text-neon-pink uppercase tracking-widest">
            403 • Access Denied
          </span>
          <h1 className="font-headline font-bold text-2xl text-white">
            Insufficient RBAC Clearance
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your current account does not have administrative privileges to view this section.
            Please sign in with an EDITOR, ADMIN, or SUPER_ADMIN account.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/internal/auth/login?callbackUrl=/admin"
            className="w-full py-2.5 rounded-lg font-label text-xs uppercase tracking-wider btn-neon-pink font-semibold shadow-md"
          >
            Sign In with Staff Account
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 rounded-lg font-label text-xs uppercase tracking-wider bg-surface border border-outline-variant/30 hover:border-outline-variant/60 text-on-surface-variant flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
