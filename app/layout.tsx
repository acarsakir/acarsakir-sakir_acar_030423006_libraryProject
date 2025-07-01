import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kütüphane Sistemi - ',
  description: 'Kütüphane Yönetim Sistemi',
  generator: 'Şakir Acar',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
