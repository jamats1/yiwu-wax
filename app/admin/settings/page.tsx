"use client";

import { Bell, Globe, Database, Key, Info } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [saved] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Dashboard configuration and preferences
        </p>
      </div>

      {saved && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          Settings saved successfully.
        </div>
      )}

      {/* Analytics Configuration */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-zinc-400" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Analytics Sources
            </h2>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                Google Analytics
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Connected via{" "}
                <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
                  NEXT_PUBLIC_GA_ID
                </code>
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                Meta Pixel
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Two pixels configured
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                Microsoft Clarity
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Session recording
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Cart Recovery */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-zinc-400" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Cart Recovery
            </h2>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                Email Recovery
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Opens email client with pre-filled message
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
              Enabled
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                WhatsApp Recovery
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Opens WhatsApp with pre-filled message
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
              Enabled
            </span>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            <Info className="mr-1 inline h-3 w-3" />
            For automated email sending (without opening email client), integrate
            with Resend, SendGrid, or AWS SES.
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-zinc-400" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Data Storage
            </h2>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              Page Views & Cart Events
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Stored as documents in Sanity CMS. View and manage in{" "}
              <a
                href="/studio"
                target="_blank"
                className="text-green-700 hover:underline dark:text-green-400"
              >
                Sanity Studio
              </a>
              .
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              Data Retention
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Dashboard defaults to 30-day rolling window. Adjust the{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
                ?days=N
              </code>{" "}
              parameter in API calls for custom ranges.
            </p>
          </div>
        </div>
      </div>

      {/* Required Env Vars */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-zinc-400" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Optional Environment Variables
            </h2>
          </div>
        </div>
        <div className="space-y-3 p-6">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
              ADMIN_CLERK_ALLOW_ALL=true
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Allow any signed-in Clerk user to access /admin
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
              ADMIN_CLERK_EMAILS=admin@store.com
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Comma-separated list of admin emails
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
              GA4_MEASUREMENT_ID=G-XXXXXXXXXX
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Server-side GA4 tracking (Measurement Protocol)
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
              GA4_API_SECRET=your_api_secret
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              GA4 Measurement Protocol API secret
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
              META_ACCESS_TOKEN=your_token
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Meta Conversions API access token
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
