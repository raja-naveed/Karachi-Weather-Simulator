export interface CityBlock {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  tone: string;
  seed: number;
}

export const CITY_GRID = { columns: 29, rows: 19, spacing: 4.6, originColumn: 14, originRow: 13, streetInterval: 5 } as const;
export const isStreetIndex = (index: number) => index % CITY_GRID.streetInterval === 0;
export const columnX = (column: number) => (column - CITY_GRID.originColumn) * CITY_GRID.spacing;
export const rowZ = (row: number) => (row - CITY_GRID.originRow) * CITY_GRID.spacing;

/** Stable spatial noise keeps all scenario/quality transitions on the same city. */
export function noise(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export function createCityLayout(): CityBlock[] {
  const blocks: CityBlock[] = [];
  for (let row = 0; row < CITY_GRID.rows; row += 1) {
    for (let col = 0; col < CITY_GRID.columns; col += 1) {
      if (isStreetIndex(col) || isStreetIndex(row)) continue;
      const x = columnX(col);
      const z = rowZ(row);
      // Leave the harbor and waterfront promenade open.
      if ((x < -27 && z > 0) || z > 16 - x * 0.08) continue;
      // A quiet civic garden around an imagined Mazar-e-Quaid landmark.
      if (Math.hypot(x - 34, z + 31) < 8.5) continue;
      const seed = row * 31 + col;
      const central = Math.exp(-((x + 2) ** 2 / 480 + (z + 12) ** 2 / 340));
      const oldTown = x > 24;
      const height = 2 + noise(seed) * (oldTown ? 6 : 12) + central * (8 + noise(seed + 13) * 24);
      blocks.push({ x, z, width: 2.4 + noise(seed + 1) * 1.25,
        depth: 2.5 + noise(seed + 2) * 1.05, height, seed,
        tone: oldTown ? ['#ad9978', '#8f8470', '#bbab8d'][seed % 3]
          : central > 0.5 ? ['#536b72', '#768489', '#9b9787'][seed % 3]
            : ['#8b8c82', '#737f7e', '#a4977f'][seed % 3] });
    }
  }
  return blocks;
}
