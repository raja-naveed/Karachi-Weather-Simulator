import { useMemo } from 'react';
import type { ResolvedSimulation } from '../simulation/types';
import type { QualityMode } from '../components/Hud';
import { Instances, type Instance } from './Instances';
import { createCityLayout } from './layout';
import { MaterialCity } from './MaterialCity';
import type { CityStaging } from './choreography';

export function City({ simulation, staging, quality, reducedMotion }: { simulation: ResolvedSimulation; staging: CityStaging; quality: QualityMode; reducedMotion: boolean }) {
  const blocks = useMemo(createCityLayout, []);
  const buildings = useMemo<Instance[]>(() => blocks.map((b) => ({
    position: [b.x, b.height / 2 + 0.5, b.z], scale: [b.width, b.height, b.depth], color: b.tone,
  })), [blocks]);
  const roofs = useMemo<Instance[]>(() => blocks.filter((b) => b.height > 10).map((b) => ({
    position: [b.x, b.height + 0.9, b.z], scale: [b.width * 0.55, 0.8, b.depth * 0.55], color: b.tone,
  })), [blocks]);
  return (
    <group>
      <Instances items={buildings}><boxGeometry /><meshStandardMaterial roughness={0.78 - staging.wetness * 0.25} metalness={0.24} /></Instances>
      <Instances items={roofs}><boxGeometry /><meshStandardMaterial roughness={0.7} /></Instances>
      <MaterialCity blocks={blocks} staging={staging} quality={quality} reducedMotion={reducedMotion} />
      <Landmark power={simulation.cityLighting.power} accent={simulation.palette.accent} />
      <CivicGarden />
    </group>
  );
}

function CivicGarden() {
  return <group position={[34, 0.55, -31]}>
    <mesh position={[0, 0.05, 0]}><boxGeometry args={[16, 0.1, 16]} /><meshStandardMaterial color="#647e5b" /></mesh>
    <mesh position={[0, 0.3, 0]}><boxGeometry args={[10, 0.5, 10]} /><meshStandardMaterial color="#b1ad97" /></mesh>
    <mesh position={[0, 3.2, 0]}><boxGeometry args={[5.8, 5.4, 5.8]} /><meshStandardMaterial color="#e5e0cb" roughness={0.65} /></mesh>
    <mesh position={[0, 5.9, 0]}><sphereGeometry args={[2.9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#eee4cf" roughness={0.65} /></mesh>
    <mesh position={[0, 2.4, 2.92]}><planeGeometry args={[1.6, 3.4]} /><meshStandardMaterial color="#425354" /></mesh>
    <mesh position={[2.92, 2.4, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[1.6, 3.4]} /><meshStandardMaterial color="#425354" /></mesh>
  </group>;
}

function Landmark({ power, accent }: { power: number; accent: string }) {
  return (
    <group position={[-3, 0.5, -13]}>
      <mesh position={[0, 19, 0]}><cylinderGeometry args={[1.7, 3.3, 38, 6]} /><meshStandardMaterial color="#728388" metalness={0.65} roughness={0.3} /></mesh>
      <mesh position={[0, 40, 0]}><coneGeometry args={[1.8, 6, 6]} /><meshStandardMaterial color="#cfb689" metalness={0.7} roughness={0.25} /></mesh>
      <mesh position={[0, 44, 0]}><cylinderGeometry args={[0.08, 0.1, 6, 5]} /><meshBasicMaterial color={power > 0.2 ? '#ffe4b1' : '#53616b'} /></mesh>
      {[8, 15, 22, 29, 36].map((y) => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[3.3 - y * 0.043, 0.07, 4, 6]} /><meshBasicMaterial color={accent} transparent opacity={power} toneMapped={false} /></mesh>)}
    </group>
  );
}
