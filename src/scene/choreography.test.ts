import { describe, expect, it } from 'vitest';
import type { ResolvedSimulation } from '../simulation/types';
import { resolveCinematicBeat } from './director';
import { resolveCityStaging } from './choreography';

const baseline: ResolvedSimulation = {
  scenarioId: 'baseline', timelineId: 'now', intensity: 1, progress: 0,
  metrics: { safety: 80, mobility: 80, gridStability: 80, airQuality: 80, coastalResilience: 80 },
  weather: { rainfall: 0, cloudCover: 0.3, haze: 0.2 },
  cityLighting: { power: 1, emergency: 0 },
  traffic: { density: 0.7, speed: 0.8, congestion: 0.2, bridgeClosure: 0 },
  flood: { waterLevel: 0, coverage: 0 }, greenery: { coverage: 0.15 },
  solar: { coverage: 0.1 }, drone: { activity: 0.3 },
  narration: { title: 'City', body: 'City at arrival' },
  palette: { emergency: 0, resilience: 0, accent: '#87d9dd' },
};

describe('resolved city staging', () => {
  it('emphasizes surge barriers and navigation beacons', () => {
    const simulation = { ...baseline, flood: { waterLevel: 4, coverage: 0.75 } };
    expect(resolveCityStaging(simulation, resolveCinematicBeat(simulation, true, false))).toMatchObject({
      flood: 0.75, beacons: 0.75, wetness: 0.75, storm: 0,
    });
  });
  it('emphasizes the resolved monsoon storm and wet materials', () => {
    const simulation = { ...baseline, weather: { rainfall: 0.85, cloudCover: 0.95, haze: 0.3 } };
    expect(resolveCityStaging(simulation, resolveCinematicBeat(simulation, true, false))).toMatchObject({ storm: 0.85, wetness: 0.85 });
  });
  it('dims blackout districts while retaining emergency illumination', () => {
    const simulation = { ...baseline, cityLighting: { power: 0.1, emergency: 0.9 } };
    expect(resolveCityStaging(simulation, resolveCinematicBeat(simulation, true, false))).toMatchObject({ power: 0.1, emergency: 0.9, dim: 0.9, beacons: 0.9 });
  });
  it.each([
    [{ ...baseline, solar: { coverage: 0.8 }, palette: { ...baseline.palette, resilience: 0.7 } }, { solar: 0.8, vegetation: 0.15, restoration: 0.7 }],
    [{ ...baseline, greenery: { coverage: 0.9 }, palette: { ...baseline.palette, resilience: 0.8 } }, { solar: 0.1, vegetation: 0.9, restoration: 0.8 }],
  ])('stages restorative materials from resolved coverage', (simulation, expected) => {
    expect(resolveCityStaging(simulation, resolveCinematicBeat(simulation, true, false))).toMatchObject(expected);
  });
  it('ignores scenario metadata and freezes waves in reduced motion', () => {
    const simulation: ResolvedSimulation = { ...baseline, scenarioId: 'extreme-monsoon', intensity: 0.99, progress: 1 };
    expect(resolveCityStaging(simulation, resolveCinematicBeat(simulation, true, true))).toMatchObject({ storm: 0, flood: 0, emergency: 0, motion: 0 });
  });
});
