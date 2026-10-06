# Karachi 2100 Cinematic Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Karachi 2100 into a cinema-first hybrid 3D flight experience with a believable near-future waterfront, staged scenario transformations, user camera control, and a resilient 2D fallback.

**Architecture:** The existing deterministic resolver remains the sole source of scenario outcomes. A pure `CinematicDirector` derives camera and staging data; Three.js systems render layered atmosphere, a local skyline environment asset, rich foreground geometry, and scenario choreography. React owns only visitor preferences and accessible controls, while the fallback reuses the same resolver output.

**Tech Stack:** React, TypeScript, Vite, Three.js, React Three Fiber, Drei, React Three Postprocessing, Vitest, Testing Library, original local image asset, CSS.

**Spec:** `docs/superpowers/specs/2026-10-06-karachi-2100-cinematic-rebuild-design.md`

## Global Constraints

- The final application has no runtime AI, account, backend, map API, external data dependency, remote asset, or licensed third-party 3D asset pack.
- The result is an imagined future Karachi, not a literal city map, engineering forecast, or scientific climate model.
- The existing resolver remains the sole source of scenario/timeline behavior; rendering code must consume its output and never duplicate scenario formulae.
- The first viewport must prioritize the cinematic city scene over a control-heavy dashboard.
- Use one local, original skyline horizon asset only; all foreground behavior remains interactive Three.js geometry.
- Preserve keyboard-accessible scenario/timeline controls, readable text alternatives, reduced-motion behavior, low/balanced/high quality settings, and a functional 2D fallback.
- Keep quality-mode values `'low' | 'balanced' | 'high'` and use serial Vitest verification on this host: `--maxWorkers=1 --no-file-parallelism`.

## Review Focus

- User takeover of the camera must never leave the view pointed into empty space or prevent returning to the automatic flight; test in Task 1 and visually verify in Task 4.
- A zero-motion user preference must disable camera travel and nonessential visual motion without hiding scene information; test director output in Task 1 and visually verify in Task 4.
- The renderer must treat absent/unloaded horizon art as a graceful visual degradation, not a blank scene; verify in Task 2.
- Scene scenario visuals must follow the resolver's returned fields rather than reimplement scenario curves; inspect in Task 3 and exercise through existing control tests.
- WebGL-unavailable browsers must retain scenario/timeline controls, narration, metrics, and reset behavior in the `2D simulation view`; test in Task 4.

---

## File Structure

- `public/karachi-monsoon-horizon.png`: original wide atmospheric skyline environment artwork.
- `src/scene/director.ts`: pure camera/staging resolver.
- `src/scene/director.test.ts`: deterministic director tests.
- `src/scene/CameraRig.tsx`: automatic flight and constrained user takeover.
- `src/scene/Atmosphere.tsx`: horizon backdrop, clouds, haze, lightning, local color treatment.
- `src/scene/Waterfront.tsx`: enhanced sea, foam/flood edge, wet roadway material response.
- `src/scene/MaterialCity.tsx`: higher-detail façade/window/material treatment and hero anchors.
- `src/scene/SceneChoreography.tsx`: scenario-driven visual staging consuming resolver/director outputs.
- `src/scene/KarachiScene.tsx`: composition root for camera, atmosphere, city, waterfront and choreography.
- `src/components/CinematicHUD.tsx`: compact film-like scene controls and status tray.
- `src/components/FallbackCity.tsx`: no-WebGL layered 2D coastal simulation view.
- `src/App.tsx`: capability detection, accessible fallback branch, flight preference, compact visual-first layout.
- `src/App.test.tsx`: fallback and root resilience tests.
- `src/styles.css`: visual-first shell, loading reveal, cinematic HUD, responsive/motion styles.

### Task 1: Add the deterministic cinematic director and camera contract

**Files:**
- Create: `src/scene/director.ts`, `src/scene/director.test.ts`, `src/scene/CameraRig.tsx`
- Modify: `src/scene/KarachiScene.tsx`

**Interfaces:**
- Consumes: `ResolvedSimulation`, `QualityMode`, `reducedMotion`, `flightEnabled`.
- Produces: `resolveCinematicBeat(simulation: ResolvedSimulation, flightEnabled: boolean, reducedMotion: boolean): CinematicBeat` and `CameraRig({ beat, flightEnabled, onFlightChange }: CameraRigProps)`.

