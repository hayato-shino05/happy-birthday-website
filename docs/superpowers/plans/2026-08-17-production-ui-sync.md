# Production UI Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đồng bộ phần giao diện, responsive mobile và các hiệu ứng nhìn thấy được của `happy-birthday-website` với baseline đã kiểm chứng trong `D:\Github-Project\happy-birthday-production`, nhưng giữ nguyên i18n `en|ja`, SSR locale cookie, theme runtime, modal graph, backend, Supabase contract và các Cubic fixes.

**Architecture:** Port chọn lọc các UI/effect component có cùng prop và modal contract, không thay thế toàn bộ application shell. `GameButtons` sẽ dùng hai nhánh desktop/mobile và tái sử dụng `MobileGameMenu` locale-aware hiện tại; bốn falling/floating effects sẽ dùng lifecycle spawn/cleanup của production trong cùng prop contract `count?: number`, `active?: boolean`. `Fireworks` là một spike đánh giá riêng, chỉ được rewrite nếu browser/performance evidence chứng minh Canvas phù hợp mà không làm mất behavior hiện tại.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Framer Motion, Lucide React, Tailwind/CSS trong `app/globals.css`, Vitest và Testing Library nếu harness hiện tại đã hỗ trợ.

**Spec:** Phạm vi UI sync đã được người dùng duyệt trong yêu cầu hiện tại và kết quả khảo sát hai repository trước khi lập plan.

## Global Constraints

- Giữ nguyên generated i18n và locale union `en|ja`; không copy fallback hardcoded Vietnamese từ production.
- Giữ SSR locale cookie, `LanguageProvider`, theme runtime, `MainLayout`, `ModalManager`, `uiStore`, backend, Supabase schema/RPC và Cubic fixes.
- Không overwrite toàn bộ `app/globals.css`; chỉ sửa rule mobile thật sự cần thiết.
- Không copy `max-width: auto`; declaration này không hợp lệ, dùng `max-width: none` hoặc bỏ hẳn nếu cần.
- Không port production `HeaderButtons`, `MusicPlayer`, `SocialButtons`, community/media stack, `config/themes.ts`, `types/index.ts` hoặc `app/layout.tsx`.
- Không mount video surface mới và không thêm orphan feature vào execution path.
- Không port `Fireworks` Canvas rewrite trong cùng một diff với bốn effect nếu chưa có mobile/performance proof.
- Trước khi sửa bất kỳ function/component nào, chạy GitNexus `impact` hướng upstream và ghi nhận direct callers, affected processes và risk.
- Mọi commit/comment/review surface phải dùng tiếng Nhật, không thêm `Co-Authored-By`, `Generated with` hoặc AI attribution.
- Không stage `.claude/`, `.agents/`, `.harness-core/`, `.codegraph/`, `docs/harness/**`, `tmp_*`, screenshots hoặc orphan feature files.
- Không deploy, không apply migration remote và không thay đổi production repository.
- Tôn trọng `prefers-reduced-motion`, cleanup timer/animation khi inactive hoặc unmount, touch target tối thiểu 44px và trạng thái keyboard/focus của mobile menu.

---

## File Map

### UI/mobile

- Modify: `components/ui/GameButtons.tsx` để dùng Lucide icons, desktop branch và `MobileGameMenu` branch.
- Keep unchanged unless evidence requires it: `components/ui/MobileGameMenu.tsx`; component này là bản locale-aware của target.
- Modify only relevant declarations: `app/globals.css`; giữ các class `.games-desktop-only`, `.games-mobile-only` và mobile menu hiện có, chỉ điều chỉnh collision/position/target size khi browser proof cho thấy cần.
- Inspect/verify: `components/layout/MainLayout.tsx`, hai caller của `GameButtons`.

### Effects

- Modify: `components/effects/FallingPetals.tsx`.
- Modify: `components/effects/FallingLeaves.tsx`.
- Modify: `components/effects/FallingSnow.tsx`.
- Modify: `components/effects/FloatingLanterns.tsx`.
- Inspect, normally keep unchanged: `components/effects/ThemeEffects.tsx`; its dispatch and prop contract remain stable.
- Inspect only for the spike: `components/features/Fireworks.tsx`.

