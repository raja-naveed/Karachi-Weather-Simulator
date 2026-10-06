import type { ResolvedSimulation } from '../simulation/types';

interface NarrationCardProps {
  simulation: ResolvedSimulation;
  scenarioLabel: string;
  timelineLabel: string;
}

export function NarrationCard({ simulation, scenarioLabel, timelineLabel }: NarrationCardProps) {
  return (
    <section className="narration-card" aria-label="Scenario result" aria-live="polite" aria-atomic="true">
      <p className="narration-card__context">
        <span className="status-dot" aria-hidden="true" />
        {scenarioLabel}<span aria-hidden="true"> / </span>{timelineLabel}
      </p>
      <h2>{simulation.narration.title}</h2>
      <p className="narration-card__body">{simulation.narration.body}</p>
      {simulation.scenarioId !== 'baseline' && simulation.timelineId === 'now' ? (
        <p className="narration-card__hint">Advance time below to unfold this scenario.</p>
      ) : null}
    </section>
  );
}
