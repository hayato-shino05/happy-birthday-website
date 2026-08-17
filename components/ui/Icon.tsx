import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Brain,
  Cake,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  ClipboardList,
  Copy,
  Download,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  Gift,
  Gamepad2,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Info,
  LoaderCircle,
  Mail,
  Maximize2,
  Menu,
  MessageCircle,
  Mic,
  Minimize2,
  Minus,
  Music,
  Pause,
  PartyPopper,
  PenLine,
  Play,
  Puzzle,
  Search,
  Send,
  Share2,
  SkipBack,
  SkipForward,
  StopCircle,
  Trophy,
  Upload,
  Users,
  Video,
  Volume1,
  Volume2,
  VolumeX,
  Wind,
  X,
  type LucideIcon,
} from 'lucide-react'
import Image, { type StaticImageData } from 'next/image'
import type { CSSProperties } from 'react'

import cameraIcon from '@/src/assets/icons/camera.png'
import videoIcon from '@/src/assets/icons/video.png'
import imageIcon from '@/src/assets/icons/image.png'
import uploadIcon from '@/src/assets/icons/upload.png'
import musicIcon from '@/src/assets/icons/music.png'
import playIcon from '@/src/assets/icons/play.png'
import pauseIcon from '@/src/assets/icons/pause.png'
import shareIcon from '@/src/assets/icons/share.png'
import copyIcon from '@/src/assets/icons/copy.png'
import giftIcon from '@/src/assets/icons/gift.png'
import cakeIcon from '@/src/assets/icons/birthday-cake.png'
import calendarIcon from '@/src/assets/icons/calendar.png'
import brainIcon from '@/src/assets/icons/brain.png'
import puzzleIcon from '@/src/assets/icons/puzzle.png'
import searchIcon from '@/src/assets/icons/search.png'
import menuIcon from '@/src/assets/icons/menu.png'
import leftIcon from '@/src/assets/icons/left.png'
import rightIcon from '@/src/assets/icons/right.png'
import upIcon from '@/src/assets/icons/up.png'
import downIcon from '@/src/assets/icons/down.png'
import microphoneIcon from '@/src/assets/icons/microphone.png'
import windIcon from '@/src/assets/icons/wind.png'
import mailIcon from '@/src/assets/icons/mail.png'
import speechBubbleIcon from '@/src/assets/icons/speech-bubble.png'
import trophyIcon from '@/src/assets/icons/trophy.png'
import errorIcon from '@/src/assets/icons/error.png'
import infoIcon from '@/src/assets/icons/info.png'
import checkmarkIcon from '@/src/assets/icons/checkmark.png'
import loadingIcon from '@/src/assets/icons/loading.png'
import downloadIcon from '@/src/assets/icons/download.png'
import editIcon from '@/src/assets/icons/edit.png'
import clipboardIcon from '@/src/assets/icons/clipboard.png'
import muteIcon from '@/src/assets/icons/mute.png'
import volumeIcon from '@/src/assets/icons/volume.png'
import helpIcon from '@/src/assets/icons/help.png'
import heartIcon from '@/src/assets/icons/heart.png'
import sendIcon from '@/src/assets/icons/send.png'
import minusIcon from '@/src/assets/icons/minus.png'
import stopIcon from '@/src/assets/icons/stop.png'
import rewindIcon from '@/src/assets/icons/rewind.png'
import fastForwardIcon from '@/src/assets/icons/fast-forward.png'
import confettiIcon from '@/src/assets/icons/confetti.png'
import folderIcon from '@/src/assets/icons/folder.png'
import folderOpenIcon from '@/src/assets/icons/folder-open.png'
import usersIcon from '@/src/assets/icons/users.png'
import eyeIcon from '@/src/assets/icons/eye.png'
import eyeOffIcon from '@/src/assets/icons/eye-off.png'
import closeIcon from '@/src/assets/icons/close.png'
import warningIcon from '@/src/assets/icons/warning.png'
import gameControllerIcon from '@/src/assets/icons/game-controller.png'
import maximizeIcon from '@/src/assets/icons/maximize.png'
import minimizeIcon from '@/src/assets/icons/minimize.png'

export const Icons = {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Brain,
  Cake,
  Calendar,
  Camera,
  CheckCircle: CheckCircle2,
  CheckCircle2,
  CircleAlert,
  CircleCheck,
  CircleX,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Close: X,
  Comment: MessageCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  Gamepad: Gamepad2,
  Gift,
  Heart,
  HelpCircle,
  Image: ImageIcon,
  Info,
  LoaderCircle,
  Mail,
  Maximize2,
  Menu,
  MessageCircle,
  Mic,
  Minimize2,
  Minus,
  Music,
  Pause,
  Party: PartyPopper,
  PenLine,
  Play,
  Puzzle,
  Search,
  Send,
  Share2,
  SkipBack,
  SkipForward,
  StopCircle,
  Trophy,
  Upload,
  Users,
  Video,
  Volume: Volume2,
  Volume1,
  Volume2,
  VolumeX,
  Wind,
  X,
} as const

