import Link from 'next/link'
import { HomeIcon, GridIcon } from '@/components/icons'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-lightBg dark:bg-vettr-navy flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-200">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.04)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.03)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.05)_0%,_transparent_50%)]" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* VETTR Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-vettr-accent">V</span>
            <span className="text-gray-900 dark:text-white">ETTR</span>
          </h1>
          <div className="h-1 w-20 bg-vettr-accent mx-auto rounded-full" />
        </div>

        {/* 404 Error */}
        <div className="mb-8">
          <h2 className="text-6xl font-bold text-gray-200 dark:text-white/10 mb-4">404</h2>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pulse"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-vettr-accent text-vettr-navy font-semibold rounded-xl hover:bg-vettr-accent/90 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/stocks"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <GridIcon className="w-4 h-4" />
            Browse Stocks
          </Link>
        </div>
      </div>
    </div>
  )
}