- [ ] **Step 1: Write failing director tests**

Create tests with literal expectations showing: baseline/flight produces a defined aerial target; monsoon produces a storm beat with nonzero cloud/rain staging; blackout produces a dimmer/emergency beat; `reducedMotion` freezes camera travel; user takeover exposes a constrained non-autopilot beat.

- [ ] **Step 2: Run the director test to verify it fails**

Run: `npm run test -- --run src/scene/director.test.ts --maxWorkers=1 --no-file-parallelism`

Expected: FAIL because director exports do not exist.

- [ ] **Step 3: Implement pure director logic and the camera rig**

Define `CinematicBeat` with camera position/target, flight speed, atmosphere weight, lightning strength, wetness, and scene act copy. Use only resolver fields and static cinematic route definitions. Implement a constrained `OrbitControls` camera rig that allows takeover/resume without unbounded pan or below-horizon framing.

- [ ] **Step 4: Run focused and full stable tests**

Run: `npm run test -- --run src/scene/director.test.ts --maxWorkers=1 --no-file-parallelism`

Expected: PASS.

Run: `npm run test -- --run --maxWorkers=1 --no-file-parallelism`

Expected: PASS.

- [ ] **Step 5: Commit the director layer**

```bash
git add src/scene/director.ts src/scene/director.test.ts src/scene/CameraRig.tsx src/scene/KarachiScene.tsx
git commit -m "feat: add cinematic flight director"
```

### Task 2: Add the original horizon environment and cinematic atmosphere

**Files:**
- Create: `public/karachi-monsoon-horizon.png`, `src/scene/Atmosphere.tsx`, `src/scene/Waterfront.tsx`
- Modify: `src/scene/KarachiScene.tsx`, `src/styles.css`

**Interfaces:**
- Consumes: `CinematicBeat`, `ResolvedSimulation`, `QualityMode`, `reducedMotion`.
- Produces: `Atmosphere` and `Waterfront` scene components that tolerate a missing texture without throwing.

- [ ] **Step 1: Add the original environment asset**

Generate one text-free, wide Karachi-inspired future waterfront/monsoon skyline image at development time and save it locally at `public/karachi-monsoon-horizon.png`. Do not use a third-party image, map, or hotlinked source.

- [ ] **Step 2: Add a focused graceful-asset check**

Create a narrow director/asset-path test or Vite build assertion that fails when the local environment import/path is missing, without canvas-render mocks.

- [ ] **Step 3: Implement the three-layer atmosphere**

Place the panorama as a distant parallax horizon, then implement quality-aware cloud shelf, haze, lightning, rain treatment, color shift, sea ripple/foam, and wet/flood material response. The scene must remain composed when the image is unavailable.

- [ ] **Step 4: Verify build and visual baseline**

Run: `npm run build`

Expected: PASS.

Open the local scene and verify that it shows a composed city/horizon rather than an empty or flat background.

- [ ] **Step 5: Commit the atmosphere layer**

```bash
git add public/karachi-monsoon-horizon.png src/scene/Atmosphere.tsx src/scene/Waterfront.tsx src/scene/KarachiScene.tsx src/styles.css
git commit -m "feat: add cinematic Karachi atmosphere"
```

### Task 3: Recompose the city into a material-rich cinematic set

**Files:**
- Create: `src/scene/MaterialCity.tsx`, `src/scene/SceneChoreography.tsx`
- Modify: `src/scene/City.tsx`, `src/scene/Infrastructure.tsx`, `src/scene/Traffic.tsx`, `src/scene/Weather.tsx`, `src/scene/KarachiScene.tsx`

**Interfaces:**
- Consumes: `ResolvedSimulation`, `CinematicBeat`, `QualityMode`, `reducedMotion`.
- Produces: layered foreground/midground systems whose scenario visual state comes from the resolved simulation and director only.

- [ ] **Step 1: Write a failing choreography test**

Test a pure exported staging helper with literal resolver fixtures: surge returns flood/beacon emphasis; monsoon returns storm emphasis; blackout returns emergency/dim emphasis; solar/rewilding return restorative material emphasis. The helper must not accept raw scenario formulas.

