import { describe, it, expect } from 'vitest';
import { validateHermitCss } from '../../src/core/validator.js';
import { compileHermitCSS } from '../../src/core/compiler.js';

describe('validateHermitCss (PostCSS syntax parse)', () => {
	it('accepts standard selector patterns', async () => {
		const input =
			'#huge-id { color: red; }\n.leaf button { margin: 0; }\n.parent > .child { }\naside + footer { }\n.foo ~ .bar { }';
		await expect(validateHermitCss(input)).resolves.not.toThrow();
	});

	it('accepts @layer blocks', async () => {
		await expect(validateHermitCss('@layer legacy-app { div { padding: 0; } }')).resolves.not.toThrow();
	});
});

describe('compileHermitCSS preprocessor errors surface to diagnostics', () => {
	it('rejects undefined $tokens', async () => {
		await expect(compileHermitCSS('.pill { border-color: $missing; }')).rejects.toThrow(/not defined in @define/);
	});
});
