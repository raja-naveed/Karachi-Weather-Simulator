import type { ResolvedSimulation } from '../simulation/types';
import type { CinematicBeat } from './director';

export interface CityStaging {
  flood: number; beacons: number; storm: number; wetness: number;
  power: number; emergency: number; dim: number; restoration: number;
  solar: number; vegetation: number; motion: number;
}

/** Presentation weights only: the resolver and director own all scenario curves. */
export function resolveCityStaging(simulation: ResolvedSimulation, beat: CinematicBeat): CityStaging {
  return {
    flood: simulation.flood.coverage,
    beacons: Math.max(simulation.flood.coverage, beat.emergencyWeight, simulation.traffic.bridgeClosure),
    storm: beat.rainWeight, wetness: beat.wetness, power: beat.power,
    emergency: beat.emergencyWeight, dim: 1 - beat.power,
    restoration: simulation.palette.resilience, solar: simulation.solar.coverage,
    vegetation: simulation.greenery.coverage, motion: beat.reducedMotion ? 0 : 1,
  };
}
