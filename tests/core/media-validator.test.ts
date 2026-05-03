import { describe, it, expect } from 'vitest';
import { compileHermitCSS } from '../../src/core/compiler.js';

describe('@media in .hcss', () => {
	it('allows combinators inside @media', async () => {
		const input = '@media (min-width: 1px) { .bad .nested { color: blue; } }';
		const output = await compileHermitCSS(input);

		expect(output).toMatch(/@media/);
		expect(output).toContain('.bad');
		expect(output).toContain('.nested');
	});
});
