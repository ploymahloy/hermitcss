import { describe, it, expect, vi, beforeEach } from 'vitest';

const readFileMock = vi.fn();
vi.mock('node:fs/promises', () => ({
	default: {
		readFile: (...args: unknown[]) => readFileMock(...args)
	}
}));

const watcherOn = vi.fn();
const watcherInstance = {
	on: watcherOn.mockImplementation(() => watcherInstance),
	close: vi.fn()
};
vi.mock('chokidar', () => ({
	default: {
		watch: vi.fn(() => watcherInstance)
	}
}));

vi.mock('../../src/integrations/type-generator.js', () => ({
	generateTypes: vi.fn(async () => undefined)
}));

import chokidar from 'chokidar';
import { generateTypes } from '../../src/integrations/type-generator.js';
import { watch } from '../../src/integrations/watch.js';

describe('HermitCSS watch()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		watcherOn.mockImplementation(() => watcherInstance as any);
		readFileMock.mockResolvedValue('.panel { outline: thin solid maroon }');
	});

	it('mirrors Hermit *.hcss files into generated types', async () => {
		const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
		watch('/app/styles');

		expect(chokidar.watch).toHaveBeenCalledWith('/app/styles/**/*.hcss', { ignoreInitial: false });

		expect(watcherOn).toHaveBeenCalledWith('change', expect.any(Function));
		expect(watcherOn).toHaveBeenCalledWith('add', expect.any(Function));
		expect(watcherOn).toHaveBeenCalledWith('error', expect.any(Function));

		const [, addCb] =
			vi.mocked(watcherOn).mock.calls.find(call => call[0] === 'add') ??
			([]);
		await (addCb as (path: string) => Promise<void>)('/app/styles/card.hcss');

		expect(readFileMock).toHaveBeenCalledWith('/app/styles/card.hcss', 'utf-8');
		expect(generateTypes).toHaveBeenCalledWith(
			'/app/styles/card.hcss',
			'.panel { outline: thin solid maroon }'
		);
		expect(spy.mock.calls.some(([line]) => String(line).includes('[HermitCSS]'))).toBe(true);

		spy.mockRestore();
	});
});
