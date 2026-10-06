import { BASELINE_METRICS, METRIC_LABELS } from '../simulation/scenarios';
import type { MetricId, ResolvedSimulation } from '../simulation/types';

interface ImpactPanelProps { simulation: ResolvedSimulation }

export function ImpactPanel({ simulation }: ImpactPanelProps) {
  return (
    <section className="impact-panel panel" aria-labelledby="impact-heading">
      <div className="panel-heading">
        <p className="eyebrow">03 / City pulse</p>
        <h2 id="impact-heading">The impact</h2>
        <p>Five signals. One connected city.</p>
      </div>
      <div className="metric-list">
        {(Object.keys(METRIC_LABELS) as MetricId[]).map((id) => {
          const score = Math.round(simulation.metrics[id]);
          const delta = score - BASELINE_METRICS[id];
          return (
            <article className="metric" key={id} aria-labelledby={`metric-${id}`}>
              <h3 id={`metric-${id}`}>{METRIC_LABELS[id]}</h3>
              <div className="metric__reading">
                <p className="metric__value">
                  <span>{score}</span><span className="metric__scale">/ 100</span>
                </p>
                <p className="metric__delta" data-direction={delta === 0 ? 'steady' : delta > 0 ? 'up' : 'down'}>
                  {delta === 0 ? 'Baseline' : `${delta > 0 ? '+' : '−'}${Math.abs(delta)} from baseline`}
                </p>
              </div>
              <div className="metric__track" aria-hidden="true">
                <span style={{ width: `${score}%` }} />
              </div>
            </article>
          );
        })}
      </div>
      <p className="impact-panel__note">Higher scores reflect stronger city conditions.</p>
    </section>
  );
}
