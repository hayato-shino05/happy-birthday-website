// アプリ全体で共通して使うアニメーションバリアント

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const scaleInBounce = {
  initial: { opacity: 0, scale: 0 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    }
  },
  exit: { opacity: 0, scale: 0 },
}

export const slideInFromBottom = {
  initial: { opacity: 0, y: '100%' },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '100%' },
}

export const slideInFromTop = {
  initial: { opacity: 0, y: '-100%' },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '-100%' },
}

export const slideInFromLeft = {
  initial: { opacity: 0, x: '-100%' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '-100%' },
}

export const slideInFromRight = {
  initial: { opacity: 0, x: '100%' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '100%' },
}

export const rotate = {
  initial: { opacity: 0, rotate: -180 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 180 },
}

export const flip = {
  initial: { opacity: 0, rotateY: -180 },
  animate: { opacity: 1, rotateY: 0 },
  exit: { opacity: 0, rotateY: 180 },
}

// 子要素を時間差でアニメーションさせる設定
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

// ページ遷移用アニメーション
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3 },
}

// モーダル用アニメーション
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
}

// ホバー時に使うアニメーション（whileHover 用）
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 },
}

export const hoverLift = {
  y: -5,
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  transition: { duration: 0.2 },
}

export const hoverGlow = {
  boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
  transition: { duration: 0.2 },
}

// タップ時に使うアニメーション（whileTap 用）
export const tapScale = {
  scale: 0.95,
}

// 鼓動するようなアニメーション
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// 浮遊するアニメーション
export const float = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// シェイクアニメーション
export const shake = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
}

// バウンスアニメーション
export const bounce = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
}

// 回転アニメーション
export const spin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// トランジションのプリセット
export const transitions = {
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  smooth: {
    duration: 0.3,
    ease: 'easeInOut',
  },
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
  slow: {
    duration: 0.6,
    ease: 'easeInOut',
  },
}
