import type { Metadata } from 'next'
import { AUTHOR_NAME, AUTHOR_URL } from '@/components/Credit'
import './globals.css'

export const metadata: Metadata = {
  title: 'PawPrint',
  description: 'Browser-native Minecraft schematic builder. Pawprint, made by Jamie Cahn.',
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: AUTHOR_NAME,
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