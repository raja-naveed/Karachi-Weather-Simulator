import type { Texture } from 'three';

export const HORIZON_TEXTURE_PATH = '/karachi-monsoon-horizon.png';

/** The opaque authored surface stays in place while loading or after an error. */
export function horizonSurface(texture: Texture | null) {
  return { map: texture ?? undefined, color: texture ? '#ffffff' : '#385561', opacity: 1 };
}
