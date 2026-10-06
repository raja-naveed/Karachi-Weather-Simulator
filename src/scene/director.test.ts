import { describe, expect, it } from 'vitest';
import { resolveSimulation } from '../simulation/resolveSimulation';
import { resolveCinematicBeat } from './director';

const baseline = resolveSimulation({ scenarioId: 'baseline', timelineId: 'now', intensity: 1 });

describe('resolveCinematicBeat', () => {
  it('opens baseline flight on an authored aerial view of the city', () => {
    const beat = resolveCinematicBeat(baseline, true, false);
    expect(beat.act).toBe('arrival');
    expect(beat.camera.position).toEqual([67, 61, 89]);
    expect(beat.camera.target).toEqual([0, 3, -8]);
    expect(beat.autopilot).toBe(true);
    expect(beat.flightSpeed).toBe(0.045);
    expect(beat.sceneAct.title).toBe('The city before the change');
  });

  it('stages resolved monsoon clouds, rain, lightning and wetness', () => {
    const simulation = resolveSimulation({ scenarioId: 'extreme-monsoon', timelineId: '24-hours', intensity: 1 });
    const beat = resolveCinematicBeat(simulation, true, false);
    expect(beat.act).toBe('storm');
    expect(beat.camera.target).toEqual([6, 5, -16]);
    expect(beat.cloudWeight).toBeCloseTo(0.95);
    expect(beat.rainWeight).toBe(1);
    expect(beat.atmosphereWeight).toBeCloseTo(0.95);
    expect(beat.lightningStrength).toBeCloseTo(0.95);
    expect(beat.wetness).toBe(1);
    expect(beat.sceneAct.title).toBe('Monsoon routes become rivers');
  });

  it('stages blackout as dim districts with emergency illumination', () => {
    const simulation = resolveSimulation({ scenarioId: 'grid-blackout', timelineId: '24-hours', intensity: 1 });
    const beat = resolveCinematicBeat(simulation, true, false);
    expect(beat.act).toBe('emergency');
    expect(beat.power).toBe(0);
    expect(beat.emergencyWeight).toBe(1);
    expect(beat.lightningStrength).toBe(0);
    expect(beat.sceneAct.title).toBe('The grid goes dark');
  });

  it('freezes automatic camera travel for reduced motion', () => {
    const beat = resolveCinematicBeat(baseline, true, true);
    expect(beat.autopilot).toBe(true);
    expect(beat.reducedMotion).toBe(true);
    expect(beat.flightSpeed).toBe(0);
    expect(beat.camera.travel).toEqual([0, 0, 0]);
    expect(beat.camera.position).toEqual([67, 61, 89]);
  });

  it('retains storm staging while suppressing reduced-motion lightning', () => {
    const simulation = resolveSimulation({ scenarioId: 'extreme-monsoon', timelineId: '24-hours', intensity: 1 });
    const beat = resolveCinematicBeat(simulation, true, true);
    expect(beat.act).toBe('storm');
    expect(beat.rainWeight).toBe(1);
    expect(beat.lightningStrength).toBe(0);
    expect(beat.flightSpeed).toBe(0);
  });

  it('gives user takeover a stationary route with bounded aerial controls', () => {
    const beat = resolveCinematicBeat(baseline, false, false);
    expect(beat.autopilot).toBe(false);
    expect(beat.flightSpeed).toBe(0);
    expect(beat.camera.travel).toEqual([0, 0, 0]);
    expect(beat.camera.controls).toEqual({
      enablePan: false,
      minDistance: 70,
      maxDistance: 190,
      minPolarAngle: 0.3,
      maxPolarAngle: 1.2,
      minAzimuthAngle: -1.2,
      maxAzimuthAngle: 1.2,
    });
  });

  it('uses resolved fields rather than reapplying scenario curves or IDs', () => {
    const beat = resolveCinematicBeat({
      ...baseline,
      scenarioId: 'extreme-monsoon',
      cityLighting: { power: 0.2, emergency: 0.7 },
      flood: { waterLevel: 2, coverage: 0.4 },
    }, true, false);
    expect(beat.act).toBe('emergency');
    expect(beat.rainWeight).toBe(0);
    expect(beat.cloudWeight).toBe(0.3);
    expect(beat.power).toBe(0.2);
    expect(beat.emergencyWeight).toBe(0.7);
    expect(beat.wetness).toBe(0.4);
  });

  it('keeps a selected scenario at now in the baseline act', () => {
    const simulation = resolveSimulation({ scenarioId: 'grid-blackout', timelineId: 'now', intensity: 1 });
    expect(resolveCinematicBeat(simulation, true, false).act).toBe('arrival');
  });

  it.each([
    ['coastal-surge', 'ten-years', 'coast', [-24, 3, 18]],
    ['bridge-closure', '24-hours', 'detour', [6, 5, 24]],
    ['solar-transition', 'ten-years', 'renewal', [28, 5, -25]],
    ['urban-rewilding', 'ten-years', 'renewal', [28, 5, -25]],
  ] as const)('composes the resolved %s future around its city anchor', (scenarioId, timelineId, act, target) => {
    const simulation = resolveSimulation({ scenarioId, timelineId, intensity: 1 });
    const beat = resolveCinematicBeat(simulation, true, false);
    expect(beat.act).toBe(act);
    expect(beat.camera.target).toEqual(target);
  });

  it('returns independent beats without changing the resolved simulation', () => {
    const before = structuredClone(baseline);
    const first = resolveCinematicBeat(baseline, true, false);
    expect(resolveCinematicBeat(baseline, true, false)).toEqual(first);
    first.camera.position[0] = -500;
    first.sceneAct.title = 'changed';
    expect(resolveCinematicBeat(baseline, true, false).camera.position).toEqual([67, 61, 89]);
    expect(baseline).toEqual(before);
  });
});
