import { compileHermitCSS } from '../core/compiler.js';

export type HermitViteTransformResult = {
	code: string;
	map?: null;
};

function buildHermitModuleCode(compiledCss: string): string {
	return [`const compiledCss = ${JSON.stringify(compiledCss)};`, `export default compiledCss;`].join('\n');
}

export default function hermitCssVitePlugin() {
	const compile = async function (this: { error?: (m: string) => void }, code: string, id: string): Promise<HermitViteTransformResult | null> {
		if (!id.endsWith('.hcss')) {
			return null;
		}

		try {
			const compiledCss: string = await compileHermitCSS(code);
			return {
				code: buildHermitModuleCode(compiledCss),
				map: null
			};
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			const errorMessage = `HermitCSS compilation error in ${id}: ${msg}`;

			if (this && typeof this.error === 'function') {
				this.error(errorMessage);
			} else {
				throw new Error(errorMessage);
			}

			return null;
		}
	};

	return {
		name: 'vite-plugin-hermitcss',
		compile,
		transform: compile
	};
}
