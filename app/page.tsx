'use client'

import { useEffect, useState } from 'react'
import { BirthdayChecker } from '@/components/features/BirthdayChecker'
import { MainLayout } from '@/components/layout/MainLayout'
import { ThemeEffects } from '@/components/effects/ThemeEffects'
import { VideoBackground } from '@/components/effects/VideoBackground'
import { useThemeContext } from '@/lib/providers/ThemeProvider'

export default function Home() {
  const { themeConfig, currentTheme } = useThemeContext()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      document.body.className = `theme-${currentTheme}`
    }
  }, [currentTheme, isMounted])

  // Hydration mismatch防止のためのプレースホルダー
  if (!isMounted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F3E5D8' }} />
    )
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${themeConfig.gradient}`}
      style={{ backgroundColor: themeConfig.colors.background }}
    >
      <VideoBackground
        videoUrl={themeConfig.videoUrl}
        youtubeId={themeConfig.youtubeId}
        videoDuration={themeConfig.videoDuration}
        opacity={0.9}
      />
      <ThemeEffects effects={themeConfig.effects} />

      <MainLayout>
        <BirthdayChecker />
      </MainLayout>
    </div>
  )
}
