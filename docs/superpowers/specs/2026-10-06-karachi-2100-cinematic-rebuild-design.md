# Karachi 2100: Cinematic Flight Rebuild — Design

## Intent

Rebuild the visual experience from a stylised city simulator into an extraordinary, cinema-first browser experience: **Karachi 2100 — A Flight Through the Monsoon Frontier**.

The finished application remains a self-contained web experience with no runtime AI, account, backend, map API, or external data dependency. AI may be used during development only to create original atmospheric artwork. The intended result is an unforgettable technical portfolio piece: it should feel closer to the opening sequence of a premium science-fiction game or architecture film than a dashboard with a 3D background.

This is an imagined future Karachi, not a true geographic digital twin or scientific forecast. The title and explanatory copy must stay clear about that distinction.

## Success Criteria

- The first viewport immediately shows a compelling, cinematic 3D city rather than a control-heavy interface.
- The visual language moves from primitive-only city blocks toward believable materials, depth, weather, lighting, and camera composition.
- A visitor can freely explore the city and trigger story-like city states without an AI integration.
- The six existing deterministic scenarios continue to drive meaningful visual changes and accessible text outcomes.
- The application remains responsive and has low, balanced, and high quality modes plus a fully functional 2D fallback.

## Chosen Approach: Hybrid Cinematic 3D

Pure client-side procedural geometry alone cannot reproduce a full photogrammetric city at browser-friendly size. The rebuild therefore uses three depth layers:

1. **Atmospheric distance layer** — an original, high-resolution Karachi-inspired skyline and monsoon horizon artwork, used as an environment backdrop with slow parallax and weather-dependent treatment.
2. **Procedural midground layer** — a dense, purpose-built Three.js waterfront city: roads, bridge, port, towers, solar roofs, vegetation, traffic, water, flood planes, and infrastructure.
3. **Hero foreground layer** — close-range visual anchors with materially richer geometry: wet elevated roads, bridge cables, shipping cranes, flooding edges, emergency drones, glowing façade bands, navigation beacons, and rain/lightning events.

This gives the scene credible scale and atmosphere without falsely claiming a real-world map or depending on licensed satellite imagery.

## Experience Flow

### Opening

The page opens directly into the city at dusk. A restrained loading reveal fades into a slow aerial approach over the Arabian Sea. A compact title lockup says `KARACHI 2100` and `A Flight Through the Monsoon Frontier`; the visual scene remains the dominant first-screen element.

### Exploration

The visitor has two complementary modes:

- **Flight mode:** an automatic camera rail moves through composed aerial viewpoints. A pause/fly control allows the visitor to take over with orbit/pan/zoom controls.
- **Story mode:** the visitor selects a city future from an unobtrusive scene strip—Surge, Monsoon, Closure, Blackout, Solar, or Rewilding—and advances a concise timeline. A scenario triggers a visually staged transformation and accompanying narration.

The panel becomes minimal in cinematic mode rather than merely hiding cards. A soft radial reticle, coordinates, a scene-act label, and a small timeline remain; all functional controls remain discoverable through a collapsed control tray and keyboard navigation.

### Scenario Staging

- **Coastal surge:** tide overtakes the waterfront, wet reflections brighten, flood barriers light up, navigation beacons turn amber.
- **Extreme monsoon:** a heavy cloud shelf moves across the skyline; rain, lightning, runoff, haze, and water accumulation intensify.
- **Bridge closure:** vehicles queue and reroute; closure beacons and emergency traffic make the interruption clear.
- **Grid blackout:** city windows extinguish in waves; the port dims; emergency drone paths and isolated backup islands remain.
- **Solar transition:** rooftop solar arrays ignite, warmer skyline lighting returns, and cleaner haze reveals a distant horizon.
- **Urban rewilding:** tree corridors and rooftops build up over the city; haze lifts and the water/sky palette shifts toward a restorative dawn.

## Visual Direction

The visual thesis is **wet tropical futurism**: deep blue-black sea and sky, oxidised green-teal infrastructure, wet basalt road surfaces, sodium-vapor and cyan emissions, muted sandstone architecture, and rare high-signal amber/red emergency lighting.

