'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useMediaFiles } from '@/lib/hooks/useMediaFiles'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { validateFile } from '@/lib/utils/media'
import { Icon } from '@/components/ui/Icon'

interface MediaUploaderProps {
  onUploadComplete?: () => void
}

export function MediaUploader({ onUploadComplete }: MediaUploaderProps) {
  const { uploadFile } = useMediaFiles()
  const { t } = useLanguage()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      setError(null)
      setIsUploading(true)
      setUploadProgress(0)

      const totalFiles = files.length
      let uploadedCount = 0

      for (const file of Array.from(files)) {
        const validation = validateFile(file)
        if (!validation.valid) {
          setError(
            file.size > 50 * 1024 * 1024
              ? t('fileTooLargeWithLimit', { size: 50 })
              : t('fileTypeError')
          )
          continue
        }

        const result = await uploadFile(file)
        if (result) {
          uploadedCount++
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100))
        }
      }

      setIsUploading(false)
      setUploadProgress(0)

      if (uploadedCount > 0 && onUploadComplete) {
        onUploadComplete()
      }
    },
    [uploadFile, onUploadComplete, t]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles]
  )

  return (
    <div>
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? '#854D27' : '#D4B08C',
          background: isDragging ? 'rgba(133, 77, 39, 0.1)' : '#FFF9F3',
        }}
        style={{
          border: '3px dashed #D4B08C',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleInputChange}
          style={{ display: 'none' }}
          id="media-upload-input"
          disabled={isUploading}
        />

        <label
          htmlFor="media-upload-input"
          style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
        >
          {isUploading ? (
            <div>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid #D4B08C',
                  borderTopColor: '#854D27',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ color: '#854D27', fontSize: '1.1rem', margin: 0 }}>
                {t('uploadProgress', { progress: uploadProgress })}
              </p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Icon name="FolderOpen" size={48} />
              </div>
              <p
                style={{
                  color: '#854D27',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  margin: '0 0 8px',
                }}
              >
                {t('dropMediaHere')}
              </p>
              <p style={{ color: '#854D27', opacity: 0.7, margin: 0 }}>
                {t('orChooseFile')}
              </p>
              <p
                style={{
                  color: '#854D27',
                  opacity: 0.5,
                  fontSize: '0.85rem',
                  marginTop: '12px',
                }}
              >
                {t('supportedMediaFormats')}
              </p>
            </div>
          )}
        </label>
      </motion.div>

      {error && (
        <p style={{ color: '#dc3545', marginTop: '12px', textAlign: 'center' }}>
          {error}
        </p>
      )}

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
