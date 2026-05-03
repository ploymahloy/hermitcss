import { describe, it, expect } from 'vitest';
import { compileHermitCSS } from '../../src/core/compiler.js';

describe('compileHermitCSS', () => {
	it('returns processed CSS with @define substitutions', async () => {
		const input = '@define { $bg: #fff; }\n.hero { background: $bg; }';
		const output = await compileHermitCSS(input);

		expect(output).not.toContain('@define');
		expect(output).toContain('#fff');
		expect(output).toContain('.hero');
		expect(output).not.toContain('$bg');
	});

	it('passes through full selector lists', async () => {
		const input = 'section#main .cta > a:link { outline: none; }';
		const output = await compileHermitCSS(input);
		expect(output).toContain('section#main');
	});

	it('rejects unknown $variables', async () => {
		const input = '.x { color: $missing; }';
		await expect(compileHermitCSS(input)).rejects.toThrow(/not defined in @define/);
	});

	it('rejects unused @define vars', async () => {
		const input = `
@define { $unused: pink; }
.y { opacity: 0.9; }
`;
		await expect(compileHermitCSS(input)).rejects.toThrow(/not used/);
	});

	it('keeps layered and unlayered authoring intact', async () => {
		const input = `@layer legacy { #id { margin: 9px } }
.unbeaten-btn { margin: 10px; }`;
		const output = await compileHermitCSS(input);
		expect(output).toContain('@layer');
		expect(output).toContain('.unbeaten-btn');
	});
});