The scene should use physically plausible cues rather than only neon:

- graduated horizon and aerial perspective;
- layered clouds and localised lightning;
- water ripple, foam, and reflected city light;
- wet-surface roughness shifts in rain;
- material variation across building façade families;
- silhouettes and detail density that are high near the camera and diffuse in the distance;
- a slow, intentional camera path with strong foreground/midground/background separation.

Use one original atmospheric panorama in `public/` as the skyline-horizon layer. It must contain no readable brand names or text. The foreground stays Three.js geometry so visual states remain interactive and genuinely spatial.

## Technical Architecture

### Existing systems retained

- The deterministic simulation resolver, scenario metadata, timeline, metrics, and narration remain the single source of truth.
- Existing accessible DOM controls, reduced-motion behavior, quality selector, and unit tests remain supported.
- The scene-boundary jsdom mock stays narrow so interaction tests do not need WebGL.

### New scene systems

| Unit | Responsibility |
| --- | --- |
| `CinematicDirector` | derives scene act, camera rail position, weather beat, and transition intensity from scenario/time/user camera state |
| `CameraRig` | automatic flight rail, user takeover, smooth focus targets, reduced-motion behavior |
| `Atmosphere` | panorama backdrop, cloud shelf, haze, lightning, horizon and dawn/night color treatment |
| `MaterialCity` | enhanced city façades, roadway wetness, emissive patterns, foreground anchors, tiered detail |
| `Waterfront` | water, foam edge, wet flood surface, reflections and sea-wall detail |
| `SceneChoreography` | scenario-triggered visual staging that consumes resolver output, never reimplements scenario rules |
| `CinematicHUD` | minimal film-like control tray, scene label, status narration and keyboard-accessible recovery controls |

The existing `KarachiScene` becomes the composition root. Heavy optional systems load only when WebGL is supported and the selected quality supports them. In UI tests, the existing scene mock remains in place; pure director/geometry computations receive focused unit coverage.

## Camera and Input

- Start in a composed automatic flight; never auto-spin a static overview.
- Allow a clear `Take control` / `Resume flight` toggle.
- Use `OrbitControls` with constrained target/distance/polar angle so visitors cannot accidentally lose the city below the horizon.
- Provide a `Reset view` action.
- Honor reduced motion by disabling camera travel, lightning flashes, water animation, rain drift, and nonessential vehicle/drone motion while keeping the scene legible.

## Asset Strategy

- Create one original, wide, cinematic Karachi-inspired skyline environment artwork with image generation. It becomes a local static asset in the project.
- Do not use real satellite imagery, copyrighted skylines, hotlinked media, or third-party model downloads.
- Generate façade material variation procedurally in shaders/CSS/canvas where appropriate; do not add a large asset pack.
- Use WebAudio only for optional locally synthesised ambient texture if implemented; the app must never require audio to communicate state.

## Performance and Failure Modes

- **High:** full backdrop treatment, rain/cloud density, postprocessing, high façade/window density.
- **Balanced:** default showcase quality with a rich city and restrained postprocessing.
- **Low:** retains the artistic composition while lowering DPR, particle density, traffic, geometry detail, and expensive effects.
- **No WebGL:** show the same scenario/timeline controls, metrics, and narration above a polished layered 2D coastal schematic labelled `2D simulation view`.
- The scene must avoid opaque full-screen loading forever; it reveals a stable visual shell before optional enhancements finish.

## Testing and Verification

- Preserve current resolver and accessible-control test coverage.
- Finish and retain the WebGL-unavailable fallback test already drafted in `src/App.test.tsx`.
- Add unit tests for deterministic camera/director/geometry outputs where they do not require rendering a canvas.
- Verify a normal desktop scene, cinematic mode, user-control toggle, each visual scenario at a representative timeline point, low quality, reduced-motion behavior, and 2D fallback.
- Run the stable serial full suite, lint, production build, and browser console inspection before claiming completion.

## Scope Boundaries

This rebuild does not add runtime AI, a literal city map, procedural mesh generation from user prompts, multiplayer, accounts, uploads, backend services, external map tiles, analytics, licensed 3D asset packs, or a scientific climate model.
