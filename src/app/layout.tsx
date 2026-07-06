import './globals.css'
import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Handyman Pro — Admin Dashboard',
  description: 'Manage bookings, providers, services, customers, and payments for Handyman Pro.',
  keywords: 'handyman, booking, admin, dashboard, services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen antialiased font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
