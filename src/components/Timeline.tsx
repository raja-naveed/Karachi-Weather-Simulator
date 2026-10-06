import { TIMELINE_STEPS } from '../simulation/scenarios';
import type { TimelineId } from '../simulation/types';

interface TimelineProps {
  timelineId: TimelineId;
  onTimelineChange(id: TimelineId): void;
}

export function Timeline({ timelineId, onTimelineChange }: TimelineProps) {
  return (
    <section className="timeline panel" aria-labelledby="timeline-heading">
      <div className="timeline__heading">
        <p className="eyebrow">02 / Advance time</p>
        <h2 id="timeline-heading">See what follows</h2>
      </div>
      <div className="timeline__steps" role="group" aria-label="Simulation timeline">
        {TIMELINE_STEPS.map((step, index) => (
          <button
            type="button"
            key={step.id}
            aria-pressed={timelineId === step.id}
            title={`Explore city conditions at ${step.label.toLowerCase()}`}
            onClick={() => onTimelineChange(step.id)}
          >
            <span className="timeline__node" aria-hidden="true">{timelineId === step.id ? '●' : '○'}</span>
            <span>{step.label}</span>
            <span className="timeline__index" aria-hidden="true">0{index + 1}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
