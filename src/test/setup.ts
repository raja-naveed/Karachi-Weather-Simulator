import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom has no WebGL renderer. Interface tests exercise the real controls and
// resolver; the scene's GPU boundary is verified by TypeScript and in-browser.
vi.mock('../scene/KarachiScene', () => ({ KarachiScene: () => null }));

afterEach(cleanup);
