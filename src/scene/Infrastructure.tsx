import { useMemo } from 'react';
import { Shape } from 'three';
import type { ResolvedSimulation } from '../simulation/types';
import type { QualityMode } from '../components/Hud';
import type { CityStaging } from './choreography';
import { Instances, type Instance } from './Instances';
import { noise } from './layout';
import { createBridgeCables, createStreetLayout } from './geometry';

export function Infrastructure({ simulation, staging, quality }: { simulation: ResolvedSimulation; staging: CityStaging; quality: QualityMode }) {
  const land = useMemo(() => {
    const shape = new Shape();
    // Shape local y becomes world -z after its quarter turn.
    shape.moveTo(-450, 450); shape.lineTo(450, 450); shape.lineTo(450, 30); shape.lineTo(110, -3);
    shape.lineTo(65, -15); shape.lineTo(28, -22); shape.lineTo(-6, -23);
    shape.lineTo(-24, -16); shape.lineTo(-30, -6); shape.lineTo(-65, -2);
    shape.lineTo(-85, -14); shape.lineTo(-110, -10); shape.lineTo(-450, 30); shape.closePath();
    return shape;
  }, []);
  const streets = useMemo(createStreetLayout, []);
  const containers = useMemo<Instance[]>(() => Array.from({ length: 100 }, (_, i) => ({
    position: [-65 + (i % 10) * 2.65, 1.15 + Math.floor(i / 50) * 1.3, 6 + (Math.floor(i / 10) % 5) * 3.2],
    scale: [2.35, 1.2, 2.6], color: ['#a35f3f', '#427875', '#9b895a', '#566675'][i % 4],
  })), []);
  const bridgePiers = useMemo<Instance[]>(() => Array.from({ length: 22 }, (_, i) => ({ position: [-72 + i * 7, 2.7, 22], scale: [0.75, 5, 1.2] })), []);
  const streetLights = useMemo<Instance[]>(() => Array.from({ length: 80 }, (_, i) => ({ position: [-74 + i * 1.9, 5.3, 24.45], scale: [0.6, 0.08, 0.12] })), []);
  const detailCount = quality === 'low' ? 32 : quality === 'high' ? 120 : 72;
  const rails = useMemo<Instance[]>(() => [-1, 1].flatMap((side) => Array.from({ length: detailCount }, (_, i) => ({
    position: [-76 + i * 152 / (detailCount - 1), 5.9, 22 + side * 2.1], scale: [0.065, 0.95, 0.065], color: i % 7 ? '#8caaa8' : '#c2a883',
  } as Instance))), [detailCount]);
  const ribs = useMemo<Instance[]>(() => containers.slice(0, quality === 'low' ? 30 : quality === 'high' ? 100 : 60).flatMap((container) => [-0.7, 0, 0.7].map((offset) => ({
    position: [container.position[0] + offset, container.position[1], container.position[2] + 1.31], scale: [0.055, 1.08, 0.045], color: '#404d50',
  } as Instance))), [containers, quality]);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.45, 0]}><shapeGeometry args={[land]} /><meshStandardMaterial color="#525953" roughness={0.96} /></mesh>
    <Instances items={streets}><boxGeometry /><meshPhysicalMaterial roughness={0.8 - staging.wetness * 0.65} metalness={0.22 + staging.wetness * 0.2} clearcoat={staging.wetness} /></Instances>
    <mesh position={[-52, 0.25, 12]}><boxGeometry args={[35, 0.55, 27]} /><meshStandardMaterial color="#7c8276" /></mesh>
    <Instances items={containers}><boxGeometry /><meshStandardMaterial roughness={0.75} /></Instances>
    <Instances items={ribs}><boxGeometry /><meshStandardMaterial roughness={0.6} metalness={0.55} /></Instances>
    {[-64, -53, -42].map((x) => <PortCrane key={x} x={x} power={simulation.cityLighting.power} />)}
    <Instances items={bridgePiers}><boxGeometry /><meshStandardMaterial color="#788b89" /></Instances>
    <mesh position={[0, 5.1, 22]}><boxGeometry args={[155, 0.55, 4.5]} /><meshPhysicalMaterial color="#3e5155" metalness={0.25} roughness={0.6 - staging.wetness * 0.45} clearcoat={staging.wetness} /></mesh>
    <Instances items={rails}><boxGeometry /><meshStandardMaterial metalness={0.72} roughness={0.3} /></Instances>
    {[-1, 1].map((side) => <mesh key={side} position={[0, 6.36, 22 + side * 2.1]}><boxGeometry args={[155, 0.07, 0.07]} /><meshStandardMaterial color="#99afab" metalness={0.75} roughness={0.25} /></mesh>)}
    <mesh position={[0, 5.45, 22]}><boxGeometry args={[155, 0.03, 0.07]} /><meshBasicMaterial color="#d6c296" /></mesh>
    <Instances items={streetLights}><boxGeometry /><meshBasicMaterial color={simulation.traffic.bridgeClosure > 0.2 ? '#ff6c45' : '#ffd392'} transparent opacity={0.18 + simulation.cityLighting.power * 0.82} toneMapped={false} /></Instances>
    <BridgeTower x={-20} /><BridgeTower x={35} />
    {simulation.traffic.bridgeClosure > 0.05 && <mesh position={[8, 5.95, 22]} rotation={[0, 0, -0.12]}><boxGeometry args={[0.45, 1.05, 4.4]} /><meshBasicMaterial color="#ff7952" /></mesh>}
    <group position={[-57, 0.5, 42]} rotation={[0, 0.3, 0]}>
      <mesh><boxGeometry args={[22, 2, 5]} /><meshStandardMaterial color="#293c42" /></mesh>
      <mesh position={[-7, 3, 0]}><boxGeometry args={[4, 4, 4]} /><meshStandardMaterial color="#adb2a0" /></mesh>
      {[0, 4, 8].map((x) => <mesh key={x} position={[x, 1.5, 0]}><boxGeometry args={[3.6, 2, 4]} /><meshStandardMaterial color="#b87e4c" /></mesh>)}
    </group>
  </group>;
}

function BridgeTower({ x }: { x: number }) {
  const cables = useMemo(() => createBridgeCables(x), [x]);
  return <group>
    <mesh position={[x, 12.3, 24]}><boxGeometry args={[0.65, 23, 0.75]} /><meshStandardMaterial color="#cfba94" /></mesh>
    <Instances items={cables}><boxGeometry /><meshStandardMaterial color="#cfb993" /></Instances>
  </group>;
}

function PortCrane({ x, power }: { x: number; power: number }) {
  return <group position={[x, 0.6, 18]}>
    {[-2, 2].map((side) => <mesh key={side} position={[side, 5, 0]} rotation={[0, 0, -side * 0.065]}><boxGeometry args={[0.6, 10, 0.7]} /><meshStandardMaterial color="#c3a166" /></mesh>)}
    <mesh position={[0, 10, 4]}><boxGeometry args={[0.8, 0.7, 17]} /><meshStandardMaterial color="#d5af69" /></mesh>
    <mesh position={[0, 6.5, 11]}><boxGeometry args={[0.07, 7, 0.07]} /><meshStandardMaterial color="#a9b9b6" /></mesh>
    <mesh position={[0, 10.6, 0]}><sphereGeometry args={[0.2, 6, 6]} /><meshBasicMaterial color={noise(x) > power ? '#674c30' : '#ffc073'} toneMapped={false} /></mesh>
  </group>;
}
