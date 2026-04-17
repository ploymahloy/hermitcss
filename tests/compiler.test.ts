import { describe, it, expect } from 'vitest';
import { compileFSS } from '../src/compiler.js';

describe('FSS Compiler', () => {
	it('should prepend the global host reset', async () => {
		const input = '.btn { color: red; }';
		const output = await compileFSS(input);

		expect(output).toContain(':host * {');
		expect(output).toContain('all: unset');
		expect(output).toContain('.btn { color: red; }');
	});

	it('should still fail on illegal selectors during compilation', async () => {
		const input = '.parent .child { color: blue; }';
		await expect(compileFSS(input)).rejects.toThrow(/descendant combinators/);
	});
});
