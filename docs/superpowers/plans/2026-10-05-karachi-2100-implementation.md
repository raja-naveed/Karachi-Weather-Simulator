# Karachi 2100 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, browser-only Three.js scenario simulator of near-future Karachi that responds visibly to climate and infrastructure interventions.

**Architecture:** A React app owns the selected scenario, time position, and display preferences. A pure simulation resolver derives all metrics and visual modifiers; React Three Fiber scene systems consume those modifiers while DOM components render accessible controls and narration. The deployment is a static Vite bundle with an explicit non-WebGL fallback.

**Tech Stack:** Vite, React, TypeScript, Three.js, React Three Fiber, Drei, React Three Postprocessing, Vitest, Testing Library, CSS.

**Spec:** `docs/superpowers/specs/2026-10-05-karachi-2100-design.md`

## Global Constraints

- The finished experience is browser-only and does not call AI services, APIs, maps, or a backend.
- The simulation is deterministic, local, replayable, and explicitly a visual scenario simulator rather than an engineering forecast.
- The main scene must evoke Karachi through coastline, port, dense districts, elevated roads, monsoon weather, and resilient infrastructure.
- All scenario and timeline controls are keyboard accessible; results must be readable without relying only on color.
- Use procedural/instanced geometry and quality settings to keep the visual experience performant.
- Add reduced-motion behavior and a functional no-WebGL fallback.

## Review Focus

- Invalid or absent scenario/time values resolve safely to baseline state rather than crashing; test in Task 2.
- Metric values remain clamped to 0–100 through every scenario/time combination; test in Task 2.
- Reset returns scene state, selected scenario, and timeline to baseline; test in Task 3.
- Keyboard users can activate a scenario and select a time point with meaningful labels; test in Task 3.
- WebGL unavailable or disabled displays the static simulation interface and controls rather than a blank page; test in Task 5.

---

## File Structure

- `package.json`: scripts and runtime/dev dependencies.
- `vite.config.ts`: Vite/Vitest configuration.
- `src/main.tsx`: application entry point.
- `src/App.tsx`: scene-support detection, application state, high-level layout.
- `src/simulation/types.ts`: scenario, time, metric, and resolved-state contracts.
- `src/simulation/scenarios.ts`: scenario metadata, metric curves, and narration source data.
- `src/simulation/resolveSimulation.ts`: pure deterministic resolver.
- `src/simulation/resolveSimulation.test.ts`: resolver behavior tests.
- `src/components/Hud.tsx`: accessible top bar, status and settings controls.
- `src/components/ScenarioDeck.tsx`: scenario selector.
- `src/components/Timeline.tsx`: semantic time selector.
- `src/components/ImpactPanel.tsx`: metric display.
- `src/components/NarrationCard.tsx`: scenario explanation panel.
- `src/components/FallbackCity.tsx`: non-WebGL visual fallback.
- `src/components/ControlPanel.test.tsx`: DOM behavior/accessibility tests.
- `src/scene/KarachiScene.tsx`: canvas, camera, lighting, postprocessing, top-level scene composition.
- `src/scene/City.tsx`: terrain, coastline, districts, roads, port, and landmark composition.
- `src/scene/Weather.tsx`: rain, haze, cloud and atmospheric visual modifiers.
- `src/scene/Traffic.tsx`: instanced vehicles and congestion behavior.
- `src/scene/Infrastructure.tsx`: lights, solar arrays, flood response, greenery, drones.
- `src/hooks/useReducedMotion.ts`: reduced-motion preference helper.
- `src/styles.css`: tokens, layouts, animations, responsive behavior.
- `src/test/setup.ts`: Testing Library matchers.

### Task 1: Establish the React/Three.js foundation

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `App` as the root React component and `npm run dev`, `npm run test`, `npm run build`, `npm run lint` scripts.
- Consumes: no application interfaces.

- [ ] **Step 1: Write the failing smoke test**

