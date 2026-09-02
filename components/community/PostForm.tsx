'use client'

import { useState, useRef, useEffect } from 'react'
import { uploadCommunityMedia } from '@/lib/supabase/communityMedia'
import { getMediaKind, normalizeMediaFile, validateCommunityMediaFile } from '@/lib/validations/upload'
import { CameraCapture } from './CameraCapture'
import { ContributorPromptButtons } from './ContributorPromptButtons'
import { Icon } from '@/components/ui/Icon'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface PostFormProps {
  onSubmit: (sender: string, message: string, giftId?: string, mediaUrl?: string) => Promise<boolean>
}

export default function PostForm({ onSubmit }: PostFormProps) {
  const { t } = useLanguage()
  const [author, setAuthor] = useState('')
  
  // 共有ストレージから自動入力
  useEffect(() => {
    const savedName = localStorage.getItem('birthday_user_name')
    if (savedName) {
      setAuthor(savedName)
    }
  }, [])
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // メディア関連の状態
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSelectedFile = (file: File): boolean => {
    const normalizedFile = normalizeMediaFile(file)
    const validation = validateCommunityMediaFile(normalizedFile)
    if (!validation.valid || getMediaKind(normalizedFile.type) === 'audio') {
      setError(!validation.valid && file.size > 50 * 1024 * 1024
        ? t('fileTooLargeWithLimit', { size: 50 })
        : t('fileTypeError'))
      return false
    }

    setSelectedFile(normalizedFile)
    setError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(normalizedFile))
    return true
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleSelectedFile(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploadProgress(10)
      const data = await uploadCommunityMedia({ file, sender: author })
      setUploadProgress(100)
      return data.object_path
    } catch (err) {
      console.error('Upload error:', err)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!author.trim() || !content.trim()) return

    setSubmitting(true)
    setError(null)
    setUploadProgress(0)

    try {
      let mediaUrl: string | undefined

      if (selectedFile) {
        const url = await uploadFile(selectedFile)
        if (!url) {
          setError(t('uploadFileFailed'))
          setSubmitting(false)
          return
        }
        mediaUrl = url
      }

      const success = await onSubmit(author.trim(), content.trim(), undefined, mediaUrl)

      if (success) {
        // 名前を共有ストレージに保存する（他のフォームと共用）
        localStorage.setItem('birthday_user_name', author.trim())
        // 投稿者名は保持し、本文のみクリアする
        setContent('')
        removeFile()
      } else {
        setError(t('postFailed'))
      }
    } catch {
      setError(t('genericError'))
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  const isVideo = selectedFile?.type.startsWith('video/')

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{
        background: 'rgba(212, 176, 140, 0.1)',
        border: '2px solid #D4B08C',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        <div 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#854D27',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF9F3',
            fontWeight: 'bold',
            flexShrink: 0,
          }}
        >
          {author ? author[0].toUpperCase() : '?'}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t('yourName')}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#FFF9F3',
              border: '2px solid #D4B08C',
              borderRadius: 0,
              color: '#854D27',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
            }}
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('typeMessage')}
            rows={3}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#FFF9F3',
              border: '2px solid #D4B08C',
              borderRadius: 0,
              color: '#854D27',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              resize: 'none',
            }}
          />

          <ContributorPromptButtons hasContent={content.trim().length > 0} onSelect={setContent} />

          {/* メディアアップロード */}
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          
          {!selectedFile ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                style={{ padding: '8px 12px', border: '1px dashed #D4B08C', background: 'transparent', color: '#854D27', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="Folder" size={18} style={{ color: '#7E57C2' }} /> {t('library')}
              </button>
              <button type="button" onClick={() => { setCameraMode('photo'); setShowCamera(true) }}
                style={{ padding: '8px 12px', border: '1px solid #D4B08C', background: '#854D27', color: '#FFF9F3', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="Camera" size={18} style={{ color: '#FFB300' }} /> {t('takePhoto')}
              </button>
              <button type="button" onClick={() => { setCameraMode('video'); setShowCamera(true) }}
                style={{ padding: '8px 12px', border: '1px solid #D4B08C', background: '#854D27', color: '#FFF9F3', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="Video" size={18} style={{ color: '#2D8CFF' }} /> {t('takeVideo')}
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', border: '1px solid #D4B08C', borderRadius: '4px', padding: '8px', background: 'rgba(212,176,140,0.1)' }}>
              {isVideo ? (
                <video src={previewUrl || ''} style={{ width: '100%', maxHeight: '150px', objectFit: 'contain' }} controls />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl || ''} alt={t('preview')} style={{ width: '100%', maxHeight: '150px', objectFit: 'contain' }} />
              )}
              <button type="button" onClick={removeFile}
                aria-label={t('removeFile')}
                style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(220,53,69,0.9)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
                <Icon name="X" size={16} style={{ color: '#FFFFFF' }} />
              </button>
              <p style={{ fontSize: '0.75rem', color: '#854D27', marginTop: '4px' }}>{selectedFile.name} ({(selectedFile.size/1024/1024).toFixed(1)}MB)</p>
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ height: '3px', background: 'rgba(212,176,140,0.3)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#854D27', transition: 'width 0.3s' }} />
            </div>
          )}

          {error && <p style={{ color: '#dc3545', fontSize: '0.85rem' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={submitting || !author.trim() || !content.trim()}
              style={{
                padding: '10px 20px',
                background: submitting ? '#999' : '#854D27',
                color: '#FFF9F3',
                border: '2px solid #D4B08C',
                borderRadius: 0,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: '3px 3px 0 #D4B08C',
                opacity: (!author.trim() || !content.trim()) ? 0.5 : 1,
              }}
            >
              {submitting ? t('posting') : t('postMessage')}
            </button>
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          mode={cameraMode}
          onCapture={(file) => {
            handleSelectedFile(file)
            setShowCamera(false)
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </form>
  )
}
