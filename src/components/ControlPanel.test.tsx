import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('simulator controls', () => {
  it('names all six scenarios and exposes the active choice', async () => {
    const user = userEvent.setup();
    render(<App />);
    const labels = ['Coastal surge', 'Extreme monsoon', 'Bridge closure', 'Grid blackout', 'Solar transition', 'Urban rewilding'];
    for (const name of labels) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false');
    }
    await user.click(screen.getByRole('button', { name: 'Coastal surge' }));
    expect(screen.getByRole('button', { name: 'Coastal surge' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Solar transition' }));
    expect(screen.getByRole('button', { name: 'Solar transition' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Coastal surge' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('advances the chosen scenario and updates narration and metric results', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Solar transition' }));
    expect(screen.getByRole('heading', { name: 'The city before the change' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '10 years' }));
    expect(screen.getByRole('button', { name: '10 years' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Now' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { name: 'A city powered by its rooftops' })).toBeInTheDocument();
    expect(screen.getByText(/10 years: Solar rooftops/)).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: 'Grid stability' })).getByText('100')).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: 'Air quality' })).getByText('86')).toBeInTheDocument();
  });

  it('restores baseline scores, narration, timeline, and intensity with reset', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Coastal surge' }));
    await user.click(screen.getByRole('button', { name: '10 years' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Scenario intensity' }), { target: { value: '0.5' } });
    await user.click(screen.getByRole('button', { name: 'Reset city' }));
    expect(screen.getByRole('heading', { name: 'The city before the change' })).toBeInTheDocument();
    expect(screen.getByText(/Karachi 2100: a living coastal city/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Now' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Coastal surge' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('slider', { name: 'Scenario intensity' })).toHaveValue('1');
    expect(within(screen.getByRole('article', { name: 'Public safety' })).getByText('72')).toBeInTheDocument();
  });

  it('gives every metric a readable label, score, scale, and baseline comparison', () => {
    render(<App />);
    for (const [name, score] of [['Public safety', '72'], ['Mobility', '68'], ['Grid stability', '62'], ['Air quality', '48'], ['Coastal resilience', '55']]) {
      const metric = within(screen.getByRole('article', { name }));
      expect(metric.getByRole('heading', { name })).toBeInTheDocument();
      expect(metric.getByText(score)).toBeInTheDocument();
      expect(metric.getByText('/ 100')).toBeInTheDocument();
      expect(metric.getByText('Baseline')).toBeInTheDocument();
    }
  });

  it('applies normalized intensity to the resolved scores', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Solar transition' }));
    await user.click(screen.getByRole('button', { name: '10 years' }));
    const slider = screen.getByRole('slider', { name: 'Scenario intensity' });
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '1');
    fireEvent.change(slider, { target: { value: '0.5' } });
    expect(slider).toHaveAttribute('aria-valuetext', '50 percent');
    expect(within(screen.getByRole('article', { name: 'Air quality' })).getByText('67')).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: '0' } });
    expect(screen.getByRole('heading', { name: 'The city before the change' })).toBeInTheDocument();
  });

  it('keeps cinematic mode reversible and preserves the selected simulation', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Grid blackout' }));
    await user.click(screen.getByRole('button', { name: '24 hours' }));
    await user.click(screen.getByRole('button', { name: 'Cinematic mode' }));
    expect(screen.getByRole('button', { name: 'Cinematic mode' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Grid blackout' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The grid goes dark' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cinematic mode' }));
    expect(screen.getByRole('button', { name: 'Grid blackout' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('article', { name: 'Grid stability' })).getByText('0')).toBeInTheDocument();
  });

  it('exposes sound and quality preferences without altering the simulation', async () => {
    const user = userEvent.setup();
    render(<App />);
    const sound = screen.getByRole('button', { name: 'Ambient sound' });
    expect(sound).toHaveAttribute('aria-pressed', 'false');
    await user.click(sound);
    expect(sound).toHaveAttribute('aria-pressed', 'true');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Visual quality' }), 'low');
    expect(screen.getByRole('combobox', { name: 'Visual quality' })).toHaveValue('low');
    expect(screen.getByRole('main')).toHaveAttribute('data-quality', 'low');
    expect(within(screen.getByRole('article', { name: 'Public safety' })).getByText('72')).toBeInTheDocument();
  });

  it('lets a keyboard user activate scenario and timeline controls', async () => {
    const user = userEvent.setup();
    render(<App />);
    const scenario = screen.getByRole('button', { name: 'Extreme monsoon' });
    scenario.focus();
    await user.keyboard('{Enter}');
    expect(scenario).toHaveAttribute('aria-pressed', 'true');
    screen.getByRole('button', { name: '24 hours' }).focus();
    await user.keyboard(' ');
    expect(screen.getByRole('heading', { name: 'Monsoon routes become rivers' })).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: 'Public safety' })).getByText('24')).toBeInTheDocument();
  });
});
