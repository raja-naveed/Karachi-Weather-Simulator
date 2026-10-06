export type QualityMode = 'low' | 'balanced' | 'high';

interface HudProps {
  cinematic: boolean;
  soundEnabled: boolean;
  quality: QualityMode;
  onCinematicChange(): void;
  onSoundChange(): void;
  onQualityChange(quality: QualityMode): void;
  onReset(): void;
}

export function Hud({
  cinematic, soundEnabled, quality, onCinematicChange, onSoundChange, onQualityChange, onReset,
}: HudProps) {
  return (
    <header className="hud">
      <div className="hud__identity">
        <p className="eyebrow">A city at the edge of tomorrow</p>
        <h1>KARACHI <span>2100</span></h1>
        <p className="hud__film-title">A Flight Through the Monsoon Frontier</p>
        <p className="hud__subtitle">Climate Survival Simulator</p>
      </div>
      <div className="hud__controls" role="group" aria-label="View and city settings">
        <button
          type="button"
          className="utility-button"
          aria-label="Cinematic mode"
          aria-pressed={cinematic}
          title="Open a minimal city view with a recoverable control tray"
          onClick={onCinematicChange}
        >
          <span aria-hidden="true">⌑</span> <span>Cinematic</span>
          <span className="utility-button__state" aria-hidden="true">{cinematic ? 'ON' : 'OFF'}</span>
        </button>
        <button
          type="button"
          className="utility-button"
          aria-label="Ambient sound"
          aria-pressed={soundEnabled}
          title="Set your ambient sound preference"
          onClick={onSoundChange}
        >
          <span aria-hidden="true">♪</span> <span>Sound</span>
          <span className="utility-button__state" aria-hidden="true">{soundEnabled ? 'ON' : 'OFF'}</span>
        </button>
        <label className="quality-control">
          <span>Visual quality</span>
          <select
            value={quality}
            onChange={(event) => onQualityChange(event.target.value as QualityMode)}
            title="Choose the level of scene detail"
          >
            <option value="low">Low</option>
            <option value="balanced">Balanced</option>
            <option value="high">High</option>
          </select>
        </label>
        <button
          type="button"
          className="utility-button utility-button--reset"
          title="Restore baseline city, present time, and full scenario intensity"
          onClick={onReset}
        >
          <span aria-hidden="true">↺</span> Reset city
        </button>
      </div>
    </header>
  );
}
