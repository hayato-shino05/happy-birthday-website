import { 
  Music, 
  Folder, 
  Camera, 
  Video, 
  MessageCircle, 
  ClipboardList,
  Cake,
  Mic,
  Wind,
  PenLine,
  Users,
  Gift,
  Image as ImageIcon,
  Volume2,
  Trophy,
  PartyPopper,
  type LucideIcon
} from 'lucide-react'

export const Icons = {
  Music,
  Folder,
  Camera,
  Video,
  MessageCircle,
  ClipboardList,
  Cake,
  Mic,
  Wind,
  PenLine,
  Users,
  Gift,
  Image: ImageIcon,
  Volume: Volume2,
  Trophy,
  Party: PartyPopper,
} as const

interface IconProps {
  name: keyof typeof Icons
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function Icon({ name, size = 20, className, style }: IconProps) {
  const IconComponent = Icons[name] as LucideIcon
  return <IconComponent size={size} className={className} style={style} />
}
