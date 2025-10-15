"use client";

import { ShieldAlert, Home, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-red-500/20 shadow-2xl p-12">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl border border-red-500/30">
              <ShieldAlert className="w-16 h-16 text-red-400" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <p className="text-xl text-red-300 mb-4">
              Unauthorized Access Attempt
            </p>
            <p className="text-slate-400 max-w-md mx-auto">
              You do not have the required administrator privileges to access
              this area. This incident has been logged for security purposes.
            </p>
          </div>

          {/* Error details */}
          <div className="mb-8 p-6 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status Code:</span>
                <span className="text-red-300 font-mono">403 Forbidden</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Required Role:</span>
                <span className="text-red-300 font-mono">ADMIN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-red-300 font-mono">
                  {new Date().toISOString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(process.env.NEXT_PUBLIC_CUSTOMER_URL || "http://localhost:3000")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white rounded-xl font-medium transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              Go to Store
            </button>

            <button
              onClick={() => signOut()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-medium shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>

          {/* Help text */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              If you believe this is an error, please contact your system
              administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
