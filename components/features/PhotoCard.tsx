'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { MediaFile } from '@/types'

interface PhotoCardProps {
  media: MediaFile
  onClick?: () => void
}

export function PhotoCard({ media, onClick }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isVideo = media.file_type === 'video'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="photo-card"
      style={{
        position: 'relative',
        aspectRatio: '1',
        overflow: 'hidden',
        border: '2px solid #D4B08C',
        borderRadius: '6px',
        boxShadow: '3px 3px 8px rgba(139, 69, 19, 0.25)',
        cursor: 'pointer',
        background: '#FFF9F3',
      }}
    >
      {isVideo ? (
        <video
          src={media.file_path}
          poster={media.thumbnail_url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          muted
        />
      ) : (
        <img
          src={imageError ? '/placeholder-image.png' : media.file_path}
          alt={media.file_name}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'sepia(10%)',
            transition: 'filter 0.3s',
          }}
        />
      )}

      {/* ビデオインジケーター */}
      {isVideo && (
        <div
          className="video-indicator"
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            padding: '3px 6px',
            borderRadius: '4px',
            fontSize: '0.65rem',
          }}
        >
          ▶
        </div>
      )}

      {/* ホバー時のオーバーレイ（ファイル名のみ表示） */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(transparent 50%, rgba(0, 0, 0, 0.6) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '12px',
          }}
        >
          <p
            style={{
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 500,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {media.file_name}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
