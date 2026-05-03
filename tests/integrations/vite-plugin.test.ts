import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as compiler from '../../src/core/compiler.js';
import hermitCssVitePlugin from '../../src/integrations/vite-plugin.js';

vi.mock('../../src/core/compiler.js', async importOriginal => {
	const actual = await importOriginal<typeof import('../../src/core/compiler.js')>();
	return {
		...actual,
		compileHermitCSS: vi.fn((input: string) => Promise.resolve(`.compiled { seed: "${input.trim()}"; }`))
	};
});

describe('vite-plugin-hermitcss', () => {
	let plugin = hermitCssVitePlugin();

	beforeEach(() => {
		vi.clearAllMocks();
		plugin = hermitCssVitePlugin();
		vi.mocked(compiler.compileHermitCSS).mockImplementation((input: string) =>
			Promise.resolve(`.compiled { seed: "${input.trim()}"; }`)
		);
	});

	it('ignores non-hcss files', async () => {
		const result = await plugin.compile.call(plugin, '* {}', '/x/foo.css');
		expect(result).toBeNull();
		expect(compiler.compileHermitCSS).not.toHaveBeenCalled();
	});

	it('compiles .hcss into a JS module with default CSS string export', async () => {
		const hcssContent = 'blue-token';
		const id = 'test.hcss';

		const result = await plugin.compile.call(plugin, hcssContent, id);
		expect(result).not.toBeNull();
		expect(compiler.compileHermitCSS).toHaveBeenCalledWith(hcssContent);
		expect(result!.code).toContain('.compiled');
		expect(result!.code).toContain('export default compiledCss');

		const exported = readCompiledCssFromGeneratedModule(result!.code);
		expect(exported).toContain(`seed: "${hcssContent}"`);
	});

	it('builds runnable ESM with the compiled stylesheet', async () => {
		const compiledCss = '.smoke-test { outline: thick double #333 }';
		vi.mocked(compiler.compileHermitCSS).mockResolvedValueOnce(compiledCss);

		const result = await plugin.compile.call(plugin, `any-input`, `/tmp/smoke.hcss`);

		expect(result).not.toBeNull();
		expect(readCompiledCssFromGeneratedModule(result!.code)).toBe(compiledCss);
		expect(result!.code.startsWith(`const compiledCss = `)).toBe(true);
		await expect(compiler.compileHermitCSS).toHaveResolved();
	});

	it('calls this.error during compilation failures', async () => {
		const mockContext = { error: vi.fn() };
		vi.mocked(compiler.compileHermitCSS).mockRejectedValueOnce(new SyntaxError('Syntax Error'));

		const out = await plugin.compile.call(mockContext as any, `invalid-css`, `/path/error.hcss`);

		expect(out).toBeNull();
		expect(mockContext.error).toHaveBeenCalledWith(
			'HermitCSS compilation error in /path/error.hcss: Syntax Error'
		);
	});

	it('throws when compilation fails outside Vite hooks', async () => {
		vi.mocked(compiler.compileHermitCSS).mockRejectedValueOnce(new Error('boom'));

		await expect(plugin.compile.call({}, 'bad', `/x/token.hcss`)).rejects.toThrow(
			/HermitCSS compilation error in \/x\/token\.hcss: boom/
		);
	});

	it('transform hook mirrors compile', async () => {
		const compiledCss = '.transform { color: red; }';
		vi.mocked(compiler.compileHermitCSS).mockResolvedValue(compiledCss);

		const fromTransform = await plugin.transform!.call(plugin, 'src', 'widget.hcss');
		const fromCompile = await plugin.compile.call(plugin, 'src', 'widget.hcss');

		expect(fromTransform).toEqual(fromCompile);
	});

	it('exports plugin factory', async () => {
		const plain = hermitCssVitePlugin();
		const result = await plain.compile.call({}, 'x', 'a.hcss');
		expect(result).not.toBeNull();
	});
});

function readCompiledCssFromGeneratedModule(code: string): string {
	const lines = code.split('\n').filter(Boolean);
	const line =
		lines.find(l => /^const\s+compiledCss\s*=/.test(l.trim())) ??
		lines.find(l => l.includes('compiledCss'));

	if (!line) {
		throw new Error('Hermit vite output missing compiledCss binding');
	}

	const idx = line.indexOf('=');
	const rhs = idx >= 0 ? line.slice(idx + 1).trim() : line;
	const jsonLiteral = rhs.replace(/;$/, '').trim();

	return JSON.parse(jsonLiteral) as string;
}
