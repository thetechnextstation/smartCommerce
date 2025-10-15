"use client";

import { SignIn } from "@clerk/nextjs";
import { Shield, Zap, Lock, Eye } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-8 px-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/50">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Admin Cockpit
              </h1>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">
              Secure access to your smart e-commerce command center. Manage
              products, monitor analytics, and unleash AI-powered features.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  AI-Powered Tools
                </h3>
                <p className="text-slate-400 text-sm">
                  Generate product descriptions, images, and tags with advanced
                  AI
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Real-time Analytics
                </h3>
                <p className="text-slate-400 text-sm">
                  Monitor sales, inventory, and customer behavior instantly
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Enterprise Security
                </h3>
                <p className="text-slate-400 text-sm">
                  Role-based access control with advanced authentication
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="text-2xl font-bold text-indigo-400">99.9%</div>
              <div className="text-xs text-slate-400 mt-1">Uptime</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-xs text-slate-400 mt-1">Support</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">AI</div>
              <div className="text-xs text-slate-400 mt-1">Powered</div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            {/* Mobile header */}
            <div className="md:hidden mb-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/50">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Admin Cockpit
                </h1>
              </div>
              <p className="text-slate-300 text-sm">
                Secure access to your command center
              </p>
            </div>

            {/* Login card */}
            <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Admin Sign In
                </h2>
                <p className="text-slate-400 text-sm">
                  Only authorized administrators can access this area
                </p>
              </div>

              <div className="clerk-wrapper">
                <SignIn
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-transparent shadow-none",

                      headerTitle: "hidden",
                      headerSubtitle: "hidden",

                      socialButtonsBlockButton:
                        "border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-300 rounded-xl h-12 font-medium",

                      socialButtonsBlockButtonText: "text-white font-medium",

                      dividerLine: "bg-white/20",
                      dividerText: "text-slate-400",

                      formButtonPrimary:
                        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 transition-all duration-300 hover:scale-[1.02] rounded-xl h-12",

                      formFieldLabel: "text-slate-300 font-medium",

                      formFieldInput:
                        "bg-white/5 border-2 border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 rounded-xl h-12 transition-all duration-300",

                      footerActionLink:
                        "text-indigo-400 hover:text-indigo-300 font-medium",

                      identityPreviewText: "text-white",
                      identityPreviewEditButton: "text-indigo-400",

                      formHeaderTitle: "text-white text-xl font-bold",
                      formHeaderSubtitle: "text-slate-400",

                      otpCodeFieldInput:
                        "bg-white/5 border-2 border-white/20 text-white focus:border-indigo-400 rounded-lg",

                      formResendCodeLink:
                        "text-indigo-400 hover:text-indigo-300",

                      footer: "hidden",
                    },
                  }}
                />
              </div>

              {/* Admin notice */}
              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-300 text-sm font-medium mb-1">
                      Admin Access Only
                    </p>
                    <p className="text-amber-200/70 text-xs">
                      This area is restricted to users with administrator
                      privileges. All access attempts are logged and monitored.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-slate-500 text-sm">
              <p>© 2025 SmartCommerce. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
