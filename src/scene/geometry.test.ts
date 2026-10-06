import { describe, expect, it } from 'vitest';
import { Euler, Vector3 } from 'three';
import { createCityLayout } from './layout';
import { createBridgeCables, createStreetLayout, northSouthLaneX, roadsideTreeX } from './geometry';

describe('city infrastructure geometry', () => {
  it('keeps road surfaces clear of every building footprint', () => {
    const buildings = createCityLayout();
    for (const road of createStreetLayout()) for (const building of buildings) {
      const overlapsX = Math.abs(road.position[0] - building.x) < (road.scale[0] + building.width) / 2;
      const overlapsZ = Math.abs(road.position[2] - building.z) < (road.scale[2] + building.depth) / 2;
      expect(overlapsX && overlapsZ, `road at ${road.position} intersects building at ${building.x},${building.z}`).toBe(false);
    }
  });

  it('keeps both north-south traffic lanes on the reserved corridors', () => {
    const corridors = [-64.4, -41.4, -18.4, 4.6, 27.6, 50.6];
    for (let index = 0; index < 420; index += 5) for (const direction of [-1, 1]) {
      const x = northSouthLaneX(index, direction);
      const distance = Math.min(...corridors.map((center) => Math.abs(x - center)));
      expect(distance).toBeCloseTo(0.45);
      expect(distance + 0.14).toBeLessThan(0.9);
    }
  });

  it('places roadside tree canopies outside traffic and building footprints', () => {
    const corridors = [-64.4, -41.4, -18.4, 4.6, 27.6, 50.6];
    for (const sample of [-64, -48, -20, 0, 24, 49, 64]) {
      const x = roadsideTreeX(sample);
      const distance = Math.min(...corridors.map((center) => Math.abs(x - center)));
      expect(distance - 0.55).toBeGreaterThan(0.9);
      for (const building of createCityLayout()) expect(Math.abs(building.x - x)).toBeGreaterThan(building.width / 2 + 0.55);
    }
  });

  it.each([-20, 35])('connects every cable from the deck to tower x=%s', (towerX) => {
    for (const cable of createBridgeCables(towerX)) {
      const rotation = new Euler(...cable.rotation!);
      const midpoint = new Vector3(...cable.position);
      const top = new Vector3(0, cable.scale[1] / 2, 0).applyEuler(rotation).add(midpoint);
      const bottom = new Vector3(0, -cable.scale[1] / 2, 0).applyEuler(rotation).add(midpoint);
      expect(top.x).toBeCloseTo(towerX);
      expect(top.y).toBeCloseTo(20.6);
      expect(bottom.y).toBeCloseTo(5.6);
      expect(Math.abs(bottom.x - towerX)).toBeGreaterThanOrEqual(3.1 - 1e-9);
      expect(Math.abs(bottom.x - towerX)).toBeLessThanOrEqual(15.5 + 1e-9);
    }
  });
});
