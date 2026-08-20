'use client'

import { useState, useRef } from 'react'
import { getSupabase } from '@/lib/supabase/client'
import { Icon } from './Icon'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface MusicUploaderProps {
  onUploaded?: (track: { name: string; url: string }) => void
  onClose?: () => void
}

export default function MusicUploader({ onUploaded, onClose }: MusicUploaderProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [trackName, setTrackName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // ファイル形式のチェック
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm']
    if (!validTypes.includes(selectedFile.type)) {
      setError(t('audioSupportedFormats'))
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(t('fileSizeLimitError'))
      return
    }

    setFile(selectedFile)
    setTrackName(selectedFile.name.replace(/\.[^/.]+$/, ''))
    setError(null)
  }

  const handleUpload = async () => {
    if (!file || !trackName.trim()) return

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const supabase = getSupabase()
      const fileName = `music_${Date.now()}_${file.name}`

      // 進捗表示を疑似的に更新
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(fileName, file, {
          contentType: file.type,
        })

      clearInterval(progressInterval)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('music')
        .getPublicUrl(fileName)

      setProgress(100)

      // データベースに保存
      await supabase.from('music_tracks').insert({
        name: trackName.trim(),
        url: urlData.publicUrl,
        file_name: fileName,
        file_size: file.size,
      })

      onUploaded?.({ name: trackName.trim(), url: urlData.publicUrl })

      // フォームをリセット
      setTimeout(() => {
        setFile(null)
        setTrackName('')
        setProgress(0)
        onClose?.()
      }, 1000)
    } catch {
      setError(t('audioUploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{t('uploadMusic')}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <Icon name="X" size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition-colors cursor-pointer mb-4"
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <Icon name="Music" size={40} className="text-green-400" aria-hidden="true" />
            <div className="text-left">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-white/50 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <>
            <Icon name="Upload" size={48} className="text-white/40 mx-auto mb-3" aria-hidden="true" />
            <p className="text-white/70 mb-1">{t('audioFileSelect')}</p>
            <p className="text-white/40 text-sm">{t('audioFileLimit')}</p>
          </>
        )}
      </div>

      {file && (
        <input
          type="text"
          value={trackName}
          onChange={(e) => setTrackName(e.target.value)}
          placeholder={t('trackName')}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 mb-4"
        />
      )}

      {uploading && (
        <div className="mb-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/50 text-sm mt-1 text-center">{progress}%</p>
        </div>
      )}

      {error && (
        <p className="text-red-300 text-sm mb-4">{error}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || !trackName.trim() || uploading}
        className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all cursor-pointer disabled:cursor-not-allowed"
      >
        {uploading ? t('uploading') : t('uploadMusic')}
      </button>
    </div>
  )
}
