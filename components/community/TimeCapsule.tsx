'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSupabase } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Icon } from '@/components/ui/Icon'

interface CapsuleItem {
  id: string | number
  sender: string
  recipient?: string
  message: string
  photoUrl?: string
  unlockDate: string
  createdAt: string
  isUnlocked: boolean
}

// 未来の記念日に届くタイムカプセルコンポーネント
export function TimeCapsule({ onClose }: { onClose?: () => void }) {
  const { t, language } = useLanguage()
  const [capsules, setCapsules] = useState<CapsuleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view')

  // 作成フォームの状態
  const [sender, setSender] = useState('')
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [unlockDate, setUnlockDate] = useState(() => {
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    return nextYear.toISOString().slice(0, 10)
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // タイムカプセル一覧の取得
  const fetchCapsules = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('time_capsules')
        .select('*')
        .order('unlock_date', { ascending: true })

      if (error || !data) {
        // ローカルストレージからのフォールバック取得
        const localSaved = localStorage.getItem('local_time_capsules')
        if (localSaved) {
          const parsed = JSON.parse(localSaved) as CapsuleItem[]
          const now = new Date()
          setCapsules(
            parsed.map(c => ({
              ...c,
              isUnlocked: new Date(c.unlockDate) <= now,
            }))
          )
        } else {
          setCapsules([])
        }
      } else {
        const now = new Date()
        setCapsules(
          data.map((c: any) => ({
            id: c.id,
            sender: c.sender,
            recipient: c.recipient,
            message: c.message,
            photoUrl: c.photo_url,
            unlockDate: c.unlock_date,
            createdAt: c.created_at,
            isUnlocked: new Date(c.unlock_date) <= now,
          }))
        )
      }
    } catch {
      setCapsules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCapsules()
  }, [])

  // タイムカプセルの封印処理
  const handleSeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sender.trim() || !message.trim() || !unlockDate) return

    setIsSubmitting(true)
    try {
      const supabase = getSupabase()
      let photoUrl: string | undefined = undefined

      if (photoFile) {
        const fileName = `capsule_${Date.now()}_${photoFile.name}`
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('time-capsules')
          .upload(fileName, photoFile)

        if (!uploadErr && uploadData) {
          photoUrl = supabase.storage.from('time-capsules').getPublicUrl(fileName).data.publicUrl
        }
      }

      const newCapsule: CapsuleItem = {
        id: `capsule-${Date.now()}`,
        sender: sender.trim(),
        recipient: recipient.trim() || undefined,
        message: message.trim(),
        photoUrl,
        unlockDate,
        createdAt: new Date().toISOString(),
        isUnlocked: new Date(unlockDate) <= new Date(),
      }

      // Supabase へ保存、失敗時はローカルストレージへ保存
      const { error: insertErr } = await supabase.from('time_capsules').insert({
        sender: newCapsule.sender,
        recipient: newCapsule.recipient,
        message: newCapsule.message,
        photo_url: newCapsule.photoUrl,
        unlock_date: newCapsule.unlockDate,
      })

      if (insertErr) {
        const localSaved = localStorage.getItem('local_time_capsules')
        const currentList = localSaved ? JSON.parse(localSaved) : []
        localStorage.setItem('local_time_capsules', JSON.stringify([newCapsule, ...currentList]))
      }

      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        setSender('')
        setRecipient('')
        setMessage('')
        setPhotoFile(null)
        setActiveTab('view')
        fetchCapsules()
      }, 1200)
    } catch (err) {
      console.error('Failed to seal time capsule:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col p-4 max-w-lg mx-auto">
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#854D27]/10 border border-[#D4B08C] text-[#854D27] text-xs font-bold tracking-widest uppercase mb-2">
          🏺 {t('timeCapsuleTitle')}
        </div>
        <h2 className="text-xl font-bold text-[#854D27]">{t('timeCapsuleTitle')}</h2>
        <p className="text-xs text-[#854D27]/70 mt-1">{t('timeCapsuleSubtitle')}</p>
      </div>

      {/* タブ切り替え */}
      <div className="flex rounded-xl bg-[#854D27]/10 p-1 mb-6 border border-[#D4B08C]">
        <button
          onClick={() => setActiveTab('view')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'view'
              ? 'bg-[#854D27] text-[#FFF9F3] shadow-md'
              : 'text-[#854D27] hover:bg-[#854D27]/5'
          }`}
        >
          {language === 'ja' ? 'カプセル一覧' : 'View Capsules'}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-[#854D27] text-[#FFF9F3] shadow-md'
              : 'text-[#854D27] hover:bg-[#854D27]/5'
          }`}
        >
          {language === 'ja' ? '新しく封印する' : 'Seal New Capsule'}
        </button>
      </div>

      {activeTab === 'view' ? (
        /* カプセル一覧 */
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-3 border-[#D4B08C]/30 border-t-[#854D27] rounded-full animate-spin" />
              <span className="text-xs text-[#854D27]/80">{t('loading')}</span>
            </div>
          ) : capsules.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {capsules.map((capsule) => (
                <div
                  key={capsule.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    capsule.isUnlocked
                      ? 'bg-[#FFF9F3] border-[#D4B08C] shadow-md'
                      : 'bg-[#854D27]/5 border-dashed border-[#854D27]/40 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#854D27] flex items-center gap-1.5">
                      {capsule.isUnlocked ? '🔓' : '🔒'} {capsule.sender}
                      {capsule.recipient ? ` ➔ ${capsule.recipient}` : ''}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#854D27] text-[#FFF9F3]">
                      {capsule.isUnlocked
                        ? language === 'ja' ? '開封済み' : 'Unlocked'
                        : `${new Date(capsule.unlockDate).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US')} まで封印`}
                    </span>
                  </div>

                  {capsule.isUnlocked ? (
                    <div>
                      {capsule.photoUrl && (
                        <div className="w-full h-44 rounded-xl overflow-hidden mb-3 border border-[#D4B08C]/50">
                          <img
                            src={capsule.photoUrl}
                            alt="Capsule photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-xs text-[#854D27] font-serif leading-relaxed italic px-1">
                        &ldquo;{capsule.message}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#854D27]/70 italic mt-2">
                      {t('timeCapsuleLockedNotice', {
                        date: new Date(capsule.unlockDate).toLocaleDateString(
                          language === 'ja' ? 'ja-JP' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        ),
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#FFF9F3] border-2 border-dashed border-[#D4B08C] rounded-2xl p-6">
              <span className="text-3xl block mb-2">🏺</span>
              <p className="text-xs text-[#854D27]/80 mb-4">
                {language === 'ja'
                  ? 'まだ封印されたタイムカプセルはありません。未来の記念日に届くメッセージを残してみましょう！'
                  : 'No sealed time capsules yet. Leave a message for a future celebration!'}
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 rounded-xl bg-[#854D27] text-[#FFF9F3] text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
              >
                {t('timeCapsuleSeal')}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 新規封印フォーム */
        <form onSubmit={handleSeal} className="bg-[#FFF9F3] border-2 border-[#D4B08C] rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#854D27] mb-1">
              {t('yourName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder={t('yourName')}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4B08C] text-xs text-[#854D27] focus:outline-none focus:ring-2 focus:ring-[#854D27]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#854D27] mb-1">
              {language === 'ja' ? '受取人（任意）' : 'Recipient (Optional)'}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={language === 'ja' ? '例: 1年後の私、未来の家族' : 'e.g. Future Me, Family'}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4B08C] text-xs text-[#854D27] focus:outline-none focus:ring-2 focus:ring-[#854D27]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#854D27] mb-1">
              {t('timeCapsuleUnlockDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={unlockDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setUnlockDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4B08C] text-xs text-[#854D27] focus:outline-none focus:ring-2 focus:ring-[#854D27]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#854D27] mb-1">
              {t('typeMessage')} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={language === 'ja' ? '未来の記念日に伝えたい言葉を封印...' : 'Write words to be unlocked in the future...'}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4B08C] text-xs text-[#854D27] focus:outline-none focus:ring-2 focus:ring-[#854D27]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#854D27] mb-1">
              {language === 'ja' ? '写真を一緒に封印（任意）' : 'Attach Photo (Optional)'}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-[#854D27] text-[#854D27] text-xs font-medium hover:bg-[#854D27]/5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Icon name="Camera" size={16} />
              {photoFile ? photoFile.name : (language === 'ja' ? '写真を選択' : 'Select Photo')}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#854D27] text-[#FFF9F3] font-bold text-xs shadow-md hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? t('uploading') : submitSuccess ? (language === 'ja' ? '封印完了！' : 'Sealed!') : t('timeCapsuleSeal')}
          </button>
        </form>
      )}
    </div>
  )
}

export default TimeCapsule
