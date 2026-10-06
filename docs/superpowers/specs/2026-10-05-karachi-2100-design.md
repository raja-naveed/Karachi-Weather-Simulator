# Karachi 2100: Climate Survival Simulator — Design

## Intent

Create a visually exceptional, browser-only 3D experience that presents an imagined future Karachi as a living coastal city. Visitors trigger a small number of urban and climate interventions, scrub through time, and watch clear physical and systemic consequences unfold.

The site is a technical portfolio piece and cinematic interactive experience. It is not presented as an engineering-grade forecast, it does not use an AI service, and it does not require any account, backend, external map, or paid API.

## Product Principles

- Make the scene feel immediate and cinematic before it feels like a dashboard.
- Use recognisable Karachi-inspired landmarks: Arabian Sea coast, port cranes, dense central districts, elevated highways, monsoon weather, and coastal barriers.
- Make every control have a clear, visible effect on both the city and its metrics.
- Keep all simulation state deterministic, local, and replayable.
- Design for a polished desktop presentation while remaining usable on touch screens.
- Prefer visual fidelity and responsive interaction over encyclopaedic simulation complexity.

## Visitor Experience

1. The app opens into a brief branded loading sequence and fades into an aerial view of Karachi in the year 2100.
2. The main scene contains a living city: layered buildings, arterial roads, traffic, port cranes, ocean, haze, cloud cover, lights, and restrained ambient motion.
3. A left-side scenario deck lets the visitor activate one scenario at a time:
   - coastal surge;
   - extreme monsoon;
   - bridge closure;
   - grid blackout;
   - solar transition;
   - urban rewilding.
4. A timeline lets the visitor advance from present conditions to 24 hours, 30 days, 1 year, and 10 years.
5. A compact impact panel shows safety, mobility, energy, air quality, and coastal resilience. Values animate to their new deterministic state.
6. A contextual narration card describes the active consequence in concise, evocative language.
7. The visitor can reset the city, toggle cinematic mode, toggle sound, and choose a quality preset.

## Scene and Visual Direction

The style is premium near-future realism, not cartoon or photorealistic imitation. The base palette is midnight navy, wet concrete, faded sandstone, sea teal, and warm sodium-vapor city lights. Emergency states introduce restrained red and amber accents; resilient states introduce solar gold and green.

The skyline will be assembled from procedural building families and instanced elements rather than copied commercial assets. The city is divided into four visibly distinct zones:

- **Coastal edge:** water, sea wall, marina silhouettes, flood markers, and high-rises.
- **Central density:** tall mixed-use buildings, traffic, bright windows, and elevated roads.
- **Port and industry:** cranes, containers, warehouses, working lights, and haze.
- **Outer growth zone:** lower-density housing, solar fields, green corridors, and vulnerable infrastructure.

Effects include a stylized water surface, rainfall particles, drifting cloud layer, fog/haze, bloom, color grading, moving cars, building light patterns, and camera fly-ins. The app adapts effects by quality setting and respects reduced-motion preferences.

## Simulation Model

The simulation is a deterministic set of scenario modifiers, not an AI model or live-data projection.

### State

The state contains time index, active scenario, scenario intensity, and five scores from 0 to 100:

- public safety;
- mobility;
- grid stability;
- air quality;
- coastal resilience.

### Scenario effects

Each scenario applies an explicit time-based curve to the scores plus scene effects:

- **Coastal surge:** rising water, coastal flood markers, red safety state, impaired traffic.
- **Extreme monsoon:** dense rain, runoff channels, storm sky, water accumulation, traffic degradation.
- **Bridge closure:** route congestion, rerouted traffic, mobility degradation around the central corridor.
- **Grid blackout:** district lights disappear in waves; emergency lighting and drones become visible.
- **Solar transition:** rooftops and outer-zone solar arrays activate; grid and air quality improve over time.
- **Urban rewilding:** greenery expands, haze thins, air quality and resilience improve gradually.

The model deliberately prioritizes legibility: one selected scenario has an unmistakable cause-and-effect story at each point on the timeline.

## Technical Architecture

The app will use a Vite + React + TypeScript single-page setup.

| Layer | Responsibility |
| --- | --- |
| React app shell | app state, layout, keyboard interaction, accessible controls |
| React Three Fiber scene | camera, lighting, city composition, animation loop |
| Scene systems | water, weather, vehicles, buildings, port, terrain, post-processing |
| Simulation engine | pure functions that resolve visual and metric state from scenario and time |
| UI systems | scenario deck, timeline, metric cards, narration, settings, intro |
| Test suite | deterministic simulation rules and key UI behavior |

The scene state is derived from one central simulation resolver. The visual components consume the resolved state rather than owning independent scenario logic, preventing contradictions between metrics and what the visitor sees.

## Component Boundaries

- `simulation/`: scenario definitions, types, resolver, narration.
- `scene/`: isolated visual systems, each receiving only the state it needs.
- `components/`: DOM interface elements with no Three.js concerns.
- `hooks/`: viewport, reduced motion, audio and keyboard helpers.
- `styles/`: design tokens, global typography, responsive layout.

This keeps the simulation testable without rendering WebGL and lets individual scene systems evolve without changing the interface.

## Accessibility and Responsive Behavior

- Every scenario and timeline control is keyboard accessible with a visible focus state.
- The live impact panel uses readable text and does not rely on color alone.
- Reduced-motion mode limits camera movement, particles, and metric interpolation.
- The desktop interface uses a persistent scenario deck. On smaller screens, it becomes a compact bottom sheet.
- The 3D scene remains decorative but the scenario result and metrics are understandable through DOM text.

## Error and Loading Behavior

- The app has a branded loading screen while the 3D renderer initializes.
- If WebGL is unavailable, the app falls back to a polished static visual with functional scenario cards and metrics.
- If performance is low, the app defaults to a lower quality preset and permits the visitor to increase it.

## Testing and Verification

- Unit-test scenario resolution at major timeline points, including score clamping and reset behavior.
- Test the scenario deck and timeline interaction with a DOM test runner.
- Run TypeScript checking and a production build.
- Use browser verification after implementation to check the opening scene, scenario changes, reset behavior, responsive UI, and browser console output.

## Explicit Scope Boundaries

The first release excludes real GIS data, multiplayer, first-person gameplay, external APIs, user authentication, persistence, machine learning, and live weather. These are future extensions, not hidden dependencies of the experience.
