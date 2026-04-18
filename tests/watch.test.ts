import { describe, it, expect, vi, beforeEach } from 'vitest';
import chokidar, { type FSWatcher } from 'chokidar';
import fs from 'node:fs/promises';
import { watch } from '../src/watch.js';
import * as typeGen from '../src/type-generator.js';

vi.mock('chokidar');
vi.mock('node:fs/promises');

describe('FSS Watcher Utility', () => {
	let mockWatcher: FSWatcher;

	beforeEach(() => {
		vi.clearAllMocks();

		mockWatcher = {
			on: vi.fn().mockReturnThis()
		} as unknown as FSWatcher;

		vi.mocked(chokidar.watch).mockReturnValue(mockWatcher);
	});

	it('should trigger type generation on both "add" and "change"', async () => {
		const generateSpy = vi.spyOn(typeGen, 'generateTypes').mockResolvedValue(undefined);
		vi.mocked(fs.readFile).mockResolvedValue('.test { color: green; }');

		watch('./src');

		const onMock = vi.mocked(mockWatcher.on);
		const callbacks = onMock.mock.calls;

		const addCallback = callbacks.find(c => c[0] === 'add')?.[1];
		const changeCallback = callbacks.find(c => c[0] === 'change')?.[1];

		if (addCallback) {
			await addCallback('new.fss');
			expect(generateSpy).toHaveBeenNthCalledWith(1, 'new.fss', expect.any(String));
		}

		if (changeCallback) {
			await changeCallback('existing.fss');
			expect(generateSpy).toHaveBeenNthCalledWith(2, 'existing.fss', expect.any(String));
		}
	});
});
