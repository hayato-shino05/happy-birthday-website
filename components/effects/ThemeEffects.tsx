'use client'

import { FallingPetals } from './FallingPetals'
import { FallingLeaves } from './FallingLeaves'
import { FallingSnow } from './FallingSnow'
import { FloatingLanterns } from './FloatingLanterns'
import { Fireworks } from '../features/Fireworks'
import type { ThemeEffect } from '@/config/themes'

interface ThemeEffectsProps {
  effects: ThemeEffect[]
  active?: boolean
}

// テーマエフェクトを統合するコンポーネント
export function ThemeEffects({ effects, active = true }: ThemeEffectsProps) {
  if (!active || !effects || effects.length === 0) return null

  return (
    <>
      {effects.map((effect, index) => {
        switch (effect.type) {
          case 'fallingPetals':
            return <FallingPetals key={`petal-${index}`} count={effect.count} active={active} />
          case 'fallingLeaves':
            return <FallingLeaves key={`leaf-${index}`} count={effect.count} active={active} />
          case 'fallingSnow':
            return <FallingSnow key={`snow-${index}`} count={effect.count} active={active} />
          case 'floatingLanterns':
            return <FloatingLanterns key={`lantern-${index}`} count={effect.count} active={active} />
          case 'fireworks':
            return <Fireworks key={`firework-${index}`} count={effect.count} active={active} />
          // 他のエフェクトは今後追加予定
          default:
            return null
        }
      })}
    </>
  )
}
