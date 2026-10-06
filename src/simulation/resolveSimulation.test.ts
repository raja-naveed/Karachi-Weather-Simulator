import { describe, expect, it } from 'vitest'
import { resolveSimulation } from './resolveSimulation'
import { SCENARIOS, TIMELINE_STEPS } from './scenarios'
import type { SimulationInput } from './types'

const baseline = { safety: 72, mobility: 68, gridStability: 62, airQuality: 48, coastalResilience: 55 }

describe('resolveSimulation', () => {
  it('starts every scenario at the same baseline at now', () => {
    for (const scenario of SCENARIOS) {
      const state = resolveSimulation({ scenarioId: scenario.id, timelineId: 'now', intensity: 1 })
      expect(state.metrics).toEqual(baseline)
      expect(state.flood.waterLevel).toBe(0)
      expect(state.narration.title).toBe('The city before the change')
    }
  })

  it('resolves ten-year coastal surge to exposed coasts and impaired mobility', () => {
    const state = resolveSimulation({ scenarioId: 'coastal-surge', timelineId: 'ten-years', intensity: 1 })
    expect(state.metrics).toEqual({ safety: 17, mobility: 26, gridStability: 42, airQuality: 43, coastalResilience: 0 })
    expect(state.flood.waterLevel).toBe(5.5)
    expect(state.traffic.speed).toBeCloseTo(0.15)
    expect(state.drone.activity).toBeCloseTo(0.9)
    expect(state.narration.body).toContain('coast')
  })

  it('grows solar investment gradually and improves grid and air quality', () => {
    const halfway = resolveSimulation({ scenarioId: 'solar-transition', timelineId: '30-days', intensity: 0.5 })
    // 20% progress x 50% intensity = 10% of the scenario effect.
    expect(halfway.metrics.gridStability).toBeCloseTo(66.5)
    expect(halfway.metrics.airQuality).toBeCloseTo(51.8)
    const state = resolveSimulation({ scenarioId: 'solar-transition', timelineId: 'ten-years', intensity: 1 })
    expect(state.metrics).toEqual({ safety: 80, mobility: 73, gridStability: 100, airQuality: 86, coastalResilience: 65 })
    expect(state.solar.coverage).toBeCloseTo(0.95)
    expect(state.weather.haze).toBeCloseTo(0.2)
  })

  it.each([
    ['extreme-monsoon', '24-hours', 'safety', 24],
    ['bridge-closure', '24-hours', 'mobility', 13],
    ['grid-blackout', '24-hours', 'gridStability', 0],
    ['urban-rewilding', 'ten-years', 'airQuality', 93],
  ] as const)('applies the %s curve at %s', (scenarioId, timelineId, metric, value) => {
    expect(resolveSimulation({ scenarioId, timelineId, intensity: 1 }).metrics[metric]).toBe(value)
  })

  it('keeps every score and scene modifier finite and within its documented range', () => {
    for (const scenario of SCENARIOS) for (const timeline of TIMELINE_STEPS) {
      for (const intensity of [-10, 0, 0.5, 1, 100, NaN, Infinity, -Infinity]) {
        const state = resolveSimulation({ scenarioId: scenario.id, timelineId: timeline.id, intensity })
        for (const score of Object.values(state.metrics)) {
          expect(Number.isFinite(score)).toBe(true)
          expect(score).toBeGreaterThanOrEqual(0)
          expect(score).toBeLessThanOrEqual(100)
        }
        for (const group of [state.weather, state.cityLighting, state.traffic, state.greenery, state.solar, state.drone]) {
          for (const value of Object.values(group)) {
            expect(Number.isFinite(value)).toBe(true)
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThanOrEqual(1)
          }
        }
        expect(state.flood.waterLevel).toBeGreaterThanOrEqual(0)
        expect(state.flood.waterLevel).toBeLessThanOrEqual(6)
        expect(state.flood.coverage).toBeGreaterThanOrEqual(0)
        expect(state.flood.coverage).toBeLessThanOrEqual(1)
        expect(state.palette.emergency).toBeGreaterThanOrEqual(0)
        expect(state.palette.emergency).toBeLessThanOrEqual(1)
        expect(state.palette.resilience).toBeGreaterThanOrEqual(0)
        expect(state.palette.resilience).toBeLessThanOrEqual(1)
      }
    }
  })

  it('clamps intensity rather than amplifying the curve beyond its endpoints', () => {
    expect(resolveSimulation({ scenarioId: 'coastal-surge', timelineId: 'ten-years', intensity: 100 }))
      .toEqual(resolveSimulation({ scenarioId: 'coastal-surge', timelineId: 'ten-years', intensity: 1 }))
    expect(resolveSimulation({ scenarioId: 'coastal-surge', timelineId: 'ten-years', intensity: -10 }).metrics).toEqual(baseline)
    expect(resolveSimulation({ scenarioId: 'coastal-surge', timelineId: 'ten-years', intensity: NaN }).metrics).toEqual(baseline)
  })

  it.each([
    { scenarioId: 'invalid', timelineId: 'ten-years', intensity: 1 },
    { scenarioId: 'coastal-surge', timelineId: 'invalid', intensity: 1 },
    {},
    null,
    undefined,
  ])('falls back safely when runtime IDs are invalid or absent: %j', (input) => {
    const state = resolveSimulation(input as unknown as SimulationInput)
    expect(state.scenarioId).toBe('baseline')
    expect(state.timelineId).toBe('now')
    expect(state.metrics).toEqual(baseline)
    expect(state.flood.waterLevel).toBe(0)
  })

  it('is deterministic and returns independent output objects', () => {
    const input = { scenarioId: 'urban-rewilding', timelineId: 'ten-years', intensity: 1 } as const
    const first = resolveSimulation(input)
    expect(resolveSimulation(input)).toEqual(first)
    first.metrics.safety = 0
    expect(resolveSimulation(input).metrics.safety).toBe(84)
    expect(input.intensity).toBe(1)
  })
})
