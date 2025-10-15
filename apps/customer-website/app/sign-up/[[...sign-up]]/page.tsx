import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, Shield, Gift, Star, Heart, Percent } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
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
              Join the
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Smart Shopping Revolution
              </span>
            </h2>

            <p className="text-xl text-slate-300 max-w-lg">
              Experience the future of online shopping with AI-powered features,
              personalized recommendations, and exclusive benefits.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm">
              <Gift className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">Welcome Rewards</h3>
              <p className="text-sm text-slate-400">Get instant discounts on first purchase</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 backdrop-blur-sm">
              <Star className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">AI Recommendations</h3>
              <p className="text-sm text-slate-400">Personalized product suggestions</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-white/10 backdrop-blur-sm">
              <Percent className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">Price Alerts</h3>
              <p className="text-sm text-slate-400">Never miss a price drop</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-white/10 backdrop-blur-sm">
              <Heart className="w-8 h-8 text-rose-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">Smart Wishlist</h3>
              <p className="text-sm text-slate-400">Save & track your favorites</p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center gap-4 pt-8">
            <Shield className="w-10 h-10 text-green-400" />
            <div>
              <h3 className="font-semibold text-white">Secure & Private</h3>
              <p className="text-sm text-slate-400">
                Your data is encrypted and protected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 pt-4 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
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

        {/* Sign Up Card */}
        <div className="w-full max-w-md mt-16 lg:mt-0">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-slate-400">
                Start your smart shopping journey today
              </p>
            </div>

            {/* Clerk Sign Up Component */}
            <div className="clerk-wrapper">
              <SignUp
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

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-slate-400">
            <p>
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Trust Badge */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Join 50,000+ happy shoppers who trust SmartCommerce
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
