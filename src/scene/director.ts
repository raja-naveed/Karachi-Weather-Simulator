import type { ResolvedSimulation } from '../simulation/types';

export type CinematicAct = 'arrival' | 'storm' | 'emergency' | 'coast' | 'detour' | 'renewal';
type Point = [number, number, number];

export interface CinematicBeat {
  act: CinematicAct;
  autopilot: boolean;
  reducedMotion: boolean;
  flightSpeed: number;
  camera: {
    position: Point;
    target: Point;
    travel: Point;
    controls: {
      enablePan: false;
      minDistance: number;
      maxDistance: number;
      minPolarAngle: number;
      maxPolarAngle: number;
      minAzimuthAngle: number;
      maxAzimuthAngle: number;
    };
  };
  atmosphereWeight: number;
  cloudWeight: number;
  rainWeight: number;
  lightningStrength: number;
  wetness: number;
  power: number;
  emergencyWeight: number;
  sceneAct: { title: string; body: string };
}

// Authored framing only. Scenario intensity and timeline curves belong to the resolver.
const routes: Record<CinematicAct, { position: Point; target: Point; travel: Point }> = {
  arrival: { position: [67, 61, 89], target: [0, 3, -8], travel: [10, 0, 0] },
  storm: { position: [71, 64, 81], target: [6, 5, -16], travel: [9, 2, 5] },
  emergency: { position: [57, 57, 84], target: [4, 4, -6], travel: [8, 1, 4] },
  coast: { position: [43, 62, 105], target: [-24, 3, 18], travel: [10, 2, 4] },
  detour: { position: [73, 67, 111], target: [6, 5, 24], travel: [9, 1, 4] },
  renewal: { position: [82, 64, 72], target: [28, 5, -25], travel: [8, 2, 5] },
};

/** Deterministic scene staging from already-resolved values, independent of IDs and clocks. */
export function resolveCinematicBeat(
  simulation: ResolvedSimulation,
  flightEnabled: boolean,
  reducedMotion: boolean,
): CinematicBeat {
  const { weather, cityLighting, flood, traffic, palette } = simulation;
  const act: CinematicAct = weather.rainfall > 0 ? 'storm'
    : cityLighting.power < 0.9 && cityLighting.emergency > 0 ? 'emergency'
      : traffic.bridgeClosure > 0 ? 'detour'
        : flood.waterLevel > 0 ? 'coast'
          : palette.resilience > 0 ? 'renewal' : 'arrival';
  const route = routes[act];
  const travelling = flightEnabled && !reducedMotion;
  return {
    act,
    autopilot: flightEnabled,
    reducedMotion,
    flightSpeed: travelling ? 0.045 : 0,
    camera: {
      position: [...route.position],
      target: [...route.target],
      travel: travelling ? [...route.travel] : [0, 0, 0],
      controls: {
        enablePan: false,
        minDistance: 70,
        maxDistance: 190,
        minPolarAngle: 0.3,
        maxPolarAngle: 1.2,
        minAzimuthAngle: -1.2,
        maxAzimuthAngle: 1.2,
      },
    },
    atmosphereWeight: weather.cloudCover,
    cloudWeight: weather.cloudCover,
    rainWeight: weather.rainfall,
    lightningStrength: reducedMotion ? 0 : Math.min(weather.rainfall, weather.cloudCover),
    wetness: Math.max(weather.rainfall, flood.coverage),
    power: cityLighting.power,
    emergencyWeight: cityLighting.emergency,
    sceneAct: { ...simulation.narration },
  };
}
