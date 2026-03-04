import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { BookingModal } from "@/components/booking-modal"
import './globals.css'

const _inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const _poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: 'Patil Multispeciality Hospital, Wardha | Advanced Healthcare',
  description:
    'Patil Multispeciality Hospital in Wardha provides advanced healthcare with experienced doctors in Orthopedics, Cardiology, Gynecology, Pediatrics, General Medicine & Diagnostics. 24/7 Emergency services available.',
  keywords: [
    'hospital',
    'Wardha',
    'multispeciality',
    'Patil hospital',
    'healthcare',
    'orthopedics',
    'cardiology',
    'gynecology',
    'pediatrics',
  ],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a56db',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
<body
  className={`${_inter.variable} ${_poppins.variable} font-sans antialiased`}
>
  {children}

  <BookingModal />

  <Analytics />
</body>
    </html>
  )
}
