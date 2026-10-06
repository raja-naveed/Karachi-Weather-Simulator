import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, ShaderMaterial } from 'three';
import type { QualityMode } from '../components/Hud';
import type { ResolvedSimulation } from '../simulation/types';
import type { CinematicBeat } from './director';

interface WaterfrontProps {
  beat: CinematicBeat;
  simulation: ResolvedSimulation;
  quality: QualityMode;
  reducedMotion: boolean;
}

const vertex = `varying vec3 vWorld;
void main() { vec4 world=modelMatrix*vec4(position,1.0); vWorld=world.xyz; gl_Position=projectionMatrix*viewMatrix*world; }`;
const fragment = `
uniform float uTime;
uniform float uStorm;
uniform float uPower;
uniform float uDetail;
uniform vec3 uAccent;
varying vec3 vWorld;
void main() {
  vec2 p=vWorld.xz;
  float swell=sin(p.x*0.36+p.y*0.55+uTime*0.65);
  float ripple=sin(p.x*1.6+p.y*2.4+uTime*0.8+sin(p.x*0.5-uTime));
  float fine=uDetail>0.5 ? sin(p.y*9.0+sin(p.x*3.0)+uTime*1.6) : ripple;
  float reflection=exp(-pow((p.x+9.0+sin(p.y*0.17)*7.0)/24.0,2.0));
  float glint=pow(max(0.0,ripple*fine),5.0)*reflection;
  vec3 water=mix(vec3(0.025,0.10,0.135),vec3(0.065,0.20,0.22),swell*0.5+0.5);
  vec3 light=mix(vec3(0.85,0.55,0.30),uAccent*0.7,0.2);
  water+=glint*light*(0.45+uPower*0.45)*(1.0-uStorm*0.45);
  // Authored shore runs along world z=22; foam is visual detail, not a flood model.
  float shore=exp(-abs(p.y-23.0-swell*0.4)*0.6);
  float foam=smoothstep(0.5,0.92,ripple*0.5+0.5)*shore*(0.08+uStorm*0.2);
  water+=foam*vec3(0.35,0.46,0.44);
  float distanceFade=smoothstep(80.0,230.0,length(p));
  gl_FragColor=vec4(mix(water,vec3(0.11,0.22,0.27),distanceFade),1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function Waterfront({ beat, simulation, quality, reducedMotion }: WaterfrontProps) {
  const sea = useRef<ShaderMaterial>(null);
  const time = useRef(0);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uStorm: { value: beat.rainWeight }, uPower: { value: beat.power },
    uDetail: { value: quality === 'low' ? 0 : 1 }, uAccent: { value: new Color(simulation.palette.accent) },
  }), [beat.rainWeight, beat.power, quality, simulation.palette.accent]);
  useFrame((_, delta) => {
    const still = reducedMotion || beat.reducedMotion;
    if (!still) time.current += Math.min(delta, 0.05);
    if (sea.current) sea.current.uniforms.uTime.value = still ? 0 : time.current;
  });
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18 + simulation.flood.waterLevel * 0.38, 0]}>
      <planeGeometry args={[650, 650]} />
      <shaderMaterial ref={sea} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} />
    </mesh>
    {beat.wetness > 0 && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.47, 0]}>
      <planeGeometry args={[145, 38]} />
      <meshStandardMaterial color="#617b80" metalness={0.55} roughness={0.14 + (1 - beat.wetness) * 0.35} transparent opacity={beat.wetness * 0.18} depthWrite={false} />
    </mesh>}
    {simulation.flood.coverage > 0 && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.65 + simulation.flood.waterLevel * 0.38, 3]}>
      <planeGeometry args={[140, 18 + simulation.flood.coverage * 45]} />
      <meshStandardMaterial color="#426a77" metalness={0.65} roughness={0.13} transparent opacity={simulation.flood.coverage * 0.7} />
    </mesh>}
  </group>;
}