Create `src/App.test.tsx` with a test that renders `App` and expects the text `KARACHI 2100` and `Climate Survival Simulator`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- --run src/App.test.tsx`

Expected: FAIL because the project and `App` do not exist.

- [ ] **Step 3: Create the Vite React TypeScript app foundation**

Create the package configuration with React, Three.js, React Three Fiber, Drei, postprocessing, Vitest, and Testing Library. Implement `App()` with an intro/loading shell containing the required title and subtitle. Add CSS tokens for the midnight-navy, sandstone, teal, and warm-light palette.

- [ ] **Step 4: Run the smoke test**

Run: `npm run test -- --run src/App.test.tsx`

Expected: PASS.

- [ ] **Step 5: Run static checks**

Run: `npm run lint && npm run build`

Expected: both commands exit 0.

- [ ] **Step 6: Commit the foundation**

```bash
git add package.json vite.config.ts tsconfig.json index.html src
git commit -m "feat: establish Karachi 2100 app foundation"
```

### Task 2: Implement the deterministic simulation engine

**Files:**
- Create: `src/simulation/types.ts`, `src/simulation/scenarios.ts`, `src/simulation/resolveSimulation.ts`
- Test: `src/simulation/resolveSimulation.test.ts`

**Interfaces:**
- Produces: `resolveSimulation(input: SimulationInput): ResolvedSimulation`.
- Produces: `SCENARIOS`, `TIMELINE_STEPS`, `METRIC_LABELS`, and type-safe `ScenarioId`, `TimelineId` contracts.
- Consumes: no UI or scene interfaces.

- [ ] **Step 1: Write failing resolver tests**

Test baseline values at `now`, a `coastal-surge` state at `ten-years` with lower safety/mobility and high water level, a `solar-transition` state with increased grid stability/air quality, clamping on all metrics, and fallback behavior for invalid IDs.

- [ ] **Step 2: Run resolver tests to verify they fail**

Run: `npm run test -- --run src/simulation/resolveSimulation.test.ts`

Expected: FAIL because resolver exports do not exist.

- [ ] **Step 3: Implement the simulation contracts and resolver**

Define `SimulationInput` as `{ scenarioId: ScenarioId; timelineId: TimelineId; intensity: number }`. Define `ResolvedSimulation` with metrics, weather, city lighting, traffic, flood, greenery, solar, drone, narration, and palette modifiers. Implement `resolveSimulation` as pure scenario/time curves with all output values clamped to their documented ranges.

- [ ] **Step 4: Run resolver tests**

Run: `npm run test -- --run src/simulation/resolveSimulation.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the simulation engine**

```bash
git add src/simulation
git commit -m "feat: add deterministic Karachi scenario simulation"
```

### Task 3: Build the accessible simulation interface

**Files:**
- Create: `src/components/Hud.tsx`, `src/components/ScenarioDeck.tsx`, `src/components/Timeline.tsx`, `src/components/ImpactPanel.tsx`, `src/components/NarrationCard.tsx`
- Modify: `src/App.tsx`, `src/styles.css`
- Test: `src/components/ControlPanel.test.tsx`

**Interfaces:**
- Consumes: `SCENARIOS`, `TIMELINE_STEPS`, `METRIC_LABELS`, and `ResolvedSimulation` from `src/simulation`.
- Produces: UI callbacks `onScenarioChange(id: ScenarioId)`, `onTimelineChange(id: TimelineId)`, and `onReset(): void`.

- [ ] **Step 1: Write failing control tests**

Render the control components in `App` and test: scenario buttons expose names, a selected scenario sets `aria-pressed`, the timeline changes the narration/metrics, reset restores the baseline title/narration, and each metric has text label plus value.

- [ ] **Step 2: Run control tests to verify they fail**

Run: `npm run test -- --run src/components/ControlPanel.test.tsx`

Expected: FAIL because controls are not implemented.

- [ ] **Step 3: Implement app state and HUD components**

Store `scenarioId`, `timelineId`, `intensity`, cinematic mode, sound state, and quality mode in `App`. Wire it to `resolveSimulation`. Implement semantic buttons/inputs with tooltips, keyboard focus styles, a clear reset button, named metric cards, and responsive layout behavior.

- [ ] **Step 4: Run control tests**

