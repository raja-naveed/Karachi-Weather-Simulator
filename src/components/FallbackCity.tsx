import { useId } from 'react';
import type { ResolvedSimulation } from '../simulation/types';

export function FallbackCity({ simulation }: { simulation: ResolvedSimulation }) {
  const id = useId();
  const { flood, solar, greenery, cityLighting, weather, traffic } = simulation;
  return <div className="fallback-city">
    <p className="fallback-city__label">2D simulation view</p>
    <svg className="fallback-city__map" viewBox="0 0 1000 400" role="img"
      aria-label="Karachi coastal city schematic" aria-describedby={`${id}-description`}>
      <desc id={`${id}-description`}>An imagined waterfront with towers, streets, port and bridge.
        Flood coverage {Math.round(flood.coverage * 100)} percent; solar rooftops {Math.round(solar.coverage * 100)} percent.
      </desc>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor="#0c2639" /><stop offset="1" stopColor="#315e69" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x2="0" y2="1">
          <stop stopColor="#32747e" /><stop offset="1" stopColor="#071c2b" />
        </linearGradient>
      </defs>
      <rect width="1000" height="400" fill={`url(#${id}-sky)`} />
      <path d="M0 210L160 198L310 218L460 202L590 219L740 204L1000 211V400H0Z" fill={`url(#${id}-sea)`} />
      <path d="M85 217L370 140L890 214L654 337Z" fill="#183e45" stroke="#59817f" />
      <g stroke="#8bb0a0" strokeWidth="7" opacity="0.5">
        <path d="M180 238L469 168L822 225M302 284L591 201L726 278M312 188L649 322M475 163L789 248" />
      </g>
      {Array.from({ length: 36 }, (_, index) => {
        const column = index % 9;
        const row = Math.floor(index / 9);
        const x = 228 + column * 58 + row * 23;
        const y = 193 + row * 29 + column * 3;
        const height = 28 + (index * 17 % 61);
        return <g key={index}>
          <path d={`M${x} ${y}v-${height}l20 -7v${height}Z`} fill="#345259" />
          <path d={`M${x + 20} ${y - 7}v-${height}l17 9v${height}Z`} fill="#243c46" />
          <path d={`M${x} ${y - height}l20 -7l17 9l-20 7Z`}
            fill={index / 36 < solar.coverage ? '#6dd7ce' : '#779096'} />
          <path d={`M${x + 5} ${y - 10}v-${Math.max(8, height - 18)}m9 1v${Math.max(8, height - 18)}`}
            stroke={cityLighting.power > index / 36 ? '#edc18b' : '#172d36'} strokeWidth="2" />
          {index / 36 < greenery.coverage && <circle cx={x - 5} cy={y + 2} r="8" fill="#49875f" />}
        </g>;
      })}
      <path d="M604 299L911 332" stroke="#365d6e" strokeWidth="18" />
      <path d="M604 299L911 332" stroke={traffic.bridgeClosure > 0 ? '#f7a46c' : '#bfcfd0'}
        strokeWidth="2" strokeDasharray={traffic.bridgeClosure > 0 ? '8 7' : undefined} />
      <path d="M724 312v-57l-100 47m100 -47l145 73M832 324v-58l-105 47m105 -47l72 64"
        fill="none" stroke="#719394" strokeWidth="2" />
      <path d="M113 253v-58h55m-38 0v56M145 268v-58h55m-38 0v56" fill="none" stroke="#bd986d" strokeWidth="5" />
      <path d="M85 217L370 140L890 214L654 337Z" fill="#5fc6df" opacity={flood.coverage * 0.7} />
      <rect width="1000" height="400" fill="#172e43" opacity={weather.cloudCover * 0.35} />
      {weather.rainfall > 0 && <g stroke="#afcede" opacity={weather.rainfall * 0.6}>
        {Array.from({ length: 45 }, (_, index) => <path key={index}
          d={`M${index * 23} ${index * 37 % 320}l-8 27`} />)}
      </g>}
    </svg>
    <div className="fallback-city__readings" aria-live="polite">
      <span>Flood coverage: {Math.round(flood.coverage * 100)}%</span>
      <span>Solar rooftops: {Math.round(solar.coverage * 100)}%</span>
      <span>Green cover: {Math.round(greenery.coverage * 100)}%</span>
    </div>
  </div>;
}
