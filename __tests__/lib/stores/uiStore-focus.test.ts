import { act } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useUIStore } from '@/lib/stores/uiStore'

describe('uiStore modal focus lifecycle', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    act(() => useUIStore.setState({ activeModal: null }))
  })

  it('restores focus to the trigger after closeModal when focus fell back to body', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    act(() => useUIStore.getState().openModal('album'))
    expect(useUIStore.getState().activeModal).toBe('album')

    // Modal unmount 後にフォーカスが body へ落ちたケースを再現
    trigger.blur()
    expect(document.activeElement).toBe(document.body)

    act(() => useUIStore.getState().closeModal())
    await new Promise((resolve) => requestAnimationFrame(resolve))

    expect(document.activeElement).toBe(trigger)
  })

  it('does not steal focus when another element already took it', async () => {
    const trigger = document.createElement('button')
    const other = document.createElement('input')
    document.body.append(trigger, other)
    trigger.focus()

    act(() => useUIStore.getState().openModal('album'))
    other.focus()

    act(() => useUIStore.getState().closeModal())
    await new Promise((resolve) => requestAnimationFrame(resolve))

    expect(document.activeElement).toBe(other)
  })

  it('does not throw when the trigger was removed from the DOM', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    act(() => useUIStore.getState().openModal('album'))
    trigger.remove()

    expect(() => act(() => useUIStore.getState().closeModal())).not.toThrow()
    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(document.activeElement).toBe(document.body)
  })

  it('falls back to persistent navigation button when original trigger is unmounted', async () => {
    const nav = document.createElement('nav')
    const navButton = document.createElement('button')
    nav.appendChild(navButton)
    const trigger = document.createElement('button')
    document.body.append(nav, trigger)
    trigger.focus()

    act(() => useUIStore.getState().openModal('album'))
    trigger.remove()

    act(() => useUIStore.getState().closeModal())
    await new Promise((resolve) => requestAnimationFrame(resolve))

    expect(document.activeElement).toBe(navButton)
  })
})
