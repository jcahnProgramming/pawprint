import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PawPrint',
  description: 'Browser-native Minecraft schematic builder — MeowNet Studios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}