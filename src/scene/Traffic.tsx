import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DynamicDrawUsage, InstancedMesh, Object3D } from 'three';
import type { QualityMode } from '../components/Hud';
import type { ResolvedSimulation } from '../simulation/types';
import type { CityStaging } from './choreography';
import { noise } from './layout';
import { EAST_WEST_ROADS, northSouthLaneX, ROAD_WIDTH } from './geometry';

export function Traffic({ simulation, staging, quality, reducedMotion }: { simulation: ResolvedSimulation; staging: CityStaging; quality: QualityMode; reducedMotion: boolean }) {
  const cars = useRef<InstancedMesh>(null);
  const headlights = useRef<InstancedMesh>(null);
  const emergencyLights = useRef<InstancedMesh>(null);
  const drones = useRef<InstancedMesh>(null);
  const droneLights = useRef<InstancedMesh>(null);
  const droneRotors = useRef<InstancedMesh>(null);
  const time = useRef(0);
  const object = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);
  const capacity = quality === 'low' ? 130 : quality === 'high' ? 420 : 260;
  const droneCapacity = quality === 'low' ? 10 : quality === 'high' ? 40 : 24;
  useFrame((_, delta) => {
    if (!reducedMotion && staging.motion) time.current += Math.min(delta, 0.05);
    if (cars.current) {
      const count = Math.floor(capacity * simulation.traffic.density);
      cars.current.count = count;
      if (headlights.current) headlights.current.count = count;
      let emergencyCount = 0;
      for (let i = 0; i < count; i += 1) {
        const direction = i % 2 ? 1 : -1;
        const bridge = i % 3 === 0;
        const speed = simulation.traffic.speed * (1 - simulation.traffic.congestion * 0.78);
        let x = ((noise(i + 8) * 146 + time.current * speed * 6 * direction + 10000) % 146) - 73;
        let z = bridge ? 22 + direction * 0.95 : EAST_WEST_ROADS[i % EAST_WEST_ROADS.length] + direction * ROAD_WIDTH / 4;
        if (bridge && simulation.traffic.bridgeClosure > 0) {
          // Queue on each approach, leaving the closed span empty.
          x = direction > 0 ? -2 - noise(i + 3) * 68 : 17 + noise(i + 3) * 54;
          if (simulation.traffic.bridgeClosure < 0.5) x += Math.sin(time.current * speed) * 0.3;
        }
        if (!bridge && i % 5 === 0) { z = x * 0.43 - 20; x = northSouthLaneX(i, direction); }
        object.position.set(x, bridge ? 5.55 : 0.79, z);
        object.scale.set(bridge ? 0.8 : 0.65, 0.18, 0.28);
        object.rotation.set(0, !bridge && i % 5 === 0 ? Math.PI / 2 : 0, 0);
        object.updateMatrix();
        cars.current.setMatrixAt(i, object.matrix);
        const responder = noise(i + 840) < staging.emergency * 0.24;
        cars.current.setColorAt(i, color.set(responder ? '#dfd5b4' : ['#9aadb0', '#3e6b78', '#b18b63', '#5b6773'][i % 4]));
        object.position.x += !bridge && i % 5 === 0 ? 0 : direction * 0.42;
        object.position.z += !bridge && i % 5 === 0 ? direction * 0.34 : 0;
        object.scale.set(0.08, 0.06, 0.22);
        object.updateMatrix();
        if (headlights.current) {
          headlights.current.setMatrixAt(i, object.matrix);
          headlights.current.setColorAt(i, color.set(direction > 0 ? '#ffe0a7' : '#ff795d'));
        }
        if (responder && emergencyLights.current) {
          object.position.set(x, (bridge ? 5.55 : 0.79) + 0.15, z);
          object.scale.set(0.25, 0.07, 0.19); object.updateMatrix();
          emergencyLights.current.setMatrixAt(emergencyCount, object.matrix);
          const pulse = reducedMotion || !staging.motion ? 1 : 0.65 + Math.sin(time.current * 2.2 + i) * 0.35;
          emergencyLights.current.setColorAt(emergencyCount, color.set(i % 2 ? '#ff815b' : '#88d9ff').multiplyScalar(pulse));
          emergencyCount++;
        }
      }
      cars.current.instanceMatrix.needsUpdate = true;
      if (cars.current.instanceColor) cars.current.instanceColor.needsUpdate = true;
      if (headlights.current) { headlights.current.instanceMatrix.needsUpdate = true; if (headlights.current.instanceColor) headlights.current.instanceColor.needsUpdate = true; }
      if (emergencyLights.current) { emergencyLights.current.count = emergencyCount; emergencyLights.current.instanceMatrix.needsUpdate = true; if (emergencyLights.current.instanceColor) emergencyLights.current.instanceColor.needsUpdate = true; }
    }
    if (drones.current) {
      const count = Math.floor(droneCapacity * simulation.drone.activity);
      drones.current.count = count;
      if (droneLights.current) droneLights.current.count = count;
      if (droneRotors.current) droneRotors.current.count = count * 4;
      for (let i = 0; i < count; i += 1) {
        const phase = noise(i + 120) * Math.PI * 2 + time.current * 0.14;
        object.position.set(Math.cos(phase) * (22 + noise(i) * 35), 19 + noise(i + 60) * 22, Math.sin(phase) * 26 - 12);
        object.rotation.set(0, -phase, 0);
        object.scale.set(0.85, 0.12, 0.85);
        object.updateMatrix();
        drones.current.setMatrixAt(i, object.matrix);
        if (droneRotors.current) {
          const bodyX = object.position.x;
          const bodyY = object.position.y;
          const bodyZ = object.position.z;
          for (let rotor = 0; rotor < 4; rotor++) {
            const offsetX = rotor % 2 ? 0.55 : -0.55;
            const offsetZ = rotor < 2 ? 0.55 : -0.55;
            object.position.set(bodyX + offsetX * Math.cos(phase) - offsetZ * Math.sin(phase), bodyY, bodyZ + offsetX * Math.sin(phase) + offsetZ * Math.cos(phase));
            object.rotation.set(Math.PI / 2, 0, 0); object.scale.set(0.27, 0.27, 0.27); object.updateMatrix();
            droneRotors.current.setMatrixAt(i * 4 + rotor, object.matrix);
          }
          object.position.set(bodyX, bodyY, bodyZ); object.rotation.set(0, -phase, 0);
        }
        object.position.y -= 0.12; object.scale.set(0.16, 0.09, 0.16); object.updateMatrix();
        if (droneLights.current) droneLights.current.setMatrixAt(i, object.matrix);
      }
      drones.current.instanceMatrix.needsUpdate = true;
      if (droneLights.current) droneLights.current.instanceMatrix.needsUpdate = true;
      if (droneRotors.current) droneRotors.current.instanceMatrix.needsUpdate = true;
    }
  });
  return <group>
    <instancedMesh ref={cars} args={[undefined, undefined, capacity]} frustumCulled={false} onUpdate={(mesh) => mesh.instanceMatrix.setUsage(DynamicDrawUsage)}><boxGeometry /><meshStandardMaterial metalness={0.55} roughness={0.3} /></instancedMesh>
    <instancedMesh ref={headlights} args={[undefined, undefined, capacity]} frustumCulled={false}><boxGeometry /><meshBasicMaterial toneMapped={false} /></instancedMesh>
    <instancedMesh ref={emergencyLights} args={[undefined, undefined, capacity]} frustumCulled={false}><boxGeometry /><meshBasicMaterial toneMapped={false} /></instancedMesh>
    <instancedMesh ref={drones} args={[undefined, undefined, droneCapacity]} frustumCulled={false}><boxGeometry /><meshStandardMaterial color="#adc7c7" metalness={0.75} roughness={0.25} /></instancedMesh>
    <instancedMesh ref={droneLights} args={[undefined, undefined, droneCapacity]} frustumCulled={false}><sphereGeometry args={[1, 6, 4]} /><meshBasicMaterial color={staging.emergency > 0.2 ? '#ff7961' : '#80fce7'} toneMapped={false} /></instancedMesh>
    <instancedMesh ref={droneRotors} args={[undefined, undefined, droneCapacity * 4]} frustumCulled={false}><torusGeometry args={[1, 0.09, 3, quality === 'low' ? 6 : 10]} /><meshStandardMaterial color="#566e73" metalness={0.75} roughness={0.3} /></instancedMesh>
  </group>;
}
