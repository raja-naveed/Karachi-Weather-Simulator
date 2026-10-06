import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshBasicMaterial } from 'three';
import type { QualityMode } from '../components/Hud';
import type { CityStaging } from './choreography';
import { Instances, type Instance } from './Instances';
import { EAST_WEST_ROADS, NORTH_SOUTH_ROADS, ROAD_WIDTH } from './geometry';
import { noise } from './layout';

/** Local surface water and spray; Atmosphere owns sky, clouds, rain and lightning. */
export function Weather({ staging, quality, reducedMotion }: { staging: CityStaging; quality: QualityMode; reducedMotion: boolean }) {
  const spray = useRef<MeshBasicMaterial>(null);
  const time = useRef(0);
  const count = quality === 'low' ? 40 : quality === 'high' ? 160 : 85;
  const puddles = useMemo<Instance[]>(() => Array.from({ length: count }, (_, i) => {
    const cross = i % 2 === 0;
    return { position: cross ? [noise(i + 34) * 128 - 64, 0.566, EAST_WEST_ROADS[i % EAST_WEST_ROADS.length] + (noise(i + 49) - 0.5) * ROAD_WIDTH * 0.6]
      : [NORTH_SOUTH_ROADS[i % NORTH_SOUTH_ROADS.length] + (noise(i + 49) - 0.5) * ROAD_WIDTH * 0.6, 0.566, noise(i + 34) * 74 - 57],
      scale: cross ? [0.8 + noise(i) * 2, 0.008, 0.18 + noise(i + 3) * 0.45] : [0.18 + noise(i + 3) * 0.45, 0.008, 0.8 + noise(i) * 2], color: i % 3 ? '#527780' : '#b99d79' };
  }), [count]);
  const splashes = useMemo<Instance[]>(() => puddles.filter((_, i) => i % 2 === 0).map((p) => ({ position: [p.position[0], 0.61, p.position[2]], scale: [0.22, 0.04, 0.22] })), [puddles]);
  useFrame((_, delta) => {
    if (!reducedMotion && staging.motion) time.current += Math.min(delta, 0.05);
    if (spray.current) spray.current.opacity = staging.storm * (0.16 + Math.sin(time.current * 2) * 0.04);
  });
  return <group visible={staging.wetness > 0}>
    <Instances items={puddles}><boxGeometry /><meshPhysicalMaterial transparent opacity={staging.wetness * 0.55} roughness={0.08} metalness={0.5} clearcoat={1} depthWrite={false} /></Instances>
    <Instances items={splashes}><sphereGeometry args={[1, 6, 4]} /><meshBasicMaterial ref={spray} color="#a4d3d8" transparent depthWrite={false} /></Instances>
  </group>;
}
