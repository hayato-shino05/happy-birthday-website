'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Icon } from '@/components/ui/Icon'

interface FortuneResult {
  rank: 'daikichi' | 'chukichi' | 'shokichi' | 'kichi' | 'suekichi'
  rankNameJa: string
  rankNameEn: string
  messageJa: string
  messageEn: string
  luckyColorJa: string
  luckyColorEn: string
  luckyItemJa: string
  luckyItemEn: string
  actionJa: string
  actionEn: string
}

const FORTUNES: FortuneResult[] = [
  {
    rank: 'daikichi',
    rankNameJa: '大吉',
    rankNameEn: 'Great Blessing',
    messageJa: '最高の一日！すべての願いが実を結び、笑顔あふれる温かい祝福に包まれます。',
    messageEn: 'A magnificent day! All your wishes will bear fruit surrounded by joyful celebrations.',
    luckyColorJa: '桜色（さくらいろ）',
    luckyColorEn: 'Cherry Blossom Pink',
    luckyItemJa: 'バースデーケーキ',
    luckyItemEn: 'Birthday Cake',
    actionJa: '大切な人に笑顔で「ありがとう」を伝えましょう。',
    actionEn: 'Share a heartfelt thank-you with someone you cherish.',
  },
  {
    rank: 'chukichi',
    rankNameJa: '中吉',
    rankNameEn: 'Middle Blessing',
    messageJa: 'あたたかいご縁が深まる日。心を通わせる会話から素敵なひらめきが生まれます。',
    messageEn: 'A day of deepening bonds. Warm conversations will spark wonderful moments.',
    luckyColorJa: '山吹色（やまぶきいろ）',
    luckyColorEn: 'Golden Yellow',
    luckyItemJa: 'フォトアルバム',
    luckyItemEn: 'Photo Album',
    actionJa: '昔の写真を見返して、懐かしい思い出を語り合ってみましょう。',
    actionEn: 'Look back at past photos and share fond memories together.',
  },
  {
    rank: 'shokichi',
    rankNameJa: '小吉',
    rankNameEn: 'Small Blessing',
    messageJa: 'ささやかな幸せがそっと寄り添う日。温かいお茶とお菓子で心満たされる時間を。',
    messageEn: 'Gentle joy will grace your day. Take a peaceful break with tea and sweets.',
    luckyColorJa: '抹茶色（まっちゃいろ）',
    luckyColorEn: 'Matcha Green',
    luckyItemJa: 'お気に入りの音楽',
    luckyItemEn: 'Favorite Music',
    actionJa: '好きな音楽を聴きながら、穏やかなティータイムを楽しみましょう。',
    actionEn: 'Enjoy a cozy tea break while listening to your favorite tunes.',
  },
  {
    rank: 'kichi',
    rankNameJa: '吉',
    rankNameEn: 'Blessing',
    messageJa: '平穏で実り豊かな一日。普段通りの日常の中に特別な輝きを見つけられます。',
    messageEn: 'A peaceful and fruitful day. You will discover special beauty in everyday moments.',
    luckyColorJa: '浅葱色（あさぎいろ）',
    luckyColorEn: 'Light Azure Blue',
    luckyItemJa: '手書きのメッセージカード',
    luckyItemEn: 'Handwritten Message Card',
    actionJa: '心に浮かんだ素直な言葉をメッセージボードに残してみましょう。',
    actionEn: 'Write down your heartfelt thoughts on the wish board.',
  },
  {
    rank: 'suekichi',
    rankNameJa: '末吉',
    rankNameEn: 'Future Blessing',
    messageJa: 'これからゆっくり運気が開けていく兆し。焦らず一歩ずつ進むことで道が拓けます。',
    messageEn: 'Good fortune is gently unfolding. Taking steady steps will open new paths.',
    luckyColorJa: '藤色（ふじいろ）',
    luckyColorEn: 'Wisteria Purple',
    luckyItemJa: '折り紙の花',
    luckyItemEn: 'Origami Flower',
    actionJa: '新しいミニゲームに挑戦して気分をリフレッシュしましょう。',
    actionEn: 'Try out a fun mini game to refresh your spirit.',
  },
]