### Tests and verification

- Create or modify: `__tests__/components/ui/GameButtons.test.tsx` for desktop/mobile render contract, localized labels and modal IDs, using the repository's existing Vitest/Testing Library setup.
- Create or modify: `__tests__/components/effects/ThemeEffects.test.tsx` only if the existing test harness can mock Framer Motion without adding dependencies; otherwise use a focused source/contract test that verifies active/count forwarding and keep it deterministic.
- Do not create broad visual snapshots as the only proof; browser smoke at desktop and mobile viewports is required.

---

## Task 1: Lock the target behavior and impact map

**Files:**
- Read: `D:\Github-Project\happy-birthday-production\components\ui\GameButtons.tsx` and the four production effect files.
- Read: target counterparts listed in File Map.
- Test: existing test configuration and scripts only; no product edit in this step.

**Interfaces:**
- Consumes: current target source and production `main` at `b5e1376`.
- Produces: a written list in the execution notes of exact files/symbols to edit, current props, caller paths and exclusions.

- [ ] **Step 1: Verify repository bases and clean-scope assumptions**

Run:

```bash
git status --short --untracked-files=all
git -C D:/Github-Project/happy-birthday-production rev-parse HEAD
git -C D:/Github-Project/happy-birthday-production status --short --untracked-files=all
```

Expected: target remains on the intended branch with known pre-existing untracked harness/temp files; production remains read-only and its unrelated `package-lock.json`/`.serena/` changes are not copied.

- [ ] **Step 2: Run impact before every planned component edit**

Use GitNexus for `GameButtons`, `FallingPetals`, `FallingLeaves`, `FallingSnow`, `FloatingLanterns`, and `Fireworks`, each with `direction: "upstream"`. Record direct callers and affected processes. If any result is HIGH or CRITICAL, stop that edit and report the warning before proceeding.

- [ ] **Step 3: Confirm target/production contracts**

Verify these invariants before implementation:

```ts
type EffectProps = {
  count?: number
  active?: boolean
}

const modalIds = ['memoryGame', 'puzzleGame', 'calendar', 'quiz'] as const
```

Expected: target `MobileGameMenu` supplies labels and aria text through `useLanguage`, and target `useUIStore.openModal` accepts all four IDs.

---

## Task 2: Port `GameButtons` and activate the existing mobile menu

**Files:**
- Modify: `components/ui/GameButtons.tsx`.
- Test: `__tests__/components/ui/GameButtons.test.tsx`.
- Verify only: `components/ui/MobileGameMenu.tsx`, `app/globals.css`.

**Interfaces:**
- Consumes: `useLanguage`, `useUIStore`, existing `MobileGameMenu`, existing `.games-desktop-only`/`.games-mobile-only` CSS.
- Produces: `GameButtons()` renders one mobile menu branch and one desktop branch; desktop buttons preserve modal IDs and localized labels.

- [ ] **Step 1: Write the failing render contract test**

Use the existing test setup and mock only the store/provider boundaries already used by nearby tests. The test must assert the structural contract, not implementation details of Lucide:

```tsx
it('renders the locale-aware mobile menu and localized desktop games', () => {
  render(<GameButtons />)

  expect(screen.getByTestId('mobile-game-menu')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /memory/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /puzzle/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /calendar/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /quiz/i })).toBeInTheDocument()
})
```

If the existing `MobileGameMenu` has no test id, use its stable accessible name or add no new production test id solely for this plan. Adapt the assertions to the actual locale fixture and do not hardcode Vietnamese labels.

- [ ] **Step 2: Run the focused test and verify it fails for the old structure**

Run:

```bash
npx vitest run --exclude '.claude/**' --exclude 'node_modules/**' __tests__/components/ui/GameButtons.test.tsx
```

Expected: FAIL because the current target renders emoji buttons only and does not render `MobileGameMenu` or Lucide icon branches.

- [ ] **Step 3: Implement the smallest production-aligned component change**

