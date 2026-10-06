import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, Object3D } from 'three';
import type { QualityMode } from '../components/Hud';
import type { CityBlock } from './layout';
import { noise } from './layout';
import { EAST_WEST_ROADS, roadsideTreeX, ROAD_WIDTH } from './geometry';
import { Instances, type Instance } from './Instances';
import type { CityStaging } from './choreography';

export function MaterialCity({ blocks, staging, quality, reducedMotion }: { blocks: CityBlock[]; staging: CityStaging; quality: QualityMode; reducedMotion: boolean }) {
  const windows = useRef<InstancedMesh>(null);
  const time = useRef(0);
  const object = useMemo(() => new Object3D(), []);
  const tint = useMemo(() => new Color(), []);
  const facade = useMemo<Instance[]>(() => blocks.flatMap((b) => {
    const items: Instance[] = [{ position: [b.x, 1.2, b.z], scale: [b.width * 1.05, 1.2, b.depth * 1.05], color: '#626d69' }];
    const spacing = quality === 'low' ? 6 : quality === 'high' ? 2.5 : 4;
    for (let y = 3; y < b.height; y += spacing) items.push({ position: [b.x, y + 0.5, b.z], scale: [b.width * 1.025, 0.12, b.depth * 1.025], color: noise(b.seed) > 0.5 ? '#b1b6aa' : '#344d58' });
    if (quality !== 'low') items.push({ position: [b.x + b.width * 0.3, b.height + 1.6, b.z], scale: [0.1, 2.2, 0.1], color: '#9caaa6' });
    return items;
  }), [blocks, quality]);
  const glass = useMemo<Instance[]>(() => blocks.filter((b) => b.height > 9).flatMap((b) => [
    { position: [b.x, b.height * 0.56, b.z + b.depth / 2 + 0.03], scale: [b.width * 0.68, b.height * 0.74, 0.035], color: noise(b.seed + 6) > 0.5 ? '#3a727e' : '#547b81' },
    { position: [b.x + b.width / 2 + 0.03, b.height * 0.56, b.z], scale: [0.035, b.height * 0.74, b.depth * 0.7], color: '#355b6b' },
  ] as Instance[]), [blocks]);
  const windowLayout = useMemo(() => blocks.flatMap((b) => {
    const items: (Instance & { seed: number; district: number })[] = [];
    const spacing = quality === 'low' ? 3 : quality === 'high' ? 1.2 : 1.8;
    for (let y = 1.7; y < b.height; y += spacing) {
      const seed = b.seed + y;
      items.push({ position: [b.x, y + 0.5, b.z + b.depth / 2 + 0.07], scale: [b.width * 0.72, 0.16, 0.035], seed, district: b.x + b.z });
      items.push({ position: [b.x + b.width / 2 + 0.07, y + 0.5, b.z], scale: [0.035, 0.16, b.depth * 0.68], seed: seed + 1, district: b.x + b.z });
    }
    return items;
  }), [blocks, quality]);
  const panels = useMemo<Instance[]>(() => blocks.filter((b) => noise(b.seed + 51) < staging.solar).map((b) => ({
    position: [b.x, b.height + 1.4, b.z], scale: [b.width * 0.82, 0.16, b.depth * 0.8], rotation: [0.16, 0, 0], color: noise(b.seed) > 0.5 ? '#467e99' : '#254c68',
  })), [blocks, staging.solar]);
  const panelLines = useMemo<Instance[]>(() => panels.flatMap((panel) => [-0.25, 0, 0.25].map((offset) => ({
    position: [panel.position[0] + panel.scale[0] * offset, panel.position[1] + 0.1, panel.position[2]], scale: [0.025, 0.025, panel.scale[2]], rotation: panel.rotation, color: '#83bcc5',
  }))), [panels]);
  const trees = useMemo<Instance[]>(() => {
    const items: Instance[] = [];
    const capacity = quality === 'low' ? 180 : quality === 'high' ? 720 : 400;
    for (let i = 0; i < capacity; i++) {
      if (noise(i + 830) > staging.vegetation) continue;
      const x = noise(i + 901) * 128 - 64;
      const z = noise(i + 1211) * 74 - 57;
      const rooftop = i % 3 === 0;
      const b = blocks[i % blocks.length];
      if (!rooftop && EAST_WEST_ROADS.some((roadZ) => Math.abs(roadZ - z) < ROAD_WIDTH / 2 + 0.65)) continue;
      const growth = 0.75 + staging.vegetation * 0.6;
      items.push({ position: rooftop ? [b.x, b.height + 0.5 + growth * 0.8, b.z] : [roadsideTreeX(x), 0.55 + growth * 1.6, z], scale: rooftop ? [growth, growth * 0.8, growth] : [growth * 0.65, growth * 1.6, growth * 0.45], color: ['#326853', '#58846a', '#86a378'][i % 3] });
    }
    return items;
  }, [blocks, quality, staging.vegetation]);
  const trunks = useMemo<Instance[]>(() => trees.map((tree) => ({ position: [tree.position[0], tree.position[1] - tree.scale[1] * 0.55, tree.position[2]], scale: [0.12, tree.scale[1], 0.12], color: '#685d48' })), [trees]);
  useLayoutEffect(() => {
    if (!windows.current) return;
    windowLayout.forEach((window, i) => {
      object.position.set(...window.position); object.scale.set(...window.scale); object.rotation.set(0, 0, 0); object.updateMatrix();
      windows.current!.setMatrixAt(i, object.matrix);
    });
    windows.current.instanceMatrix.needsUpdate = true;
  }, [object, windowLayout]);
  useFrame((_, delta) => {
    if (!reducedMotion && staging.motion) time.current += Math.min(delta, 0.05);
    if (!windows.current) return;
    windowLayout.forEach((window, i) => {
      const powered = noise(window.seed + 4) < staging.power;
      const emergency = !powered && noise(window.seed + 19) < staging.emergency * 0.15;
      const wave = reducedMotion || !staging.motion ? 1 : 0.87 + Math.sin(window.district * 0.07 - time.current * 0.4) * 0.13;
      tint.set(emergency ? '#ff8054' : noise(window.seed) > 0.23 ? '#ffd6a0' : '#a5e3df');
      tint.multiplyScalar(powered ? wave * (0.65 + staging.power * 0.55) : emergency ? 0.9 : 0.035);
      windows.current!.setColorAt(i, tint);
    });
    if (windows.current.instanceColor) windows.current.instanceColor.needsUpdate = true;
  });
  return <group>
    <Instances items={facade}><boxGeometry /><meshStandardMaterial roughness={0.75 - staging.wetness * 0.3} metalness={0.22} /></Instances>
    <Instances items={glass}><boxGeometry /><meshPhysicalMaterial metalness={0.65} roughness={0.27 - staging.wetness * 0.15} clearcoat={0.8} clearcoatRoughness={0.15} /></Instances>
    <instancedMesh ref={windows} args={[undefined, undefined, windowLayout.length]} frustumCulled={false}><boxGeometry /><meshBasicMaterial toneMapped={false} /></instancedMesh>
    <Instances items={panels}><boxGeometry /><meshPhysicalMaterial emissive="#256c82" emissiveIntensity={staging.restoration * 0.65} roughness={0.17} metalness={0.85} clearcoat={1} /></Instances>
    <Instances items={panelLines}><boxGeometry /><meshStandardMaterial metalness={0.8} roughness={0.25} /></Instances>
    <Instances items={trees}><icosahedronGeometry args={[1, quality === 'low' ? 0 : 1]} /><meshStandardMaterial roughness={0.92} emissive="#244c32" emissiveIntensity={staging.restoration * 0.15} /></Instances>
    <Instances items={trunks}><boxGeometry /><meshStandardMaterial roughness={1} /></Instances>
  </group>;
}