// 神社風の日替わりおみくじコンポーネント
export function DailyOmikuji({ onClose }: { onClose?: () => void }) {
  const { t, language } = useLanguage()
  const [isShaking, setIsShaking] = useState(false)
  const [result, setResult] = useState<FortuneResult | null>(null)
  const todayKey = `omikuji_${new Date().toISOString().slice(0, 10)}`

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
    if (isShaking) return
    setIsShaking(true)
    setResult(null)

    setTimeout(() => {
      const picked = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
      setResult(picked)
      setIsShaking(false)
      try {
        localStorage.setItem(todayKey, JSON.stringify(picked))
      } catch {
        // localStorage 保存エラー時は無視
      }
    }, 1400)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-md mx-auto text-center">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#854D27]/10 border border-[#D4B08C] text-[#854D27] text-xs font-bold tracking-widest uppercase mb-2">
          ⛩️ {t('omikujiTitle')}
        </div>
        <h2 className="text-xl font-bold text-[#854D27]">{t('omikujiTitle')}</h2>
        <p className="text-xs text-[#854D27]/70 mt-1">{t('omikujiSubtitle')}</p>
      </div>

      {!result ? (
        /* おみくじ筒・抽選エリア */
        <div className="w-full bg-[#FFF9F3] border-2 border-[#D4B08C] rounded-2xl p-8 shadow-md flex flex-col items-center">
          {/* おみくじ筒アニメーション */}
          <motion.div
            animate={
              isShaking
                ? {
                    rotate: [-15, 15, -15, 15, -10, 10, 0],
                    y: [-10, 5, -10, 5, 0],
                  }
                : {}
            }
            transition={{ duration: 1.2, repeat: isShaking ? Infinity : 0 }}
            className="w-24 h-40 bg-gradient-to-b from-[#854D27] via-[#9C5D33] to-[#6E3F20] rounded-2xl border-4 border-[#D4B08C] shadow-xl flex flex-col items-center justify-between p-3 relative overflow-hidden mb-6"
          >
            <div className="w-12 h-3 bg-[#D4B08C] rounded-full" />
            <div className="writing-vertical text-xs font-bold text-[#FFF9F3] tracking-widest border border-[#D4B08C]/50 px-1 py-2 rounded">
              想い出みくじ
            </div>
            <div className="w-16 h-2 bg-[#D4B08C]/60 rounded-full" />
          </motion.div>

          <button
            onClick={handleDraw}
            disabled={isShaking}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#854D27] to-[#A05D30] hover:brightness-110 disabled:opacity-50 text-[#FFF9F3] font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            {isShaking ? t('omikujiDrawing') : t('omikujiDraw')}
          </button>
        </div>
      ) : (
        /* 結果発表カード */
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full bg-[#FFF9F3] border-2 border-[#D4B08C] rounded-2xl p-6 shadow-xl relative"
        >
          {/* 運勢大見出し */}
          <div className="inline-block bg-[#854D27] text-[#FFF9F3] text-2xl font-black px-6 py-2 rounded-xl border-2 border-[#D4B08C] shadow-md mb-4">
            {language === 'ja' ? result.rankNameJa : result.rankNameEn}
          </div>

          {/* 運勢メッセージ */}
          <p className="text-sm font-serif text-[#854D27] leading-relaxed mb-6 px-2">
            {language === 'ja' ? result.messageJa : result.messageEn}
          </p>

          {/* 吉事・ラッキーアイテム詳細グリッド */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="bg-[#854D27]/5 border border-[#D4B08C]/60 rounded-xl p-3">
              <span className="text-[10px] font-bold text-[#854D27]/70 uppercase block mb-1">
                🎨 {t('omikujiLuckyColor')}
              </span>
              <span className="text-xs font-bold text-[#854D27]">
                {language === 'ja' ? result.luckyColorJa : result.luckyColorEn}
              </span>
            </div>
            <div className="bg-[#854D27]/5 border border-[#D4B08C]/60 rounded-xl p-3">
              <span className="text-[10px] font-bold text-[#854D27]/70 uppercase block mb-1">
                🎁 {t('omikujiLuckyItem')}
              </span>
              <span className="text-xs font-bold text-[#854D27]">
                {language === 'ja' ? result.luckyItemJa : result.luckyItemEn}
              </span>
            </div>
          </div>

          {/* 今日のアクション提案 */}
          <div className="bg-[#854D27]/10 border border-[#D4B08C] rounded-xl p-3 text-left mb-6">
            <span className="text-[10px] font-bold text-[#854D27] uppercase block mb-1">
              ✨ {t('omikujiActionAdvice')}
            </span>
            <span className="text-xs text-[#854D27]/90 leading-normal">
              {language === 'ja' ? result.actionJa : result.actionEn}
            </span>
          </div>

          <button
            onClick={handleDraw}
            className="w-full py-2.5 rounded-xl bg-transparent border-2 border-[#854D27] text-[#854D27] hover:bg-[#854D27]/10 font-bold text-xs transition-all cursor-pointer"
          >
            {t('omikujiDraw')}
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default DailyOmikuji
