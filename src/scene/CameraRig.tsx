import { useLayoutEffect, useMemo, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { CinematicBeat } from './director';

export interface CameraRigProps {
  beat: CinematicBeat;
  flightEnabled: boolean;
  onFlightChange?: (enabled: boolean) => void;
}

/** Owns the camera. Input immediately stops flight; a false → true prop change resumes it. */
export function CameraRig({ beat, flightEnabled, onFlightChange }: CameraRigProps) {
  const { camera, size } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const elapsed = useRef(0);
  const takeover = useRef(false);
  const initialized = useRef(false);
  const destination = useMemo(() => new Vector3(), []);
  const target = useMemo(() => new Vector3(), []);

  useLayoutEffect(() => {
    takeover.current = !flightEnabled;
    elapsed.current = 0;
  }, [flightEnabled]);

  useLayoutEffect(() => {
    if (initialized.current || !controls.current) return;
    initialized.current = true;
    camera.position.fromArray(beat.camera.position);
    controls.current.target.fromArray(beat.camera.target);
    controls.current.update();
  }, [beat, camera]);

  useFrame((_, delta) => {
    if (!controls.current || !flightEnabled || !beat.autopilot || takeover.current) return;
    const step = Math.min(delta, 0.05);
    elapsed.current += step * beat.flightSpeed;
    const drift = Math.sin(elapsed.current);
    const distance = size.width / Math.max(size.height, 1) < 0.8 ? 1.25 : 1;
    target.fromArray(beat.camera.target);
    destination.fromArray(beat.camera.position).sub(target).multiplyScalar(distance).add(target);
    destination.x += drift * beat.camera.travel[0];
    destination.y += drift * beat.camera.travel[1];
    destination.z += drift * beat.camera.travel[2];
    const easing = beat.reducedMotion ? 1 : 1 - Math.exp(-step * 2.5);
    camera.position.lerp(destination, easing);
    controls.current.target.lerp(target, easing);
    // update applies the same distance and angular bounds during flight and manual control.
    controls.current.update();
  });

  return <OrbitControls
    ref={controls}
    makeDefault
    {...beat.camera.controls}
    enableDamping={false}
    onStart={() => {
      // Stop writes in this event, before the parent can rerender controlled flight state.
      takeover.current = true;
      onFlightChange?.(false);
    }}
  />;
}