Port only this structure, retaining target translations and store:

```tsx
import { Brain, Puzzle, Calendar, HelpCircle } from 'lucide-react'
import { MobileGameMenu } from './MobileGameMenu'

return (
  <>
    <div className="games-mobile-only">
      <MobileGameMenu />
    </div>
    <div className="games-container games-desktop-only" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {games.map((game) => {
        const IconComponent = game.icon
        return (
          <button key={game.id} className="game-button" onClick={() => openModal(game.id)} style={gameButtonStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <IconComponent size={16} aria-hidden="true" />
            <span>{game.label}</span>
          </button>
        )
      })}
    </div>
  </>
)
```

Keep `t('...')` as the source of labels. Do not import production `MobileGameMenu`, `GAMES`, or hardcoded Vietnamese fallback.

- [ ] **Step 4: Run focused test, lint and build checks**

Run:

```bash
npx vitest run --exclude '.claude/**' --exclude 'node_modules/**' __tests__/components/ui/GameButtons.test.tsx
npx eslint components/ui/GameButtons.tsx __tests__/components/ui/GameButtons.test.tsx
npm run build
```

Expected: focused test passes; lint has no newly introduced error; build passes. Classify any pre-existing unrelated failures separately.

- [ ] **Step 5: Browser-check desktop and mobile behavior**

At `http://localhost:3000`, inspect at a desktop viewport and a mobile viewport. Assert:

- desktop shows four icon-labelled game buttons;
- mobile shows one menu toggle, not four overlapping fixed buttons;
- toggle has localized accessible name, `aria-expanded`, visible focus and keyboard open/close;
- opening a game still calls the same modal ID;
- game menu does not cover music/social controls at the target breakpoints.

Capture no screenshot into the commit; temporary evidence must remain untracked.

- [ ] **Step 6: Commit the self-contained UI slice**

After `git diff --check` and `mcp__gitnexus__detect_changes({ scope: "all" })`, stage only the component/test files and commit with a Japanese human-clean message, for example:

```bash
git add components/ui/GameButtons.tsx __tests__/components/ui/GameButtons.test.tsx
git commit -m "ゲームボタンのモバイル表示を本番版に合わせる"
```

Do not stage `app/globals.css` unless a separate CSS change was proven necessary.

---

## Task 3: Port `FallingPetals` with bounded lifecycle

**Files:**
- Modify: `components/effects/FallingPetals.tsx`.
- Test: `__tests__/components/effects/ThemeEffects.test.tsx` or the smallest existing effect contract test.

**Interfaces:**
- Consumes: `ThemeEffects` dispatch with `count?: number`, `active?: boolean`.
- Produces: continuous spawn, bounded collection, deterministic cleanup on inactive/unmount, no caller API change.

- [ ] **Step 1: Run GitNexus impact and write the failing lifecycle contract test**

Test the externally observable behavior by mocking timers and the animation module only if the existing harness supports it:

```tsx
it('does not retain petals when inactive', () => {
  const { rerender } = render(<FallingPetals count={3} active />)
  rerender(<FallingPetals count={3} active={false} />)
  expect(document.querySelectorAll('[data-effect="petal"]').length).toBe(0)
})
```

If there is no existing stable selector, use the component's rendered container and add a semantic `data-effect` only when needed for a deterministic test, not for production styling.

- [ ] **Step 2: Run the focused test and verify the baseline limitation**

Run the focused test with the repository's Vitest excludes. Expected: fail or expose that the old implementation replaces all petals on a fixed 15-second interval and has no continuous bounded spawn.

- [ ] **Step 3: Port production lifecycle and visual model without changing props**

Use the production algorithm: initial collection around `count * 0.6`, spawn one or two petals every roughly `0.8–1.4s`, cap collection at `count * 1.5`, cleanup based on `duration + delay`, and retain `AnimatePresence`. Keep all random values inside creation, not inside render-time animation targets. Keep SVG petal rendering and `prefers-reduced-motion` behavior aligned with the target's existing conventions.

- [ ] **Step 4: Verify test, lint and diff scope**

