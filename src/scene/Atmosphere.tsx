import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, BufferAttribute, Color, Group, LineSegments, PointLight, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader } from 'three';
import type { QualityMode } from '../components/Hud';
import type { ResolvedSimulation } from '../simulation/types';
import type { CinematicBeat } from './director';
import { HORIZON_TEXTURE_PATH, horizonSurface } from './horizon';
import { noise } from './layout';

export interface AtmosphereProps {
  beat: CinematicBeat;
  simulation: ResolvedSimulation;
  quality: QualityMode;
  reducedMotion: boolean;
}

const skyVertex = `varying vec3 vPosition;
void main() { vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const skyFragment = `
uniform float uStorm;
uniform vec3 uAccent;
varying vec3 vPosition;
void main() {
  float altitude = clamp(normalize(vPosition).y * 1.5, 0.0, 1.0);
  vec3 dusk = mix(vec3(0.57, 0.42, 0.30), vec3(0.045, 0.13, 0.19), altitude);
  vec3 storm = mix(vec3(0.23, 0.32, 0.36), vec3(0.025, 0.07, 0.12), altitude);
  float glow = pow(max(0.0, dot(normalize(vPosition), normalize(vec3(-0.6, 0.12, -1.0)))), 18.0);
  vec3 color = mix(dusk, storm, uStorm) + glow * vec3(0.28, 0.16, 0.07) * (1.0-uStorm);
  gl_FragColor = vec4(color + uAccent * 0.015, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
const cloudVertex = `varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const cloudFragment = `
uniform float uTime;
uniform float uWeight;
uniform float uDetail;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise2(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
void main() {
  vec2 p=vUv*vec2(12.0,3.0)+vec2(uTime*0.012,0.0);
  float n=noise2(p)*0.65+noise2(p*2.1)*0.25;
  if(uDetail>0.5) n+=noise2(p*4.2)*0.1;
  float edge=smoothstep(0.0,0.16,vUv.y)*(1.0-smoothstep(0.7,1.0,vUv.y));
  float shelf=smoothstep(0.22,0.65,n+vUv.y*0.2)*edge;
  vec3 color=mix(vec3(0.34,0.39,0.42),vec3(0.065,0.11,0.16),uWeight);
  gl_FragColor=vec4(color,shelf*(0.18+uWeight*0.7));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

function Horizon() {
  const [texture, setTexture] = useState<Texture | null>(null);
  const horizon = useRef<Group>(null);
  useEffect(() => {
    let alive = true;
    // This loader never suspends the scene or throws into the Canvas boundary.
    const loaded = new TextureLoader().load(
      `${import.meta.env.BASE_URL}${HORIZON_TEXTURE_PATH.slice(1)}`,
      (image) => {
        image.colorSpace = SRGBColorSpace;
        if (alive) setTexture(image);
        else image.dispose();
      },
      undefined,
      () => { if (alive) setTexture(null); },
    );
    return () => { alive = false; loaded.dispose(); };
  }, []);
  useFrame(({ camera }) => {
    // A distant world layer moves much less than the city; never writes camera state.
    if (horizon.current) horizon.current.position.x = camera.position.x * 0.035;
  });
  return <group ref={horizon}>
    <mesh position={[-15, 66, -178]} renderOrder={-10}>
      <planeGeometry args={[530, 220]} />
      <meshBasicMaterial {...horizonSurface(texture)} fog={false} toneMapped={false} />
    </mesh>
    {!texture && <group>
      {Array.from({ length: 32 }, (_, i) => <mesh key={i} position={[-240 + i * 15, 2 + noise(i + 891) * 11, -172]}>
        <boxGeometry args={[8 + noise(i + 481) * 9, 7 + noise(i + 891) * 22, 4]} />
        <meshBasicMaterial color="#233e4c" fog={false} />
      </mesh>)}
    </group>}
  </group>;
}

export function Atmosphere({ beat, simulation, quality, reducedMotion }: AtmosphereProps) {
  const rain = useRef<LineSegments>(null);
  const cloud = useRef<ShaderMaterial>(null);
  const lightning = useRef<PointLight>(null);
  const elapsed = useRef(0);
  const still = reducedMotion || beat.reducedMotion;
  const rainCount = quality === 'low' ? 240 : quality === 'high' ? 1800 : 800;
  const drops = useMemo(() => {
    const points = new Float32Array(rainCount * 6);
    for (let i = 0; i < rainCount; i++) {
      const x = noise(i + 4300) * 175 - 87;
      const y = noise(i + 7200) * 80;
      const z = noise(i + 9900) * 135 - 65;
      points.set([x, y, z, x - 0.4, y - 1.8, z], i * 6);
    }
    return points;
  }, [rainCount]);
  const skyUniforms = useMemo(() => ({ uStorm: { value: beat.atmosphereWeight }, uAccent: { value: new Color(simulation.palette.accent) } }), [beat.atmosphereWeight, simulation.palette.accent]);
  const cloudUniforms = useMemo(() => ({ uTime: { value: 0 }, uWeight: { value: beat.cloudWeight }, uDetail: { value: quality === 'low' ? 0 : 1 } }), [beat.cloudWeight, quality]);
  const fogColor = useMemo(() => new Color('#627277').lerp(new Color('#293f4e'), beat.atmosphereWeight).lerp(new Color(simulation.palette.accent), 0.035), [beat.atmosphereWeight, simulation.palette.accent]);
  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    if (!still) elapsed.current += step;
    if (cloud.current) cloud.current.uniforms.uTime.value = still ? 0 : elapsed.current;
    if (lightning.current) {
      const phase = elapsed.current % 13;
      // One soft, brief flash per cycle; disabled entirely for reduced motion and low quality.
      lightning.current.intensity = still || quality === 'low' ? 0 : Math.exp(-Math.pow((phase - 9.1) / 0.12, 2)) * beat.lightningStrength * 2400;
    }
    if (still || !rain.current || beat.rainWeight === 0) return;
    for (let i = 0; i < rainCount; i++) {
      const index = i * 6;
      drops[index + 1] = (drops[index + 1] - step * (26 + beat.rainWeight * 18) + 80) % 80;
      drops[index + 4] = drops[index + 1] - 1.8;
    }
    (rain.current.geometry.getAttribute('position') as BufferAttribute).needsUpdate = true;
  });
  return <>
    <color attach="background" args={['#213d4c']} />
    <fog attach="fog" args={[fogColor, 105 - simulation.weather.haze * 30, 330 - simulation.weather.haze * 110]} />
    <mesh renderOrder={-20}>
      <sphereGeometry args={[490, quality === 'low' ? 16 : 32, 16]} />
      <shaderMaterial side={BackSide} uniforms={skyUniforms} vertexShader={skyVertex} fragmentShader={skyFragment} depthWrite={false} />
    </mesh>
    <Horizon />
    <mesh position={[0, 110, -140]} renderOrder={-5}>
      <planeGeometry args={[510, 110]} />
      <shaderMaterial ref={cloud} uniforms={cloudUniforms} vertexShader={cloudVertex} fragmentShader={cloudFragment} transparent depthWrite={false} />
    </mesh>
    <ambientLight intensity={0.5 - beat.atmosphereWeight * 0.2} color="#a2bfcd" />
    <hemisphereLight args={['#9ac6d0', '#bd9562', 1.4 - beat.atmosphereWeight * 0.4]} />
    <directionalLight position={[-70, 45, 15]} intensity={3.3 - beat.atmosphereWeight * 2.2} color="#ffcb91" />
    <directionalLight position={[30, 25, -60]} intensity={0.9 + beat.emergencyWeight * 0.15} color="#77b9cd" />
    <pointLight ref={lightning} position={[-35, 80, -45]} intensity={0} color="#c8e7ff" distance={260} decay={1.2} />
    <lineSegments ref={rain} visible={beat.rainWeight > 0} frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[drops, 3]} /></bufferGeometry>
      <lineBasicMaterial color="#b5d5e0" transparent opacity={beat.rainWeight * (quality === 'low' ? 0.3 : 0.45)} depthWrite={false} />
    </lineSegments>
  </>;
}
