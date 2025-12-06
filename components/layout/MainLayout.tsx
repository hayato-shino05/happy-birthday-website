'use client'

import { ReactNode } from 'react'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { ThemeIndicator } from '@/components/ui/ThemeIndicator'
import { HeaderButtons } from '@/components/ui/HeaderButtons'
import { GameButtons } from '@/components/ui/GameButtons'
import { MusicPlayer } from '@/components/ui/MusicPlayer'
import { SocialButtons } from '@/components/ui/SocialButtons'
import { ModalManager } from '@/components/ui/ModalManager'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      {/* 左上 - 言語 & テーマ */}
      <div className="fixed-top-left">
        <LanguageSelector />
        <ThemeIndicator />
      </div>

      {/* 上中央 - アルバムボタン */}
      <div className="fixed-top-center">
        <HeaderButtons position="center" />
      </div>

      {/* 右上 - メッセージボタン */}
      <div className="fixed-top-right">
        <HeaderButtons position="right" />
      </div>

      {/* メインコンテンツ */}
      <main className="main-content">
        {children}
      </main>

      {/* 左下 - ゲームボタン */}
      <div className="fixed-bottom-left">
        <GameButtons />
      </div>

      {/* 下中央 - ミュージックプレイヤー */}
      <div className="fixed-bottom-center">
        <MusicPlayer />
      </div>

      {/* 右下 - ソーシャルボタン */}
      <div className="fixed-bottom-right">
        <SocialButtons />
      </div>

      {/* モーダル管理コンポーネント */}
      <ModalManager />
    </div>
  )
}
