import type { MetricId, Metrics, ScenarioDefinition, TimelineStep } from './types'

export const SCENARIOS = [
  { id: 'coastal-surge', label: 'Coastal surge', description: 'Raise the sea along the coastal edge.', accent: '#ff755f' },
  { id: 'extreme-monsoon', label: 'Extreme monsoon', description: 'Test the city under heavy rain and runoff.', accent: '#83baff' },
  { id: 'bridge-closure', label: 'Bridge closure', description: 'Close an arterial crossing and reroute traffic.', accent: '#ffb45e' },
  { id: 'grid-blackout', label: 'Grid blackout', description: 'Interrupt power across the city districts.', accent: '#e29bff' },
  { id: 'solar-transition', label: 'Solar transition', description: 'Expand rooftop and outer-zone solar capacity.', accent: '#f7d477' },
  { id: 'urban-rewilding', label: 'Urban rewilding', description: 'Grow green corridors through the city.', accent: '#8ae0ad' },
] as const satisfies readonly ScenarioDefinition[]

export const TIMELINE_STEPS = [
  { id: 'now', label: 'Now' }, { id: '24-hours', label: '24 hours' },
  { id: '30-days', label: '30 days' }, { id: 'one-year', label: '1 year' },
  { id: 'ten-years', label: '10 years' },
] as const satisfies readonly TimelineStep[]

export const METRIC_LABELS: Readonly<Record<MetricId, string>> = {
  safety: 'Public safety', mobility: 'Mobility', gridStability: 'Grid stability',
  airQuality: 'Air quality', coastalResilience: 'Coastal resilience',
}

export const BASELINE_METRICS: Readonly<Metrics> = {
  safety: 72, mobility: 68, gridStability: 62, airQuality: 48, coastalResilience: 55,
}

/** Each curve is explicit at [now, 24h, 30d, 1y, 10y]. Acute disruptions
 * peak early; investments mature slowly. These are authored visual stories.
 */
export const SCENARIO_EFFECTS = {
  'coastal-surge': {
    curve: [0, 0.35, 0.55, 0.75, 1], metrics: [-55, -42, -20, -5, -60],
    visuals: { waterLevel: 5.5, floodCoverage: 0.85, speed: -0.65, density: -0.3, congestion: 0.65, emergency: 0.8, drones: 0.85, clouds: 0.25, paletteEmergency: 1 },
    title: 'The coast is under pressure', body: 'Water overtops the coast, cutting routes and exposing low-lying districts. Emergency crews follow the retreating traffic.',
  },
  'extreme-monsoon': {
    curve: [0, 1, 0.65, 0.35, 0.5], metrics: [-48, -50, -25, 8, -30],
    visuals: { rainfall: 1, clouds: 0.65, haze: -0.1, waterLevel: 3.2, floodCoverage: 0.65, speed: -0.6, density: -0.2, congestion: 0.7, emergency: 0.65, drones: 0.7, paletteEmergency: 0.8 },
    title: 'Monsoon routes become rivers', body: 'Heavy rain fills runoff channels and slows the central arteries. The storm eases, but recurring monsoons keep drainage under pressure.',
  },
  'bridge-closure': {
    curve: [0, 1, 0.8, 0.45, 0.2], metrics: [-8, -55, -4, -18, 0],
    visuals: { bridgeClosure: 1, congestion: 0.85, speed: -0.7, density: 0.25, haze: 0.2, emergency: 0.2, drones: 0.25, paletteEmergency: 0.6 },
    title: 'One crossing, a city of detours', body: 'The bridge closes and traffic gathers on alternate routes. Over time, rerouting restores some movement across the corridor.',
  },
  'grid-blackout': {
    curve: [0, 1, 0.65, 0.3, 0.15], metrics: [-35, -25, -75, -8, -12],
    visuals: { power: -0.9, emergency: 1, drones: 0.95, speed: -0.45, density: -0.25, congestion: 0.4, paletteEmergency: 0.9 },
    title: 'The grid goes dark', body: 'District lights fade as power fails. Emergency beacons and drones trace essential routes while repairs gradually restore the grid.',
  },
  'solar-transition': {
    curve: [0, 0.05, 0.2, 0.55, 1], metrics: [8, 5, 45, 38, 10],
    visuals: { solar: 0.9, power: 0.1, haze: -0.4, paletteResilience: 1 },
    title: 'A city powered by its rooftops', body: 'Solar rooftops and outer-zone arrays grow across Karachi. Distributed generation strengthens the grid and reduces the haze over the port.',
  },
  'urban-rewilding': {
    curve: [0, 0.02, 0.15, 0.5, 1], metrics: [12, 6, 8, 45, 35],
    visuals: { greenery: 0.75, haze: -0.5, clouds: -0.1, paletteResilience: 1 },
    title: 'Green corridors reconnect the city', body: 'Trees and planted corridors spread between districts. Cleaner air and more absorbent ground gradually strengthen urban resilience.',
  },
} as const
