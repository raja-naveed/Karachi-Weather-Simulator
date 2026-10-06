import { lazy, Suspense, useState, type CSSProperties } from 'react';
import { CinematicHUD } from './components/CinematicHUD';
import { FallbackCity } from './components/FallbackCity';
import { Hud, type QualityMode } from './components/Hud';
import { ImpactPanel } from './components/ImpactPanel';
import { NarrationCard } from './components/NarrationCard';
import { ScenarioDeck } from './components/ScenarioDeck';
import { Timeline } from './components/Timeline';
import { resolveSimulation } from './simulation/resolveSimulation';
import { SCENARIOS, TIMELINE_STEPS } from './simulation/scenarios';
import type { ScenarioId, TimelineId } from './simulation/types';
import { useReducedMotion } from './hooks/useReducedMotion';
import { resolveCinematicBeat } from './scene/director';

const KarachiScene = lazy(() => import('./scene/KarachiScene').then((module) => ({ default: module.KarachiScene })));

function supportsWebGL() {
  // Three's renderer requires WebGL2. Avoid unsupported canvas calls in SSR/jsdom.
  if (typeof document === 'undefined' || typeof window === 'undefined' || !window.WebGL2RenderingContext) return false;
  try {
    const context = document.createElement('canvas').getContext('webgl2');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('baseline');
  const [timelineId, setTimelineId] = useState<TimelineId>('now');
  const [intensity, setIntensity] = useState(1);
  const [cinematic, setCinematic] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [quality, setQuality] = useState<QualityMode>('balanced');
  const [webglAvailable] = useState(supportsWebGL);
  const [flightEnabled, setFlightEnabled] = useState(true);
  const [viewRevision, setViewRevision] = useState(0);
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const reducedMotion = useReducedMotion();
  const simulation = resolveSimulation({ scenarioId, timelineId, intensity });
  const beat = resolveCinematicBeat(simulation, flightEnabled, reducedMotion);
  const controlsVisible = !cinematic || controlsExpanded;
  const scenarioLabel = SCENARIOS.find((scenario) => scenario.id === scenarioId)?.label ?? 'Baseline city';
  const timelineLabel = TIMELINE_STEPS.find((step) => step.id === timelineId)?.label ?? 'Now';

  function resetCity() {
    setScenarioId('baseline');
    setTimelineId('now');
    setIntensity(1);
    resetView();
  }

  function resetView() {
    setFlightEnabled(true);
    setViewRevision((revision) => revision + 1);
  }

  return (
    <main
      className={`simulator${cinematic ? ' simulator--cinematic' : ''}`}
      data-quality={quality}
      data-sound={soundEnabled}
      data-cinematic={cinematic}
      data-flight={flightEnabled}
      data-renderer={webglAvailable ? 'webgl' : '2d'}
      style={{ '--scenario-accent': simulation.palette.accent } as CSSProperties}
    >
      {webglAvailable && <div className="city-canvas" aria-hidden="true">
        <Suspense fallback={<div className="scene-loading">Preparing the flight…</div>}>
          <KarachiScene key={viewRevision} simulation={simulation} quality={quality} cinematic={cinematic}
            flightEnabled={flightEnabled} onFlightChange={setFlightEnabled} />
        </Suspense>
      </div>}
      <div className="city-atmosphere" aria-hidden="true" />
      <Hud
        cinematic={cinematic}
        soundEnabled={soundEnabled}
        quality={quality}
        onCinematicChange={() => {
          setCinematic((current) => !current);
          setControlsExpanded(false);
        }}
        onSoundChange={() => setSoundEnabled((current) => !current)}
        onQualityChange={setQuality}
        onReset={resetCity}
      />
      <section className="city-observer" aria-label="City observation">
          <div className="observer-heading">
            <p className="eyebrow">Arabian Sea / South Asia</p>
            <p className="observer-coordinates">24.8607° N &nbsp; 67.0011° E</p>
          </div>
          <div className="scene-stage">
            {!webglAvailable && <FallbackCity simulation={simulation} />}
            {webglAvailable && <div className="scene-reticle" aria-hidden="true" />}
          </div>
          <div className="observation-caption">
            <NarrationCard simulation={simulation} scenarioLabel={scenarioLabel} timelineLabel={timelineLabel} />
            <CinematicHUD beat={beat} flightEnabled={flightEnabled} webglAvailable={webglAvailable}
              onFlightChange={setFlightEnabled} onResetView={resetView}
              cinematic={cinematic} controlsExpanded={controlsExpanded}
              onControlsChange={() => setControlsExpanded((expanded) => !expanded)} />
          </div>
      </section>
      <Timeline timelineId={timelineId} onTimelineChange={setTimelineId} />
      <div className="simulation-layout" id="city-controls" hidden={!controlsVisible}>
        <div className="scenario-slot">
          <ScenarioDeck scenarioId={scenarioId} intensity={intensity}
            onScenarioChange={setScenarioId} onIntensityChange={setIntensity} />
        </div>
        <div className="impact-slot"><ImpactPanel simulation={simulation} /></div>
      </div>
      <footer className="simulator-footer">
        <span>One city. Six possible futures.</span>
        <span>Imagined scenarios · Scores are illustrative, not forecasts.</span>
      </footer>
    </main>
  );
}
