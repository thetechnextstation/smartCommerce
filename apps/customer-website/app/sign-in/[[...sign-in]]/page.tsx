import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, ShoppingBag, Zap, TrendingUp } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <Link href="/" className="flex items-center gap-3 group">
            <Sparkles className="w-12 h-12 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SmartCommerce
            </h1>
          </Link>

          <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Welcome back to the
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Future of Shopping
              </span>
            </h2>

            <p className="text-xl text-slate-300 max-w-lg">
              Continue your journey with AI-powered shopping, personalized recommendations,
              and smart price tracking.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4 pt-8">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Semantic Search</h3>
                <p className="text-sm text-slate-400">Find products using natural language</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Smart Price Alerts</h3>
                <p className="text-sm text-slate-400">Never miss a deal on your favorites</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Bargaining</h3>
                <p className="text-sm text-slate-400">Get the best possible prices</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-slate-400">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-sm text-slate-400">AI Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-slate-400">Price Tracking</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SmartCommerce
            </h1>
          </Link>
        </div>

        {/* Sign In Card */}
        <div className="w-full max-w-md mt-16 lg:mt-0">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-slate-400">
                Access your personalized shopping experience
              </p>
            </div>

            {/* Clerk Sign In Component */}
            <div className="clerk-wrapper">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none w-full",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",

                    // Primary button styling
                    formButtonPrimary:
                      "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 transition-all duration-300 hover:scale-[1.02] rounded-xl h-12",

                    // Social buttons
                    socialButtonsBlockButton:
                      "border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-300 rounded-xl h-12 font-medium",
                    socialButtonsBlockButtonText: "text-white font-medium",
                    socialButtonsIconButton: "border-white/20 bg-white/5 hover:bg-white/10",

                    // Input fields
                    formFieldInput:
                      "bg-white/5 border-2 border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 rounded-xl h-12 transition-all duration-300",
                    formFieldLabel: "text-slate-300 font-medium mb-2",

                    // Links
                    footerActionLink: "text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-4 hover:underline",
                    formFieldAction: "text-indigo-400 hover:text-indigo-300",

                    // Additional elements
                    identityPreviewEditButtonIcon: "text-white",
                    formFieldInputShowPasswordButton: "text-slate-400 hover:text-white",
                    dividerLine: "bg-white/20",
                    dividerText: "text-slate-400 text-sm",
                    otpCodeFieldInput: "border-2 border-white/20 bg-white/5 text-white rounded-lg",
                    formResendCodeLink: "text-indigo-400 hover:text-indigo-300 font-semibold",

                    // Alert/Error messages
                    formFieldErrorText: "text-red-400 text-sm",
                    formFieldSuccessText: "text-green-400 text-sm",
                    alertText: "text-white",

                    // Form spacing
                    form: "space-y-4",
                    formFieldRow: "space-y-2",
                  },
                  layout: {
                    socialButtonsPlacement: "bottom",
                    socialButtonsVariant: "blockButton",
                  },
                }}
              />
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Don't have an account?{" "}
                <Link
                  href="/sign-up"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-slate-400">
            <p>
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
