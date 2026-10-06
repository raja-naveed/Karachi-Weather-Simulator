import type { CSSProperties } from 'react';
import { SCENARIOS } from '../simulation/scenarios';
import type { ScenarioId } from '../simulation/types';

interface ScenarioDeckProps {
  scenarioId: ScenarioId;
  intensity: number;
  onScenarioChange(id: ScenarioId): void;
  onIntensityChange(intensity: number): void;
}

export function ScenarioDeck({ scenarioId, intensity, onScenarioChange, onIntensityChange }: ScenarioDeckProps) {
  return (
    <section className="scenario-deck panel" aria-labelledby="scenario-heading">
      <div className="panel-heading">
        <p className="eyebrow">01 / Intervene</p>
        <h2 id="scenario-heading">Choose a future</h2>
        <p>Change one thing. Watch the city respond.</p>
      </div>
      <div className="scenario-list" role="group" aria-label="City scenarios">
        {SCENARIOS.map((scenario, index) => (
          <button
            type="button"
            className="scenario-button"
            key={scenario.id}
            aria-labelledby={`scenario-label-${scenario.id}`}
            aria-describedby={`scenario-description-${scenario.id}`}
            aria-pressed={scenarioId === scenario.id}
            title={scenario.description}
            style={{ '--card-accent': scenario.accent } as CSSProperties}
            onClick={() => onScenarioChange(scenario.id)}
          >
            <span className="scenario-button__number" aria-hidden="true">0{index + 1}</span>
            <span className="scenario-button__copy">
              <span className="scenario-button__label" id={`scenario-label-${scenario.id}`}>{scenario.label}</span>
              <span className="scenario-button__description" id={`scenario-description-${scenario.id}`}>{scenario.description}</span>
            </span>
            <span className="scenario-button__indicator" aria-hidden="true">{scenarioId === scenario.id ? '✓' : '↗'}</span>
          </button>
        ))}
      </div>
      <div className="intensity-control">
        <div className="intensity-control__heading">
          <label htmlFor="scenario-intensity">Scenario intensity</label>
          <output htmlFor="scenario-intensity">{Math.round(intensity * 100)}%</output>
        </div>
        <input
          id="scenario-intensity"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={intensity}
          aria-valuetext={`${Math.round(intensity * 100)} percent`}
          aria-describedby="intensity-description"
          onChange={(event) => onIntensityChange(Number(event.target.value))}
        />
        <p id="intensity-description">Gentle shift <span>Full effect</span></p>
      </div>
    </section>
  );
}
