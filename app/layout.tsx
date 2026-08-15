import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { locales } from '@/data/generated/locales'
import { LANGUAGE_COOKIE_NAME, LanguageProvider } from '@/lib/i18n/LanguageContext'
import { DEFAULT_LOCALE, resolveLocale } from '@/lib/i18n/resolveLocale'
import { ThemeProvider } from '@/lib/providers/ThemeProvider'
import { QueryProvider } from '@/lib/providers/QueryProvider'

export const metadata: Metadata = {
  metadataBase: new URL('https://happy-birthday.vercel.app'),
  title: 'Happy Birthday | お誕生日おめでとう',
  description: '誕生日を祝うウェブサイト。ろうそくを吹き消したり、メッセージを送ったり、ゲームをしよう！',
  keywords: ['birthday', '誕生日', 'お祝い', 'happy birthday', 'celebration'],
  authors: [{ name: 'Happy Birthday Team' }],
  creator: 'Happy Birthday Team',
  publisher: 'Happy Birthday Team',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US'],
    url: 'https://happy-birthday.vercel.app',
    siteName: 'Happy Birthday',
    title: 'Happy Birthday | お誕生日おめでとう',
    description: '誕生日を祝うウェブサイト。楽しい機能がたくさん！',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Happy Birthday',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happy Birthday | お誕生日おめでとう',
    description: '誕生日を祝うウェブサイト。楽しい機能がたくさん！',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3E5D8' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const requestedLocale = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value ?? DEFAULT_LOCALE
  const locale = resolveLocale(requestedLocale, locales, DEFAULT_LOCALE).locale
  const language = locale.startsWith('ja') ? 'ja' : 'en'

  return (
    <html lang={language} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            <LanguageProvider initialLocale={locale}>
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