Run the focused effect test, `npx eslint components/effects/FallingPetals.tsx ...`, `git diff --check`, and `mcp__gitnexus__detect_changes({ scope: "all" })`. Expected: only the intended effect and test symbols change.

- [ ] **Step 5: Commit**

```bash
git add components/effects/FallingPetals.tsx __tests__/components/effects/ThemeEffects.test.tsx
git commit -m "桜の花びらエフェクトを本番版に合わせる"
```

---

## Task 4: Port `FallingLeaves` and `FallingSnow`

**Files:**
- Modify: `components/effects/FallingLeaves.tsx`.
- Modify: `components/effects/FallingSnow.tsx`.
- Test: the focused effect contract test from Task 3, extended with one case per component.

**Interfaces:**
- Consumes: unchanged `ThemeEffects` dispatch and effect props.
- Produces: production-style continuous lifecycle while preserving target component exports and no extra dependencies.

- [ ] **Step 1: Run impact for both components before editing**

Record `ThemeEffects` as the only known production caller and confirm no route/backend dependency.

- [ ] **Step 2: Add failing tests for inactive cleanup and bounded spawn**

Use fake timers and assert that rerendering with `active={false}` removes the effect layer. Add a cap assertion after advancing timers so the component does not grow without bound:

```tsx
it('clears snow when inactive and keeps the collection bounded', () => {
  const { rerender } = render(<FallingSnow count={4} active />)
  vi.advanceTimersByTime(5000)
  expect(document.querySelectorAll('[data-effect="snow"]').length).toBeLessThanOrEqual(8)
  rerender(<FallingSnow count={4} active={false} />)
  expect(document.querySelectorAll('[data-effect="snow"]').length).toBe(0)
})
```

Repeat the same contract for leaves with the corresponding selector.

- [ ] **Step 3: Implement production lifecycle in both components**

For leaves, port the production spawn timeout and bounded wind-gust scheduling, with all timeout handles cleared on cleanup. For snow, port initial distribution, small periodic batches, collection cap, cleanup interval and stable per-item horizontal target generated at creation time. Do not leave `Math.random()` in JSX render expressions because that causes animation target churn on rerender.

- [ ] **Step 4: Respect reduced motion and mobile cost**

Use the existing project reduced-motion hook/convention if already available. When reduced motion is enabled, keep the visual layer static or use a single short transition rather than continuous rotation/sway. Do not increase counts beyond the supplied `count`; use CSS/Framer Motion already installed.

- [ ] **Step 5: Run focused checks and review the diff**

```bash
npx vitest run --exclude '.claude/**' --exclude 'node_modules/**' __tests__/components/effects/ThemeEffects.test.tsx
npx eslint components/effects/FallingLeaves.tsx components/effects/FallingSnow.tsx __tests__/components/effects/ThemeEffects.test.tsx
git diff --check
```

Expected: tests and lint pass without changing `ThemeEffects` dispatch.

- [ ] **Step 6: Commit the paired effect slice**

```bash
git add components/effects/FallingLeaves.tsx components/effects/FallingSnow.tsx __tests__/components/effects/ThemeEffects.test.tsx
git commit -m "落ち葉と雪のエフェクトを本番版に合わせる"
```

---

## Task 5: Port `FloatingLanterns` without importing production app contracts

**Files:**
- Modify: `components/effects/FloatingLanterns.tsx`.
- Test: `__tests__/components/effects/ThemeEffects.test.tsx`.

**Interfaces:**
- Consumes: target `ThemeEffects` and existing effect props.
- Produces: production-style lantern spawn/cleanup and richer SVG/shape rendering, with no theme/i18n/store/backend import.

- [ ] **Step 1: Run GitNexus impact before editing**

Confirm only `ThemeEffects` renders the component and no code depends on its internal `Lantern` type.

- [ ] **Step 2: Add the failing inactive/cleanup test**

```tsx
it('clears lanterns when the effect is deactivated', () => {
  const { rerender } = render(<FloatingLanterns count={3} active />)
  rerender(<FloatingLanterns count={3} active={false} />)
  expect(document.querySelectorAll('[data-effect="lantern"]').length).toBe(0)
})
```

