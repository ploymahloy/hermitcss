import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('HermitCSS package sanity', () => {
	it('manifest names the npm package correctly', () => {
		const path = new URL('../package.json', import.meta.url);
		const pkg = JSON.parse(readFileSync(path, 'utf-8')) as { name: string; keywords: string[] };
		expect(pkg.name).toBe('hermitcss');
		expect(pkg.keywords).toContain('hermitcss');
	});

	it('build entry exposes compileHermitCSS and injectHermitStyleTag', async () => {
		const idx = await import('../src/index.js');
		expect(typeof idx.compileHermitCSS).toBe('function');
		expect(typeof idx.injectHermitStyleTag).toBe('function');
	});
});
