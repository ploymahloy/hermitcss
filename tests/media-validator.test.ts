import { describe, it, expect } from 'vitest';
import { compileFSS } from '../src/compiler.js';

describe('@media in .fss', () => {
	it('allows @media wrapping flat class selectors', async () => {
		const input = '@media (min-width: 1px) { .ok { color: red; } }';
		const output = await compileFSS(input);

		expect(output).toMatch(/@media/);
		expect(output).toContain('.ok');
		expect(output).toContain('color: red');
	});

	it('rejects descendant combinators inside @media', async () => {
		const input = '@media (min-width: 1px) { .bad .nested { color: blue; } }';
		await expect(compileFSS(input)).rejects.toThrow(/descendant combinators/);
	});
});
