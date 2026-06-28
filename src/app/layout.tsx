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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: read theme from localStorage before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
