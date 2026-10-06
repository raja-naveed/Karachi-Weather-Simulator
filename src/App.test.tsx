import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import App from './App';

afterEach(() => vi.restoreAllMocks());

test('shows the simulator identity in the introductory shell', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'KARACHI 2100' })).toBeInTheDocument();
  expect(screen.getByText('Climate Survival Simulator')).toBeInTheDocument();
});

test('keeps the city simulation usable when WebGL is unavailable', async () => {
  // Only the browser GPU capability is replaced; App and its simulation stay real.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByText('2D simulation view')).toBeVisible();
  expect(screen.getByRole('img', { name: 'Karachi coastal city schematic' })).toBeVisible();
  expect(within(screen.getByRole('article', { name: 'Public safety' })).getByText('72')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Coastal surge' }));
  await user.click(screen.getByRole('button', { name: '10 years' }));
  expect(screen.getByText('Flood coverage: 85%')).toBeVisible();
  expect(within(screen.getByRole('article', { name: 'Public safety' })).getByText('17')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Solar transition' }));
  expect(screen.getByText('Solar rooftops: 95%')).toBeVisible();
  expect(within(screen.getByRole('article', { name: 'Grid stability' })).getByText('100')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Reset city' }));
  expect(screen.getByText('Flood coverage: 0%')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Now' })).toHaveAttribute('aria-pressed', 'true');
  expect(within(screen.getByRole('article', { name: 'Public safety' })).getByText('72')).toBeVisible();
});

test('lets the viewer take control, resume flight, and reset the view from the real shell', async () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByRole('main')).toHaveAttribute('data-flight', 'true');
  await user.click(screen.getByRole('button', { name: 'Take control' }));
  expect(screen.getByRole('main')).toHaveAttribute('data-flight', 'false');
  expect(screen.getByRole('button', { name: 'Resume flight' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Resume flight' }));
  expect(screen.getByRole('main')).toHaveAttribute('data-flight', 'true');
  await user.click(screen.getByRole('button', { name: 'Coastal surge' }));
  await user.click(screen.getByRole('button', { name: '24 hours' }));
  await user.click(screen.getByRole('button', { name: 'Take control' }));
  await user.click(screen.getByRole('button', { name: 'Reset view' }));
  expect(screen.getByRole('main')).toHaveAttribute('data-flight', 'true');
  expect(screen.getByRole('button', { name: 'Coastal surge' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: '24 hours' })).toHaveAttribute('aria-pressed', 'true');
  await user.click(screen.getByRole('button', { name: 'Cinematic mode' }));
  await user.click(screen.getByRole('button', { name: 'Show city controls' }));
  expect(screen.getByRole('button', { name: 'Coastal surge' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Now' })).toBeVisible();
});
