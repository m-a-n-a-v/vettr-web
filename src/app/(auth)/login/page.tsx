'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-lightBg dark:bg-vettr-navy transition-colors duration-200">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.04)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.03)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.05)_0%,_transparent_50%)]" />

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left side — Branding (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:px-12">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              <span className="text-vettr-accent">V</span>ETTR
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Canadian Small-Cap Stock Analysis
            </p>
            <p className="mt-6 text-gray-500 dark:text-gray-400 leading-relaxed">
              Gain insight into emerging Canadian companies with our comprehensive analysis
              platform.
            </p>
          </div>
        </div>

        {/* Right side — Clerk SignIn */}
        <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 text-center lg:hidden">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                <span className="text-vettr-accent">V</span>ETTR
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Canadian Small-Cap Stock Analysis
              </p>
            </div>

            <SignIn
              routing="hash"
              signUpUrl="/signup"
              fallbackRedirectUrl="/pulse"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-white dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-none',
                  headerTitle: 'text-gray-900 dark:text-white',
                  headerSubtitle: 'text-gray-500 dark:text-gray-400',
                  socialButtonsBlockButton:
                    'border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10',
                  dividerLine: 'bg-gray-200 dark:bg-white/10',
                  dividerText: 'text-gray-400 dark:text-gray-500',
                  formFieldLabel: 'text-gray-900 dark:text-white',
                  formFieldInput:
                    'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-vettr-accent/50 focus:ring-vettr-accent/20',
                  formButtonPrimary:
                    'bg-vettr-accent text-vettr-navy hover:bg-vettr-accent/90 font-semibold',
                  footerActionLink: 'text-vettr-accent hover:text-vettr-accent/80',
                  identityPreviewText: 'text-gray-900 dark:text-white',
                  identityPreviewEditButton: 'text-vettr-accent',
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
