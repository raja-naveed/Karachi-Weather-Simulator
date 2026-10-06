import type { Instance } from './Instances';
import { CITY_GRID, columnX, isStreetIndex, noise, rowZ } from './layout';

export const NORTH_SOUTH_ROADS = Array.from({ length: CITY_GRID.columns }, (_, i) => i).filter(isStreetIndex).map(columnX);
export const EAST_WEST_ROADS = Array.from({ length: CITY_GRID.rows }, (_, i) => i).filter(isStreetIndex).map(rowZ);
export const ROAD_WIDTH = 1.8;

export function createStreetLayout(): Instance[] {
  return [
    ...NORTH_SOUTH_ROADS.map((x): Instance => ({ position: [x, 0.52, -22], scale: [ROAD_WIDTH, 0.05, 80], color: '#26373c' })),
    ...EAST_WEST_ROADS.map((z): Instance => ({ position: [3, 0.53, z], scale: [140, 0.05, ROAD_WIDTH], color: '#26373c' })),
  ];
}

export function northSouthLaneX(index: number, direction: number) {
  return NORTH_SOUTH_ROADS[Math.floor(noise(index + 701) * NORTH_SOUTH_ROADS.length)] + direction * ROAD_WIDTH / 4;
}

export function roadsideTreeX(x: number) {
  const center = NORTH_SOUTH_ROADS.reduce((nearest, road) => Math.abs(road - x) < Math.abs(nearest - x) ? road : nearest);
  return center + (x < center ? -1 : 1) * (ROAD_WIDTH / 2 + 0.9);
}

export function createBridgeCables(x: number): Instance[] {
  const result: Instance[] = [];
  for (const side of [-1, 1]) for (let i = 1; i <= 5; i += 1) {
    const dx = side * i * 3.1;
    const height = 15;
    result.push({ position: [x + dx / 2, 5.6 + height / 2, 24], scale: [0.075, Math.hypot(dx, height), 0.075], rotation: [0, 0, Math.atan2(dx, height)] });
  }
  return result;
}
