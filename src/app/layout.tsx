import './globals.css'
import type { Metadata } from 'next'

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
