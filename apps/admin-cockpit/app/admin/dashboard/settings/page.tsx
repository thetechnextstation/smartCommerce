import { AdminCheck } from "../admin-check";
import { SettingsForm } from "./settings-form";
import {
  Settings as SettingsIcon,
  Store,
  Mail,
  CreditCard,
  Webhook,
  Database,
} from "lucide-react";

export default async function SettingsPage() {
  await AdminCheck();

  const settingsSections = [
    {
      id: "general",
      title: "General Settings",
      description: "Store name, description, and basic configuration",
      icon: Store,
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "email",
      title: "Email Configuration",
      description: "SMTP settings and email notifications",
      icon: Mail,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "payments",
      title: "Payment Gateway",
      description: "Stripe and payment method configuration",
      icon: CreditCard,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "webhooks",
      title: "Webhooks & Integrations",
      description: "n8n workflows and external services",
      icon: Webhook,
      color: "from-orange-500 to-red-600",
    },
    {
      id: "database",
      title: "Database & Backup",
      description: "Database connection and backup settings",
      icon: Database,
      color: "from-indigo-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-slate-400">
          Configure your store and manage integrations
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => (
          <div
            key={section.id}
            className="group relative rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-white/20 p-6 transition-all duration-300 cursor-pointer"
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            ></div>

            <div className="relative">
              {/* Icon */}
              <div
                className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${section.color} shadow-lg mb-4`}
              >
                <section.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-2">
                {section.title}
              </h3>
              <p className="text-slate-400 text-sm">{section.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Settings Form */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
        <SettingsForm />
      </div>

      {/* Environment Variables Info */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
        <h3 className="text-lg font-semibold text-amber-300 mb-3">
          Environment Variables
        </h3>
        <div className="space-y-2 text-slate-300 text-sm">
          <p>
            Many settings are configured through environment variables in your .env file:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 font-mono text-xs">
            <li>DATABASE_URL - Neon PostgreSQL connection</li>
            <li>CLERK_SECRET_KEY - Authentication</li>
            <li>STRIPE_SECRET_KEY - Payment processing</li>
            <li>ANTHROPIC_API_KEY - AI features</li>
            <li>CLOUDINARY_API_SECRET - Image management</li>
            <li>N8N_WEBHOOK_* - Automation workflows</li>
          </ul>
          <p className="mt-4 text-amber-200">
            ⚠️ Never commit your .env file to version control. Always use .env.example for
            templates.
          </p>
        </div>
      </div>
    </div>
  );
}
