import { BASELINE_METRICS, SCENARIOS, SCENARIO_EFFECTS, TIMELINE_STEPS } from './scenarios'
import type { Metrics, ResolvedSimulation, SimulationInput } from './types'

const clamp = (value: number, max = 1) => Math.min(max, Math.max(0, Number.isFinite(value) ? value : 0))
const metricKeys = ['safety', 'mobility', 'gridStability', 'airQuality', 'coastalResilience'] as const

/** Pure, replayable authored scenario resolution. Invalid runtime IDs reset
 * both selections to baseline/now; no random values or clock dependencies.
 */
export function resolveSimulation(input: SimulationInput): ResolvedSimulation {
  const scenario = SCENARIOS.find((entry) => entry.id === input?.scenarioId)
  const timelineIndex = TIMELINE_STEPS.findIndex((entry) => entry.id === input?.timelineId)
  const valid = timelineIndex >= 0 && (scenario !== undefined || input?.scenarioId === 'baseline')
  const effect = valid && scenario ? SCENARIO_EFFECTS[scenario.id] : undefined
  const intensity = clamp(input?.intensity)
  const progress = effect ? effect.curve[timelineIndex] * intensity : 0
  const visuals: Readonly<Partial<Record<string, number>>> = effect?.visuals ?? {}
  const visual = (key: string, base = 0, max = 1) => clamp(base + (visuals[key] ?? 0) * progress, max)
  const metrics: Metrics = { ...BASELINE_METRICS }
  for (const [index, key] of metricKeys.entries()) {
    metrics[key] = clamp(BASELINE_METRICS[key] + (effect?.metrics[index] ?? 0) * progress, 100)
  }
  return {
    scenarioId: valid ? input.scenarioId : 'baseline',
    timelineId: valid ? input.timelineId : 'now',
    intensity: valid ? intensity : 0,
    progress,
    metrics,
    weather: { rainfall: visual('rainfall'), cloudCover: visual('clouds', 0.3), haze: visual('haze', 0.6) },
    cityLighting: { power: visual('power', 0.9), emergency: visual('emergency') },
    traffic: { density: visual('density', 0.65), speed: visual('speed', 0.8), congestion: visual('congestion', 0.15), bridgeClosure: visual('bridgeClosure') },
    flood: { waterLevel: visual('waterLevel', 0, 6), coverage: visual('floodCoverage') },
    greenery: { coverage: visual('greenery', 0.15) },
    solar: { coverage: visual('solar', 0.05) },
    drone: { activity: visual('drones', 0.05) },
    narration: effect && progress > 0
      ? { title: effect.title, body: `${TIMELINE_STEPS[timelineIndex].label}: ${effect.body}` }
      : { title: 'The city before the change', body: 'Karachi 2100: a living coastal city. Choose a scenario and advance time to explore its imagined consequences.' },
    palette: { emergency: visual('paletteEmergency'), resilience: visual('paletteResilience'), accent: progress > 0 && scenario ? scenario.accent : '#6cded0' },
  }
}