Run: `npm run test -- --run src/components/ControlPanel.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the interface**

```bash
git add src/App.tsx src/components src/styles.css
git commit -m "feat: add accessible simulator controls"
```

### Task 4: Compose the high-impact Karachi Three.js scene

**Files:**
- Create: `src/scene/KarachiScene.tsx`, `src/scene/City.tsx`, `src/scene/Weather.tsx`, `src/scene/Traffic.tsx`, `src/scene/Infrastructure.tsx`, `src/hooks/useReducedMotion.ts`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces:**
- Consumes: `ResolvedSimulation` and `quality: 'cinematic' | 'balanced' | 'performance'`.
- Produces: `KarachiScene({ simulation, quality, cinematic }: KarachiSceneProps)`.

- [ ] **Step 1: Add a component contract type check**

Create the typed `KarachiSceneProps` interface and import it in `App`; run `npm run build` before implementation to verify the missing export causes a type/build failure.

- [ ] **Step 2: Implement the scene composition**

Create a full-viewport R3F canvas with an animated aerial camera, fog, directional/ambient lighting, bloom/color grading. Compose coastline/water, four differentiated districts, port cranes, elevated roads, instanced buildings and traffic, and scenario-driven overlays. Use procedural primitive geometry only; do not fetch assets.

- [ ] **Step 3: Implement scenario visual response systems**

Use resolved modifiers to control rainfall, clouds/haze, traffic density, water height, district lights, emergency drones, rooftop solar, and greenery. Honor `prefers-reduced-motion` by stopping nonessential camera and particle motion.

- [ ] **Step 4: Run production build and inspect bundle warnings**

Run: `npm run build`

Expected: exits 0 with no missing module or type errors.

- [ ] **Step 5: Commit the scene**

```bash
git add src/scene src/hooks src/App.tsx src/styles.css
git commit -m "feat: create cinematic Karachi 2100 scene"
```

### Task 5: Add resilience, presentation polish, and end-to-end verification

**Files:**
- Create: `src/components/FallbackCity.tsx`
- Modify: `src/App.tsx`, `src/styles.css`, `src/App.test.tsx`

**Interfaces:**
- Consumes: resolved simulation data and `webglSupported: boolean`.
- Produces: functional fallback interface that preserves scenarios, timeline, and metrics.

- [ ] **Step 1: Write the failing fallback test**

Mock unavailable WebGL support and render `App`; expect a visible `2D simulation view` label alongside scenario controls and current metrics.

- [ ] **Step 2: Run the fallback test to verify it fails**

Run: `npm run test -- --run src/App.test.tsx`

Expected: FAIL because no fallback exists.

- [ ] **Step 3: Implement fallback and final presentation states**

Add feature detection in `App`; render `FallbackCity` when WebGL is unavailable. Add initial loading transition, quality controls, sound toggle UI, cinematic-mode decluttering, empty-state-safe labels, and responsive mobile bottom-sheet styles.

- [ ] **Step 4: Run all automated checks**

Run: `npm run test -- --run && npm run lint && npm run build`

Expected: all commands exit 0.

- [ ] **Step 5: Perform browser verification**

Run the dev server. Verify that the landing screen appears, coastal surge visibly raises water/changes metrics, solar transition improves metrics, reset returns baseline, the mobile layout keeps controls reachable, and the console has no errors.

- [ ] **Step 6: Commit the final experience**

```bash
git add src
git commit -m "feat: finish Karachi 2100 simulator"
```

## Plan Self-Review

- **Spec coverage:** Tasks 1–5 cover static browser deployment, deterministic simulation, scene composition, UI, accessibility, performance, fallback, and browser verification.
- **Step scan:** Each task begins with a concrete failing check and ends with a specific verification command; implementation steps define module boundaries and interfaces without transcribing implementation bodies.
- **Type consistency:** `ScenarioId`, `TimelineId`, `ResolvedSimulation`, `SimulationInput`, and `KarachiSceneProps` are defined once and consumed consistently.
- **Review focus:** Invalid input, clamping, reset, keyboard usage, and no-WebGL behavior each appear in explicit tests.
- **Proportion:** The plan breaks the new application into five independently reviewable milestones without prescribing scene implementation line by line.