- [ ] **Step 3: Implement the minimum production visual port**

Port production's bounded initial collection, 2–4 second spawn schedule, 5-second cleanup, color schemes and three lantern renderers only if they remain self-contained. Keep the target's existing `useMemo`/SVG conventions and generate IDs that are stable for each mounted renderer. Keep the root `pointer-events: none`, z-layer and overflow behavior.

- [ ] **Step 4: Run checks and browser smoke**

Run the focused effect test, ESLint, `npm run build`, then inspect a theme that enables lanterns at 390px and desktop widths. Verify no fixed overlay blocks menu/music/social controls and no hydration warning appears.

- [ ] **Step 5: Commit**

```bash
git add components/effects/FloatingLanterns.tsx __tests__/components/effects/ThemeEffects.test.tsx
git commit -m "提灯エフェクトを本番版に合わせる"
```

---

## Task 6: Review responsive CSS and port only proven rules

**Files:**
- Modify only if browser evidence requires it: `app/globals.css`.
- Inspect: production `app/globals.css`, target `app/globals.css`, `components/layout/MainLayout.tsx`, `components/ui/SocialButtons.tsx`, `components/ui/MusicPlayer.tsx`.
- Test: browser smoke at 390x844, 768x1024 and 1440x900; existing accessibility checks if available.

**Interfaces:**
- Consumes: Task 2's class names and existing target layout.
- Produces: responsive placement without changing unrelated controls or introducing invalid CSS.

- [ ] **Step 1: Compare the exact relevant selectors**

Compare only `.games-desktop-only`, `.games-mobile-only`, `.mobile-game-menu`, `.mobile-game-toggle`, `.mobile-game-dropdown`, `.mobile-game-item`, game-control positioning, and any rule that directly collides with fixed social/music controls.

- [ ] **Step 2: Reproduce the collision before changing CSS**

At each viewport, verify whether the target actually clips, overlaps or makes a primary action unreachable. Record the failing viewport and selector. Do not port production's `max-width: auto`.

- [ ] **Step 3: Apply the smallest CSS correction**

Prefer existing target tokens and rules. If a max-width reset is needed, use `max-width: none`; if positioning is needed, change only the mobile breakpoint declaration and preserve the desktop rule. Keep touch targets at least 44px and visible focus.

- [ ] **Step 4: Run browser and static checks**

Run `npm run build`, scoped ESLint for changed CSS-adjacent TS files, `git diff --check`, and the browser smoke matrix. Expected: no horizontal scroll, no unreachable fixed action, and no console warnings introduced by the CSS change.

- [ ] **Step 5: Commit only when CSS is proven necessary**

```bash
git add app/globals.css
git commit -m "モバイルゲームメニューの配置を調整する"
```

If the existing CSS already passes the matrix, do not create a CSS commit.

---

## Task 7: Evaluate `Fireworks` as a separate performance decision

**Files:**
- Inspect: target `components/features/Fireworks.tsx`.
- Inspect: production `components/features/Fireworks.tsx`.
- Modify: none unless the spike produces evidence and the user explicitly accepts the rewrite scope.

**Interfaces:**
- Consumes: `ThemeEffects` `fireworks` dispatch and `count?: number`, `active?: boolean`.
- Produces: a decision record with measured browser evidence, not an automatic rewrite.

- [ ] **Step 1: Run impact and record the current render path**

Confirm `ThemeEffects` is the caller and note DOM particle count, interval cadence, z-layer and cleanup behavior.

- [ ] **Step 2: Run a matched desktop/mobile browser probe**

For the same theme and `count`, compare target and production only at equivalent viewport sizes. Record:

- console errors/warnings;
- number of mounted effect nodes or canvas contexts;
- animation start/stop when `active` changes;
- whether controls remain clickable;
- rough frame behavior from DevTools performance trace, without claiming a benchmark if no trace was captured.

- [ ] **Step 3: Choose one of two outcomes**

