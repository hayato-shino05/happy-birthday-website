'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Icon } from '@/components/ui/Icon'
import { OMIKUJI_DATA, type OmikujiFortune } from '@/data/omikujiData'

// 3D おみくじ筒を SSR 回避でダイナミックインポート
const OmikujiCylinder3D = dynamic(
  () => import('@/components/3d/OmikujiCylinder3D').then((mod) => mod.OmikujiCylinder3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-3 border-[#D4B08C]/30 border-t-[#854D27] rounded-full animate-spin" />
        <span className="text-xs text-[#854D27]/70">3D Loading...</span>
      </div>
    ),
  }
)

// 和風 3D 想い出みくじコンポーネント
export function DailyOmikuji({ onClose }: { onClose?: () => void }) {
  const { t, language } = useLanguage()
  const [isShaking, setIsShaking] = useState(false)
  const [result, setResult] = useState<OmikujiFortune | null>(null)
  const [activeCategory, setActiveCategory] = useState<'all' | 'bond' | 'health' | 'wish' | 'blessing'>('all')

  // ユーザーのローカル深夜0時に切り替わるキー
  const todayKey = useMemo(() => {
    const now = new Date()
    return `omikuji_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`
  }, [])

  // 本日すでに引いた結果があればロード
  useEffect(() => {
    try {
      const saved = localStorage.getItem(todayKey)
      if (saved) {
        setResult(JSON.parse(saved))
      }
    } catch {
      // localStorage 利用不可時は無視
    }
  }, [todayKey])

  // おみくじを引くアニメーション処理
  const handleDraw = () => {
    if (isShaking || result) return
    setIsShaking(true)

    setTimeout(() => {
      const picked = OMIKUJI_DATA[Math.floor(Math.random() * OMIKUJI_DATA.length)]
      setResult(picked)
      setIsShaking(false)
      try {
        localStorage.setItem(todayKey, JSON.stringify(picked))
      } catch {
        // localStorage 保存エラー時は無視
      }
    }, 2200)
  }

  // 運勢に応じたグラデーション・スタイル
  const getRankBadgeStyle = (rank: string) => {
    switch (rank) {
      case 'daikichi':
        return 'from-[#B8860B] via-[#E5A93C] to-[#D4AF37] text-[#2A1208] border-[#FFF8E7]'
      case 'chukichi':
        return 'from-[#854D27] via-[#A05D30] to-[#854D27] text-[#FFF9F3] border-[#D4B08C]'
      case 'shokichi':
        return 'from-[#3E6B48] via-[#4E825A] to-[#3E6B48] text-[#FFF9F3] border-[#A8D5BA]'
      default:
        return 'from-[#854D27] to-[#6D3D1E] text-[#FFF9F3] border-[#D4B08C]'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto text-center">
      {/* 3D おみくじ筒エリア */}
      <div className="w-full bg-[#FFF9F3] border-2 border-[#D4B08C] rounded-2xl p-4 shadow-md mb-4 relative overflow-hidden">
        <div className="text-[11px] font-bold text-[#854D27]/80 flex items-center justify-center gap-1.5 mb-1">
          <Icon name="Sparkles" size={16} />
          <span>{language === 'ja' ? 'ドラッグして3D筒を回転・観察できます' : 'Drag to rotate the 3D cylinder'}</span>
        </div>

        <OmikujiCylinder3D
          isShaking={isShaking}
          isRevealed={Boolean(result)}
          fortuneNumber={result?.id || 1}
        />

        {!result && (
          <div className="mt-3">
            <p className="text-xs text-[#854D27]/80 mb-3">{t('omikujiSubtitle')}</p>
            <button
              onClick={handleDraw}
              disabled={isShaking}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#854D27] via-[#A05D30] to-[#854D27] hover:brightness-110 disabled:opacity-50 text-[#FFF9F3] font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Icon name="Sparkles" size={20} />
              <span>{isShaking ? (language === 'ja' ? 'みくじ筒を振っています...' : 'Shaking cylinder...') : t('omikujiDraw')}</span>
            </button>
          </div>
        )}
      </div>

      {/* 結果発表：和紙巻物風デザイン */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full bg-[#FFFDF9] border-2 border-[#D4B08C] rounded-2xl p-5 shadow-xl relative text-left"
            style={{
              backgroundImage: 'radial-gradient(#D4B08C 0.6px, transparent 0.6px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* 本日の運勢・ヘッダーバッジ */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D4B08C]/50">
              <span className="text-xs font-bold text-[#854D27]/80 uppercase tracking-widest flex items-center gap-1.5">
                <Icon name="Calendar" size={14} />
                {language === 'ja' ? '本日の想い出運勢' : "Today's Omoide Fortune"}
              </span>
              <span className="text-xs font-bold text-[#854D27]">
                {language === 'ja' ? `第${result.id}番` : `No. ${result.id}`}
              </span>
            </div>

            {/* 運勢大見出し */}
            <div className="text-center mb-5">
              <div
                className={`inline-block px-8 py-2.5 rounded-2xl bg-gradient-to-r ${getRankBadgeStyle(
                  result.rank
                )} font-black text-2xl tracking-widest border-2 shadow-lg`}
              >
                {language === 'ja' ? result.rankNameJa : result.rankNameEn}
              </div>
            </div>

            {/* 祝詠・和歌 / 俳句 */}
            <div className="bg-[#854D27]/5 border-l-4 border-[#854D27] rounded-r-xl p-3.5 mb-4">
              <span className="text-[10px] font-bold text-[#854D27]/70 uppercase block mb-1">
                📜 {language === 'ja' ? '祝詠（しゅくえい）' : 'Celebration Poem'}
              </span>
              <p className="text-sm font-serif text-[#854D27] italic leading-relaxed">
                &ldquo;{language === 'ja' ? result.poemJa : result.poemEn}&rdquo;
              </p>
            </div>

            {/* 総合運勢 */}
            <p className="text-xs font-serif text-[#854D27] leading-relaxed mb-5 px-1 font-medium">
              {language === 'ja' ? result.generalJa : result.generalEn}
            </p>

            {/* 4大運勢カテゴリ（縁・健・志・祝） */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-5">
              {/* 1. 縁（絆・人間関係） */}
              <div className="bg-white/80 border border-[#D4B08C]/60 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#854D27] mb-1">
                  <Icon name="Heart" size={14} />
                  <span>{language === 'ja' ? '【縁】絆・出会い' : '【Bond】Connection'}</span>
                </div>
                <p className="text-[11px] text-[#854D27]/90 leading-snug">
                  {language === 'ja' ? result.bondJa : result.bondEn}
                </p>
              </div>

              {/* 2. 健（健康・心身） */}
              <div className="bg-white/80 border border-[#D4B08C]/60 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#854D27] mb-1">
                  <Icon name="Sparkles" size={14} />
                  <span>{language === 'ja' ? '【健】心身・健康' : '【Health】Well-being'}</span>
                </div>
                <p className="text-[11px] text-[#854D27]/90 leading-snug">
                  {language === 'ja' ? result.healthJa : result.healthEn}
                </p>
              </div>

              {/* 3. 志（願い事・目標） */}
              <div className="bg-white/80 border border-[#D4B08C]/60 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#854D27] mb-1">
                  <Icon name="Star" size={14} />
                  <span>{language === 'ja' ? '【志】願い事・学業' : '【Wish】Aspirations'}</span>
                </div>
                <p className="text-[11px] text-[#854D27]/90 leading-snug">
                  {language === 'ja' ? result.wishJa : result.wishEn}
                </p>
              </div>

              {/* 4. 祝（誕生日の祝福） */}
              <div className="bg-white/80 border border-[#D4B08C]/60 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#854D27] mb-1">
                  <Icon name="Cake" size={14} />
                  <span>{language === 'ja' ? '【祝】誕生日の言霊' : '【Blessing】Birthday Wish'}</span>
                </div>
                <p className="text-[11px] text-[#854D27]/90 leading-snug">
                  {language === 'ja' ? result.blessingJa : result.blessingEn}
                </p>
              </div>
            </div>

            {/* ラッキー情報バー（色・品・数字） */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#854D27]/10 border border-[#D4B08C] rounded-xl text-center">
              <div>
                <span className="text-[10px] font-bold text-[#854D27]/70 uppercase block mb-0.5">
                  {t('omikujiLuckyColor')}
                </span>
                <span className="text-xs font-bold text-[#854D27] truncate block">
                  {language === 'ja' ? result.luckyColorJa : result.luckyColorEn}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#854D27]/70 uppercase block mb-0.5">
                  {t('omikujiLuckyItem')}
                </span>
                <span className="text-xs font-bold text-[#854D27] truncate block">
                  {language === 'ja' ? result.luckyItemJa : result.luckyItemEn}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#854D27]/70 uppercase block mb-0.5">
                  {language === 'ja' ? '幸運数' : 'Lucky No.'}
                </span>
                <span className="text-xs font-black text-[#854D27]">
                  {result.luckyNumber}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DailyOmikuji
