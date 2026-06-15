import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Handyman Pro Dashboard',
  description: 'Manage bookings, payments, and handymen services.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