If current DOM fireworks are visually acceptable and mobile remains responsive, keep the target implementation and document the skipped Canvas rewrite. If the current implementation causes a reproduced mobile defect and production Canvas resolves it, create a separate approved implementation plan before editing; do not mix that rewrite into this UI sync.

- [ ] **Step 4: Verify no accidental Fireworks diff**

Run `git diff -- components/features/Fireworks.tsx` and `mcp__gitnexus__detect_changes({ scope: "all" })`. Expected: no Fireworks code change in this plan unless a separately approved scope exists.

---

## Task 8: Full verification and scope gate

**Files:**
- Verify all changed files only; no new product files outside the allowlist.

- [ ] **Step 1: Run focused tests**

```bash
npx vitest run --exclude '.claude/**' --exclude 'node_modules/**' \
  __tests__/components/ui/GameButtons.test.tsx \
  __tests__/components/effects/ThemeEffects.test.tsx
```

Expected: all new/changed behavior passes.

- [ ] **Step 2: Run project checks**

```bash
npm run pretest
npm run build
npx tsc --noEmit
npx eslint components/ui/GameButtons.tsx components/effects/FallingPetals.tsx components/effects/FallingLeaves.tsx components/effects/FallingSnow.tsx components/effects/FloatingLanterns.tsx
node --check scripts/compare-festival-catalogs.mjs
git diff --check
```

Classify known pre-existing type/lint failures separately; do not hide or reformat unrelated files.

- [ ] **Step 3: Run browser smoke matrix**

Check desktop and mobile viewports with English and Japanese locale, a theme with each ported effect, menu keyboard interaction, modal opening, console errors and failed network requests. Do not perform community writes, migration calls or deployment.

- [ ] **Step 4: Run final impact/change analysis**

Run `mcp__gitnexus__detect_changes({ scope: "compare", base_ref: "main" })` and inspect changed symbols/processes. Confirm only UI/effect paths are included and no harness/backend/i18n/theme runtime file slipped into the product diff.

- [ ] **Step 5: Scope and artifact audit**

```bash
git status --short --untracked-files=all
git diff --name-only main...HEAD
```

Reject any staged/committed path under `.claude/`, `.agents/`, `.harness-core/`, `.codegraph/`, `docs/harness/`, `tmp_*`, screenshots, Supabase/backend, or orphan feature bundles.

- [ ] **Step 6: Final self-review**

Confirm:

- `GameButtons` labels remain locale-driven and modal IDs are unchanged.
- Mobile menu has accessible name, `aria-expanded`, keyboard close behavior and touch targets.
- Effects clear state/timers on inactive/unmount and do not randomize animation targets during render.
- No invalid CSS was copied.
- Reduced-motion behavior and mobile interaction remain usable.
- Fireworks decision is evidence-backed and its rewrite is explicitly deferred unless separately approved.

---

## Commit Sequence

1. `ゲームボタンのモバイル表示を本番版に合わせる`
2. `桜の花びらエフェクトを本番版に合わせる`
3. `落ち葉と雪のエフェクトを本番版に合わせる`
4. `提灯エフェクトを本番版に合わせる`
5. `モバイルゲームメニューの配置を調整する` only if CSS evidence requires it

Each commit is independently tested, reviewed with `git diff --check`, and checked with GitNexus before the next task. No commit includes harness, temporary evidence, backend, Supabase, i18n, theme runtime or orphan files.

## Self-Review

- Scope covers the requested UI, mobile and effects work without wholesale production-copy risk.
- The plan keeps `GameButtons` first, separates `Fireworks` from the four safe effect ports, and makes CSS conditional on reproduced evidence.
- Every behavior-changing task has a focused test, browser check or explicit performance probe.
- No step relies on an undefined helper or a vague “handle edge cases” instruction.
- Existing production labels, stores and app shell are explicitly excluded where their contracts differ.

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-08-17-production-ui-sync.md`. Execute with a fresh subagent per task and a review checkpoint after each commit. Use the exact target worktree and keep the parent branch free of unapproved files; stop before any Fireworks rewrite if the performance evidence is inconclusive.