interface IconProps
  extends Pick<
    React.SVGProps<SVGSVGElement>,
    'aria-hidden' | 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'role' | 'tabIndex'
  > {
  name: keyof typeof Icons
  size?: number
  className?: string
  style?: CSSProperties
}

const assetIcons: Partial<Record<keyof typeof Icons, StaticImageData>> = {
  Camera: cameraIcon,
  Video: videoIcon,
  Image: imageIcon,
  Upload: uploadIcon,
  Music: musicIcon,
  Play: playIcon,
  Pause: pauseIcon,
  Share2: shareIcon,
  Copy: copyIcon,
  Gift: giftIcon,
  Cake: cakeIcon,
  Calendar: calendarIcon,
  Brain: brainIcon,
  Puzzle: puzzleIcon,
  Search: searchIcon,
  Menu: menuIcon,
  ArrowLeft: leftIcon,
  ArrowRight: rightIcon,
  ArrowUp: upIcon,
  ArrowDown: downIcon,
  Mic: microphoneIcon,
  Wind: windIcon,
  Mail: mailIcon,
  Comment: speechBubbleIcon,
  MessageCircle: speechBubbleIcon,
  Trophy: trophyIcon,
  CircleX: errorIcon,
  X: errorIcon,
  Info: infoIcon,
  CheckCircle: checkmarkIcon,
  CheckCircle2: checkmarkIcon,
  CircleCheck: checkmarkIcon,
  LoaderCircle: loadingIcon,
  Download: downloadIcon,
  PenLine: editIcon,
  ClipboardList: clipboardIcon,
  Volume: volumeIcon,
  Volume1: volumeIcon,
  Volume2: volumeIcon,
  VolumeX: muteIcon,
  HelpCircle: helpIcon,
  Heart: heartIcon,
  Send: sendIcon,
  Minus: minusIcon,
  StopCircle: stopIcon,
  SkipBack: rewindIcon,
  SkipForward: fastForwardIcon,
  Party: confettiIcon,
  Folder: folderIcon,
  FolderOpen: folderOpenIcon,
  Users: usersIcon,
  Eye: eyeIcon,
  EyeOff: eyeOffIcon,
  Close: closeIcon,
  AlertTriangle: warningIcon,
  CircleAlert: warningIcon,
  Gamepad: gameControllerIcon,
  Maximize2: maximizeIcon,
  Minimize2: minimizeIcon,
}

const iconToneClasses: Partial<Record<keyof typeof Icons, string>> = {
  AlertTriangle: 'text-amber-500',
  CircleAlert: 'text-amber-500',
  CircleCheck: 'text-emerald-500',
  CircleX: 'text-rose-500',
  CheckCircle: 'text-emerald-500',
  CheckCircle2: 'text-emerald-500',
  Heart: 'text-pink-500',
  Info: 'text-sky-500',
  Mail: 'text-pink-500',
  Party: 'text-amber-500',
  Gift: 'text-fuchsia-500',
  Camera: 'text-orange-500',
  Video: 'text-sky-500',
  Folder: 'text-violet-500',
  FolderOpen: 'text-violet-500',
  Image: 'text-cyan-500',
  Upload: 'text-sky-500',
  Download: 'text-sky-500',
  Play: 'text-emerald-500',
  Pause: 'text-amber-500',
  SkipBack: 'text-sky-500',
  SkipForward: 'text-sky-500',
  Volume: 'text-teal-500',
  Volume1: 'text-teal-500',
  Volume2: 'text-teal-500',
  VolumeX: 'text-rose-500',
  Close: 'text-rose-500',
  X: 'text-rose-500',
}

export function Icon({ name, size = 20, className, style, ...ariaProps }: IconProps) {
  const assetSrc = assetIcons[name]
  const toneClass = iconToneClasses[name as keyof typeof iconToneClasses]
  const classes = [toneClass, className].filter(Boolean).join(' ')

  if (assetSrc) {
    return (
      <Image
        src={assetSrc}
        width={size}
        height={size}
        className={classes || undefined}
        style={{ objectFit: 'contain', ...style }}
        alt={ariaProps['aria-label'] ?? ''}
        role={ariaProps.role}
        tabIndex={ariaProps.tabIndex}
        aria-hidden={ariaProps['aria-hidden'] ?? true}
        aria-label={ariaProps['aria-label']}
        aria-labelledby={ariaProps['aria-labelledby']}
        aria-describedby={ariaProps['aria-describedby']}
      />
    )
  }

  const IconComponent = Icons[name] as LucideIcon
  return (
    <IconComponent
      size={size}
      className={classes || undefined}
      style={style}
      aria-hidden={ariaProps['aria-hidden'] ?? true}
      {...ariaProps}
    />
  )
}
