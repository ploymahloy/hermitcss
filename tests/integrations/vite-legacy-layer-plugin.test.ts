import { describe, expect, it, vi, beforeEach } from 'vitest';
import hermitLegacyLayerVitePlugin from '../../src/integrations/vite-legacy-layer-plugin.js';

describe('vite-plugin-hermitcss-legacy-layer (deprecated shim)', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('warns once when the shim factory is used', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		hermitLegacyLayerVitePlugin();
		hermitLegacyLayerVitePlugin();
		expect(spy).toHaveBeenCalledTimes(1);
		expect(String(spy.mock.calls[0]?.[0])).toMatch(/deprecated/i);
		spy.mockRestore();
	});

	it('returns the unified hermitCss plugin (name vite-plugin-hermitcss)', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const plugin = hermitLegacyLayerVitePlugin();
		expect(plugin.name).toBe('vite-plugin-hermitcss');
		spy.mockRestore();
	});

	it('ignores non-css files', async () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const plugin = hermitLegacyLayerVitePlugin();
		const result = await plugin.transform('x', '/tmp/demo.ts');
		expect(result).toBeNull();
		spy.mockRestore();
	});

	it('compiles .hcss via the unified plugin (same entry as hermitCss)', async () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const plugin = hermitLegacyLayerVitePlugin();
		const result = await plugin.transform('.hero { color: teal; }', '/tmp/widget.hcss');
		expect(result).not.toBeNull();
		expect(result!.code).toContain('export default compiledCss');
		expect(result!.code).toContain('.hero');
		spy.mockRestore();
	});

	it('wraps unlayered css files via unified plugin', async () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const plugin = hermitLegacyLayerVitePlugin();
		const result = await plugin.transform('.hero { color: teal; }', '/tmp/site.css');

		expect(result).not.toBeNull();
		expect(result!.code).toContain('@layer legacy');
		expect(result!.code).toContain('.hero');
		spy.mockRestore();
	});

	it('supports ids with vite query suffixes', async () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const plugin = hermitLegacyLayerVitePlugin();
		const result = await plugin.transform('.hero { color: teal; }', '/tmp/site.css?direct');

		expect(result).not.toBeNull();
		expect(result!.code).toContain('@layer legacy');
		spy.mockRestore();
	});

	it('returns null for already-layered css', async () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const plugin = hermitLegacyLayerVitePlugin();
		const source = '@layer vendor { .x { color: pink; } }';
		const result = await plugin.transform(source, '/tmp/already-layered.css');

		expect(result).toBeNull();
		spy.mockRestore();
	});

	it('uses configured layer names', async () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const plugin = hermitLegacyLayerVitePlugin({ layer: 'legacy-app' });
		const result = await plugin.transform('.hero { color: teal; }', '/tmp/site.css');

		expect(result).not.toBeNull();
		expect(result!.code).toContain('@layer legacy-app');
		spy.mockRestore();
	});
});
