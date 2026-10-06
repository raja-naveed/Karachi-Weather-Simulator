// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Texture } from 'three';

type HorizonAsset = {
  HORIZON_TEXTURE_PATH: string;
  horizonSurface: (texture: Texture | null) => { map: Texture | undefined; color: string; opacity: number };
};

const assets = import.meta.glob<HorizonAsset>('./horizon.ts', { eager: true });

describe('local cinematic horizon', () => {
  it('resolves the scene texture to a bundled local PNG', async () => {
    // Catches a missing scene asset declaration, wrong public path, or missing asset.
    expect(assets['./horizon.ts']).toBeDefined();
    const path = assets['./horizon.ts'].HORIZON_TEXTURE_PATH;
    expect(path).toMatch(/^\/[^/]+\.png$/);
    const image = await readFile(resolve(process.cwd(), 'public', path.slice(1)));
    expect([...image.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });

  it('keeps an opaque authored horizon when the texture is unavailable', () => {
    expect(assets['./horizon.ts']).toBeDefined();
    const surface = assets['./horizon.ts'].horizonSurface(null);
    expect(surface.map).toBeUndefined();
    expect(surface.color).toBe('#385561');
    expect(surface.opacity).toBe(1);
  });
});