- [ ] **Step 2: Run the choreography test to verify it fails**

Run: `npm run test -- --run src/scene/choreography.test.ts --maxWorkers=1 --no-file-parallelism`

Expected: FAIL because the staging helper does not exist.

- [ ] **Step 3: Implement cinematic material and choreography systems**

Use instancing and procedural material variation to create wet road surfaces, richer façades/window emission, foreground bridge/port details, flood barriers, navigation beacons, city-light waves, solar illumination, vegetation growth, emergency traffic and drones. Preserve the corrected shared road/cable geometry and use quality-dependent detail counts.

- [ ] **Step 4: Run focused and full stable verification**

Run: `npm run test -- --run src/scene/choreography.test.ts --maxWorkers=1 --no-file-parallelism`

Expected: PASS.

Run: `npm run test -- --run --maxWorkers=1 --no-file-parallelism && npm run lint && npm run build`

Expected: all commands exit 0; any bundle warning is documented, not suppressed.

- [ ] **Step 5: Commit the cinematic city set**

```bash
git add src/scene
git commit -m "feat: create cinematic Karachi city set"
```

### Task 4: Build the visual-first HUD, fallback, and final verification

**Files:**
- Create: `src/components/CinematicHUD.tsx`, `src/components/FallbackCity.tsx`
- Modify: `src/App.tsx`, `src/App.test.tsx`, `src/components/Hud.tsx`, `src/styles.css`

**Interfaces:**
- Consumes: `ResolvedSimulation`, `CinematicBeat`, browser WebGL capability, quality and flight preferences.
- Produces: `FallbackCity({ simulation }: { simulation: ResolvedSimulation })` and accessible controls for take-control/resume-flight/reset/cinematic modes.

- [ ] **Step 1: Preserve and complete the existing failing fallback test**

Keep the uncommitted `App.test.tsx` fallback test as the RED case. It must force absent WebGL, assert visible `2D simulation view`, readable schematic/metrics, core scenario/timeline changes, and reset. Add a separate real-DOM test for take-control/resume-flight text/state without mocking app behavior.

- [ ] **Step 2: Run fallback/control tests to verify expected RED**

Run: `npm run test -- --run src/App.test.tsx --maxWorkers=1 --no-file-parallelism`

Expected: the fallback assertions fail because no `FallbackCity` or capability branch exists; existing baseline identity behavior remains known.

- [ ] **Step 3: Implement the resilient visual-first application shell**

Add capability detection; render a usable `FallbackCity` when no WebGL context can be created. Introduce a restrained loading reveal, compact `CinematicHUD`, flight takeover/resume/reset controls, minimal cinematic presentation, sound preference control, and responsive mobile control tray while retaining full accessible scenario/timeline access.

- [ ] **Step 4: Run complete automated verification**

Run: `npm run test -- --run --maxWorkers=1 --no-file-parallelism && npm run lint && npm run build`

Expected: all commands exit 0. Record the production bundle result honestly.

- [ ] **Step 5: Perform browser verification**

Verify baseline, cinematic flight, take-control/resume, monsoon at 24 hours, blackout at 24 hours, solar at 10 years, low quality, reduced-motion behavior, reset, mobile layout, no error/warning console logs, and manually forced 2D fallback.

- [ ] **Step 6: Commit the final cinematic experience**

```bash
git add src public
git commit -m "feat: finish cinematic Karachi 2100 experience"
```

## Plan Self-Review

- **Spec coverage:** Tasks 1–4 cover deterministic camera direction, original atmosphere art, layered cinematic scene systems, scenario staging, visual-first HUD, fallback, accessibility, performance modes, and browser verification.
- **Step scan:** Every task begins with a concrete red check or asset constraint and ends with specific verification/commit steps; implementation signatures and outputs are explicit.
- **Type consistency:** `ResolvedSimulation`, `QualityMode`, `CinematicBeat`, `CameraRigProps`, `FallbackCity`, and `CinematicHUD` are defined as the cross-task contracts.
- **Review focus:** Camera escape, reduced motion, missing atmosphere art, duplicated scenario logic, and WebGL loss are assigned to concrete task checks.
- **Proportion:** The plan separates pure logic, atmosphere, scene set, and final integration so each can be reviewed independently without transcribing components.
