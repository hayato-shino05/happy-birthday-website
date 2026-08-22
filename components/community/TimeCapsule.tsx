'use client'

import { useState, useEffect, useRef } from 'react'
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

// ローカル日付文字列（YYYY-MM-DD）をローカル時間 00:00:00 の Date オブジェクトに変換
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number)
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0)
  }
  return new Date(dateStr)
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
    const y = nextYear.getFullYear()
    const m = String(nextYear.getMonth() + 1).padStart(2, '0')
    const d = String(nextYear.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // タイムカプセル一覧の取得およびローカル保存データの統合
  const fetchCapsules = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      const now = new Date()

      const { data, error } = await supabase
        .from('time_capsules')
        .select('*')
        .order('unlock_date', { ascending: true })

      // ローカルストレージフォールバックデータの取得
      let localCapsules: CapsuleItem[] = []
      try {
        const localSaved = localStorage.getItem('local_time_capsules')
        if (localSaved) {
          localCapsules = JSON.parse(localSaved) as CapsuleItem[]
        }
      } catch {
        localCapsules = []
      }

      let remoteCapsules: CapsuleItem[] = []
      if (!error && data) {
        remoteCapsules = data.map((c: any) => {
          const unlockTime = parseLocalDate(c.unlock_date)
          const isUnlocked = unlockTime <= now
          return {
            id: c.id,
            sender: c.sender,
            recipient: c.recipient,
            // 未開封時は内容を秘匿化
            message: isUnlocked ? c.message : '',
            photoUrl: isUnlocked ? c.photo_url : undefined,
            unlockDate: c.unlock_date,
            createdAt: c.created_at,
            isUnlocked,
          }
        })
      }

      // リモートとローカルの統合（ID重複を排除）
      const remoteIds = new Set(remoteCapsules.map((c) => String(c.id)))
      const unmergedLocal = localCapsules
        .filter((c) => !remoteIds.has(String(c.id)))
        .map((c) => {
          const unlockTime = parseLocalDate(c.unlockDate)
          const isUnlocked = unlockTime <= now
          return {
            ...c,
            isUnlocked,
            message: isUnlocked ? c.message : '',
            photoUrl: isUnlocked ? c.photoUrl : undefined,
          }
        })

      const combined = [...remoteCapsules, ...unmergedLocal].sort(
        (a, b) => parseLocalDate(a.unlockDate).getTime() - parseLocalDate(b.unlockDate).getTime()
      )

      setCapsules(combined)
    } catch {
      setCapsules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCapsules()
    // 定期的に開封状態を再計算
    const interval = setInterval(() => {
      setCapsules((prev) =>
        prev.map((c) => ({
          ...c,
          isUnlocked: parseLocalDate(c.unlockDate) <= new Date(),
        }))
      )
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // タイムカプセルの封印処理
  const handleSeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sender.trim() || !message.trim() || !unlockDate) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const supabase = getSupabase()
      let photoUrl: string | undefined = undefined

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop() || 'jpg'
        const fileName = `capsule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('time-capsules')
          .upload(fileName, photoFile)

        if (uploadErr || !uploadData) {
          // 写真アップロード失敗時は封印を中断してエラーを表示
          setSubmitError(t('uploadFileFailed'))
          setIsSubmitting(false)
          return
        }

        photoUrl = supabase.storage.from('time-capsules').getPublicUrl(fileName).data.publicUrl
      }

      const newCapsule: CapsuleItem = {
        id: `capsule-${Date.now()}`,
        sender: sender.trim(),
        recipient: recipient.trim() || undefined,
        message: message.trim(),
        photoUrl,
        unlockDate,
        createdAt: new Date().toISOString(),
        isUnlocked: parseLocalDate(unlockDate) <= new Date(),
      }

      // Supabase へ保存、失敗時はローカルストレージへフォールバック保存
      const { error: insertErr } = await supabase.from('time_capsules').insert({
        sender: newCapsule.sender,
        recipient: newCapsule.recipient,
        message: newCapsule.message,
        photo_url: newCapsule.photoUrl,
        unlock_date: newCapsule.unlockDate,
      })

      if (insertErr) {
        try {
          const localSaved = localStorage.getItem('local_time_capsules')
          const currentList = localSaved ? JSON.parse(localSaved) : []
          localStorage.setItem('local_time_capsules', JSON.stringify([newCapsule, ...currentList]))
        } catch {
          // ストレージエラーは無視
        }
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
      setSubmitError(t('genericError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col p-2 max-w-lg mx-auto">
      {/* タブ切り替え */}
      <div className="flex rounded-xl bg-[#854D27]/10 p-1 mb-5 border border-[#D4B08C]">
        <button
          onClick={() => setActiveTab('view')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'view'
              ? 'bg-[#854D27] text-[#FFF9F3] shadow-md'
              : 'text-[#854D27] hover:bg-[#854D27]/5'
          }`}
        >
          {t('viewCapsules')}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-[#854D27] text-[#FFF9F3] shadow-md'
              : 'text-[#854D27] hover:bg-[#854D27]/5'
          }`}
        >
          {t('sealNewCapsule')}
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
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
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
                      <Icon name={capsule.isUnlocked ? 'Folder' : 'Clock'} size={15} /> {capsule.sender}
                      {capsule.recipient ? ` ➔ ${capsule.recipient}` : ''}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#854D27] text-[#FFF9F3]">
                      {capsule.isUnlocked
                        ? t('capsuleUnlocked')
                        : t('timeCapsuleSealed', { date: parseLocalDate(capsule.unlockDate).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US') })}
                    </span>
                  </div>

                  {capsule.isUnlocked ? (
                    <div>
                      {capsule.photoUrl && (
                        <div className="w-full h-44 rounded-xl overflow-hidden mb-3 border border-[#D4B08C]/50">
                          <img
                            src={capsule.photoUrl}
                            alt={t('timeCapsulePhotoAlt')}
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
                        date: parseLocalDate(capsule.unlockDate).toLocaleDateString(
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
              <div className="w-12 h-12 rounded-full bg-[#854D27]/10 flex items-center justify-center mx-auto mb-3 text-[#854D27]">
                <Icon name="Archive" size={24} />
              </div>
              <p className="text-xs text-[#854D27]/80 mb-4">
                {t('timeCapsuleEmptyDesc')}
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
          {submitError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {submitError}
            </div>
          )}

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
              {t('recipientOptional')}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={t('recipientExamplePlaceholder')}
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
              placeholder={t('capsuleMessagePlaceholder')}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4B08C] text-xs text-[#854D27] focus:outline-none focus:ring-2 focus:ring-[#854D27]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#854D27] mb-1">
              {t('attachPhotoOptional')}
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
              {photoFile ? photoFile.name : t('selectPhoto')}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#854D27] text-[#FFF9F3] font-bold text-xs shadow-md hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? t('uploading') : submitSuccess ? t('sealedSuccess') : t('timeCapsuleSeal')}
          </button>
        </form>
      )}
    </div>
  )
}

export default TimeCapsule
