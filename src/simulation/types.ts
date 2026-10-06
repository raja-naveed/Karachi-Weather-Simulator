export type ScenarioId = 'baseline' | 'coastal-surge' | 'extreme-monsoon' | 'bridge-closure' | 'grid-blackout' | 'solar-transition' | 'urban-rewilding'
export type TimelineId = 'now' | '24-hours' | '30-days' | 'one-year' | 'ten-years'
export type MetricId = 'safety' | 'mobility' | 'gridStability' | 'airQuality' | 'coastalResilience'
export type Metrics = Record<MetricId, number>

export interface SimulationInput {
  scenarioId: ScenarioId
  timelineId: TimelineId
  /** Normalized scenario strength, clamped to 0–1. Non-finite values mean 0. */
  intensity: number
}

/** Visual scenario scores, not physical predictions. Every scalar is 0–1,
 * except metrics (0–100) and waterLevel (0–6 arbitrary scene units).
 */
export interface ResolvedSimulation {
  scenarioId: ScenarioId
  timelineId: TimelineId
  intensity: number
  progress: number
  metrics: Metrics
  weather: { rainfall: number; cloudCover: number; haze: number }
  cityLighting: { power: number; emergency: number }
  traffic: { density: number; speed: number; congestion: number; bridgeClosure: number }
  flood: { waterLevel: number; coverage: number }
  greenery: { coverage: number }
  solar: { coverage: number }
  drone: { activity: number }
  narration: { title: string; body: string }
  palette: { emergency: number; resilience: number; accent: string }
}

export interface ScenarioDefinition {
  id: Exclude<ScenarioId, 'baseline'>
  label: string
  description: string
  accent: string
}

export interface TimelineStep { id: TimelineId; label: string }
