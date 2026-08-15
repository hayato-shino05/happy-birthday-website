import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useThemeContext } from '@/lib/providers/ThemeProvider'

vi.mock('@/lib/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'spring',
    themeConfig: {
      name: 'spring',
      displayName: { vi: 'Mùa Xuân', en: 'Spring', ja: '春' },
      colors: { primary: '#000', secondary: '#111', background: '#222', text: '#fff', accent: '#333' },
      gradient: 'from-pink-100 to-pink-200',
      effects: [],
    },
    setTheme: vi.fn(),
    isAutoDetect: true,
    setAutoDetect: vi.fn(),
  }),
}))

describe('ThemeProvider render smoke', () => {
  it('renders the existing provider contract', () => {
    function Probe() {
      const { currentTheme, themeConfig } = useThemeContext()
      return createElement('output', { 'data-testid': 'theme-probe' }, `${currentTheme}:${themeConfig.name}`)
    }

    render(createElement(ThemeProvider, null, createElement(Probe)))

    expect(screen.getByTestId('theme-probe').textContent).toBe('spring:spring')
  })
})
