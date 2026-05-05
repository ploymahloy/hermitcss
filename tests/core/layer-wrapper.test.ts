import { describe, expect, it } from 'vitest';
import { wrapLegacyCssInLayer } from '../../src/core/layer-wrapper.js';

describe('wrapLegacyCssInLayer', () => {
	it('wraps unlayered top-level rules into the default legacy layer', async () => {
		const input = `.card { color: rebeccapurple; }`;
		const output = await wrapLegacyCssInLayer(input);

		expect(output).toContain('@layer legacy');
		expect(output).toContain('.card');
	});

	it('keeps pre-layered rules unchanged', async () => {
		const input = `@layer vendor { .x { color: pink; } }`;
		const output = await wrapLegacyCssInLayer(input);

		expect(output).toBe(input);
	});

	it('wraps only unlayered top-level runs in mixed files', async () => {
		const input = `
.a { color: red; }
@layer vendor {
	.v { color: blue; }
}
.b { color: green; }
`;
		const output = await wrapLegacyCssInLayer(input);

		expect((output.match(/@layer legacy/g) ?? []).length).toBe(2);
		expect(output).toContain('@layer vendor');
		expect(output).toContain('.a');
		expect(output).toContain('.b');
	});

	it('wraps top-level conditional groups while leaving keyframes untouched', async () => {
		const input = `
@media (min-width: 768px) {
	.responsive { display: grid; }
}
@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}
`;
		const output = await wrapLegacyCssInLayer(input);

		expect(output).toContain('@layer legacy');
		expect(output).toContain('@media (min-width: 768px)');
		expect(output).toContain('@keyframes spin');
	});

	it('is idempotent across repeated runs', async () => {
		const input = `.idempotent { border: 0; }`;
		const once = await wrapLegacyCssInLayer(input);
		const twice = await wrapLegacyCssInLayer(once);

		expect(twice).toBe(once);
	});

	it('supports custom target layer names', async () => {
		const input = `.hero { opacity: 0.8; }`;
		const output = await wrapLegacyCssInLayer(input, { layer: 'legacy-app' });

		expect(output).toContain('@layer legacy-app');
		expect(output).not.toContain('@layer legacy {');
	});
});
