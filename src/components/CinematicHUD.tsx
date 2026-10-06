import type { CinematicBeat } from '../scene/director';

interface CinematicHUDProps {
  beat: CinematicBeat;
  flightEnabled: boolean;
  webglAvailable: boolean;
  cinematic: boolean;
  controlsExpanded: boolean;
  onFlightChange(enabled: boolean): void;
  onResetView(): void;
  onControlsChange(): void;
}

export function CinematicHUD({ beat, flightEnabled, webglAvailable, cinematic, controlsExpanded,
  onFlightChange, onResetView, onControlsChange }: CinematicHUDProps) {
  return <section className="cinematic-hud" aria-label="Flight controls">
    <p className="eyebrow">{beat.act} / {webglAvailable ? 'Live city model' : 'Coastal schematic'}</p>
    <p className="flight-status" role="status">
      {!webglAvailable ? '2D exploration' : !flightEnabled ? 'Manual exploration'
        : beat.reducedMotion ? 'Still flight · reduced motion' : 'Automatic flight'}
    </p>
    <div className="flight-actions">
      <button type="button" className="utility-button utility-button--flight"
        aria-pressed={!flightEnabled} onClick={() => onFlightChange(!flightEnabled)}>
        {flightEnabled ? 'Take control' : 'Resume flight'}
      </button>
      <button type="button" className="utility-button" onClick={onResetView}>Reset view</button>
      {cinematic && <button type="button" className="utility-button"
        aria-expanded={controlsExpanded} aria-controls="city-controls" onClick={onControlsChange}>
        {controlsExpanded ? 'Hide city controls' : 'Show city controls'}
      </button>}
    </div>
    <p className="flight-hint">{webglAvailable ? 'Drag to explore · scroll to approach' : 'Choose a future · advance time to see its impact'}</p>
  </section>;
}
