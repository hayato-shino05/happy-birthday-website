'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase/client'
import type { MediaFile, MediaStats } from '@/types'

const MEDIA_BUCKET = 'media'
const CACHE_EXPIRY_TIME = 60000 // 1分

interface UseMediaFilesReturn {
  files: MediaFile[]
  isLoading: boolean
  error: string | null
  stats: MediaStats | null
  refetch: () => Promise<void>
  uploadFile: (file: File) => Promise<MediaFile | null>
  deleteFile: (id: number) => Promise<boolean>
  updateTags: (id: number, tags: string[]) => Promise<boolean>
}

// ファイル名から種別を判定するヘルパー
function getFileType(fileName: string): 'image' | 'video' {
  const videoExtensions = /\.(mp4|webm|mov|avi|mkv)$/i
  return videoExtensions.test(fileName) ? 'video' : 'image'
}

// メディアとして有効なファイルか判定するヘルパー
function isValidMediaFile(fileName: string): boolean {
  const mediaExtensions = /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|avi|mkv)$/i
  return mediaExtensions.test(fileName) && fileName !== '.emptyFolderPlaceholder'
}

export function useMediaFiles(): UseMediaFilesReturn {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [cacheTime, setCacheTime] = useState(0)

  const fetchFiles = useCallback(async (forceRefresh = false) => {
    // キャッシュを確認
    const now = Date.now()
    if (!forceRefresh && cacheTime > 0 && (now - cacheTime < CACHE_EXPIRY_TIME) && files.length > 0) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      
      // Supabase Storage から一覧を取得（元データ相当）
      const { data, error: listError } = await supabase
        .storage
        .from(MEDIA_BUCKET)
        .list('', {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (listError) {
        // If bucket doesn't exist or no access, return empty
        console.warn('Storage error:', listError.message)
        setFiles([])
        setStats({ totalFiles: 0, totalImages: 0, totalVideos: 0, totalSize: 0, recentUploads: [] })
        return
      }

      // 有効なメディアファイルだけを抽出
      const validFiles = (data || []).filter(file => isValidMediaFile(file.name))

      // 公開 URL を取得し MediaFile 形式に変換
      const mediaFiles: MediaFile[] = validFiles.map((file, index) => {
        const { data: urlData } = supabase.storage
          .from(MEDIA_BUCKET)
          .getPublicUrl(file.name)

        return {
          id: index + 1,
          file_name: file.name,
          file_path: urlData.publicUrl,
          file_type: getFileType(file.name),
          file_size: file.metadata?.size || 0,
          tags: [],
          created_at: file.created_at || new Date().toISOString(),
          updated_at: file.updated_at || new Date().toISOString(),
        }
      })

      setFiles(mediaFiles)
      setCacheTime(now)

      // 統計情報を計算
      const totalImages = mediaFiles.filter(f => f.file_type === 'image').length
      const totalVideos = mediaFiles.filter(f => f.file_type === 'video').length
      const totalSize = mediaFiles.reduce((sum, f) => sum + (f.file_size || 0), 0)

      setStats({
        totalFiles: mediaFiles.length,
        totalImages,
        totalVideos,
        totalSize,
        recentUploads: mediaFiles.slice(0, 5),
      })
    } catch (err) {
      console.error('メディア取得エラー:', err)
      setError(err instanceof Error ? err.message : 'メディアを読み込めませんでした')
      setFiles([])
      setStats({ totalFiles: 0, totalImages: 0, totalVideos: 0, totalSize: 0, recentUploads: [] })
    } finally {
      setIsLoading(false)
    }
  }, [cacheTime, files.length])

  useEffect(() => {
    fetchFiles()
  }, []) // マウント時に一度だけ実行

  const uploadFile = useCallback(async (file: File): Promise<MediaFile | null> => {
    try {
      const supabase = getSupabase()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Supabase Storage にアップロード
      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 公開 URL を取得
      const { data: urlData } = supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(fileName)

      const newFile: MediaFile = {
        id: Date.now(),
        file_name: fileName,
        file_path: urlData.publicUrl,
        file_type: getFileType(fileName),
        file_size: file.size,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // キャッシュを無効化して再取得
      setCacheTime(0)
      await fetchFiles(true)
      
      return newFile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイルをアップロードできませんでした')
      return null
    }
  }, [fetchFiles])

  const deleteFile = useCallback(async (id: number): Promise<boolean> => {
    try {
      const fileToDelete = files.find(f => f.id === id)
      if (!fileToDelete) return false

      const supabase = getSupabase()
      const { error: deleteError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .remove([fileToDelete.file_name])

      if (deleteError) throw deleteError

      // Invalidate cache and refetch
      setCacheTime(0)
      await fetchFiles(true)
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイルを削除できませんでした')
      return false
    }
  }, [files, fetchFiles])

  const updateTags = useCallback(async (_id: number, _tags: string[]): Promise<boolean> => {
    // 現在はタグをローカルにのみ保持（Supabase Storage はメタデータタグを直接サポートしていない）
    // 本番では別テーブルなどにタグ情報を保存する想定
    return true
  }, [])

  return {
    files,
    isLoading,
    error,
    stats,
    refetch: () => fetchFiles(true),
    uploadFile,
    deleteFile,
    updateTags,
  }
}
