import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette, HueSaturation } from '@react-three/postprocessing';
import type { QualityMode } from '../components/Hud';
import type { ResolvedSimulation } from '../simulation/types';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { City } from './City';
import { Infrastructure } from './Infrastructure';
import { Traffic } from './Traffic';
import { Atmosphere } from './Atmosphere';
import { Waterfront } from './Waterfront';
import { CameraRig } from './CameraRig';
import { resolveCinematicBeat } from './director';
import { resolveCityStaging } from './choreography';
import { SceneChoreography } from './SceneChoreography';

export interface KarachiSceneProps {
  simulation: ResolvedSimulation;
  quality: QualityMode;
  cinematic: boolean;
  flightEnabled?: boolean;
  onFlightChange?: (enabled: boolean) => void;
}

function SceneWorld({ simulation, quality, cinematic, reducedMotion, flightEnabled = true, onFlightChange }: KarachiSceneProps & { reducedMotion: boolean }) {
  const beat = useMemo(() => {
    const resolved = resolveCinematicBeat(simulation, flightEnabled, reducedMotion);
    // Keep the existing wider, gentler camera when cinematic mode is off.
    if (!cinematic) {
      resolved.camera.position[1] += 9;
      resolved.camera.position[2] += 13;
      resolved.camera.travel = resolved.camera.travel.map((value) => value * 0.3) as [number, number, number];
    }
    return resolved;
  }, [simulation, cinematic, flightEnabled, reducedMotion]);
  const staging = useMemo(() => resolveCityStaging(simulation, beat), [simulation, beat]);
  return <>
    <Atmosphere beat={beat} simulation={simulation} quality={quality} reducedMotion={reducedMotion} />
    <CameraRig beat={beat} flightEnabled={flightEnabled} onFlightChange={onFlightChange} />
    <Waterfront beat={beat} simulation={simulation} quality={quality} reducedMotion={reducedMotion} />
    <Infrastructure simulation={simulation} staging={staging} quality={quality} />
    <City simulation={simulation} staging={staging} quality={quality} reducedMotion={reducedMotion} />
    <SceneChoreography staging={staging} quality={quality} reducedMotion={reducedMotion} />
    <Traffic simulation={simulation} staging={staging} quality={quality} reducedMotion={reducedMotion} />
    {quality !== 'low' && <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
      <Bloom intensity={0.5 + simulation.cityLighting.power * 0.25} luminanceThreshold={0.7} luminanceSmoothing={0.4} mipmapBlur />
      <HueSaturation saturation={-0.12 + simulation.palette.resilience * 0.12 - simulation.palette.emergency * 0.12} />
      <Vignette eskil={false} offset={0.18} darkness={0.6} />
    </EffectComposer>}
  </>;
}

export function KarachiScene(props: KarachiSceneProps) {
  const reducedMotion = useReducedMotion();
  const [localFlightEnabled, setLocalFlightEnabled] = useState(true);
  const flightEnabled = props.flightEnabled ?? localFlightEnabled;
  const onFlightChange = (enabled: boolean) => {
    setLocalFlightEnabled(enabled);
    props.onFlightChange?.(enabled);
  };
  return <Canvas
    camera={{ position: [67, 70, 102], fov: 46, near: 0.5, far: 700 }}
    dpr={props.quality === 'low' ? 1 : props.quality === 'high' ? [1, 2] : [1, 1.5]}
    gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
  >
    <SceneWorld {...props} reducedMotion={reducedMotion} flightEnabled={flightEnabled} onFlightChange={onFlightChange} />
  </Canvas>;
}
