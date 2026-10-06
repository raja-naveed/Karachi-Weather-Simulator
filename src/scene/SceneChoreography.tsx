import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshBasicMaterial } from 'three';
import type { QualityMode } from '../components/Hud';
import type { CityStaging } from './choreography';
import { Instances, type Instance } from './Instances';
import { Weather } from './Weather';

export function SceneChoreography({ staging, quality, reducedMotion }: { staging: CityStaging; quality: QualityMode; reducedMotion: boolean }) {
  const lamp = useRef<MeshBasicMaterial>(null);
  const elapsed = useRef(0);
  const count = quality === 'low' ? 18 : quality === 'high' ? 48 : 32;
  const barriers = useMemo<Instance[]>(() => Array.from({ length: count }, (_, i) => {
    const x = -26 + i * 90 / (count - 1);
    const z = x < -6 ? 13.5 + (x + 24) * 0.28 : 18.5 - Math.max(0, x - 28) * 0.19;
    return { position: [x, 0.5 + staging.flood * 1.4, z], scale: [90 / count * 0.88, 0.25 + staging.flood * 2.8, 0.65], color: i % 4 === 0 ? '#cbb690' : '#607b7e' };
  }), [count, staging.flood]);
  const posts = useMemo<Instance[]>(() => barriers.filter((_, i) => i % 3 === 0).map((b) => ({ position: [b.position[0], 1.625 + staging.flood * 2.8, b.position[2]], scale: [0.16, 2, 0.16], color: '#647a7c' })), [barriers, staging.flood]);
  const lamps = useMemo<Instance[]>(() => posts.map((b, i) => ({ position: [b.position[0], b.position[1] + 1.05, b.position[2]], scale: [0.3, 0.24, 0.3], color: i % 2 ? '#7edee1' : '#ffb36c' })), [posts]);
  useFrame((_, delta) => {
    if (!reducedMotion && staging.motion) elapsed.current += Math.min(delta, 0.05);
    if (lamp.current) lamp.current.opacity = 0.28 + staging.beacons * (0.62 + Math.sin(elapsed.current * 1.4) * 0.1);
  });
  return <group>
    <Instances items={barriers}><boxGeometry /><meshStandardMaterial roughness={0.68 - staging.wetness * 0.35} metalness={0.3} /></Instances>
    <Instances items={posts}><boxGeometry /><meshStandardMaterial metalness={0.7} roughness={0.3} /></Instances>
    <Instances items={lamps}><boxGeometry /><meshBasicMaterial ref={lamp} transparent toneMapped={false} /></Instances>
    <Weather staging={staging} quality={quality} reducedMotion={reducedMotion} />
  </group>;
}
