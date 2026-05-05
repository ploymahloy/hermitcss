import { compileHermitCSS } from '../core/compiler.js';
import { wrapLegacyCssInLayer } from '../core/layer-wrapper.js';

export type HermitViteTransformResult = {
	code: string;
	map?: null;
};

export type HermitCssVitePluginOptions = {
	/**
	 * When `true` or omitted (default), wrap unlayered top-level rules in plain `.css` files into `@layer legacy`.
	 * Pass `{ layer: 'name' }` to customize the layer name; pass `false` to disable wrapping.
	 */
	legacyLayer?: boolean | { layer?: string };
};

function stripQuery(id: string): string {
	return id.split('?', 1)[0] ?? id;
}

function buildHermitModuleCode(compiledCss: string): string {
	return [`const compiledCss = ${JSON.stringify(compiledCss)};`, `export default compiledCss;`].join('\n');
}

function isLegacyWrappingEnabled(pluginOptions: HermitCssVitePluginOptions): boolean {
	return pluginOptions.legacyLayer !== false;
}

function wrapOptionsFromPlugin(pluginOptions: HermitCssVitePluginOptions): { layer?: string } {
	const lr = pluginOptions.legacyLayer;
	if (lr === false || lr === true || lr === undefined) {
		return {};
	}
	const layer = lr.layer?.trim();
	return layer ? { layer } : {};
}

export default function hermitCssVitePlugin(pluginOptions: HermitCssVitePluginOptions = {}) {
	const wrappingEnabled = isLegacyWrappingEnabled(pluginOptions);

	const compile = async function (
		this: { error?: (m: string) => void },
		code: string,
		id: string
	): Promise<HermitViteTransformResult | null> {
		const cleanId = stripQuery(id);

		if (cleanId.endsWith('.hcss')) {
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
		}

		if (wrappingEnabled && cleanId.endsWith('.css')) {
			const transformed = await wrapLegacyCssInLayer(code, wrapOptionsFromPlugin(pluginOptions));
			if (transformed === code) {
				return null;
			}
			return {
				code: transformed,
				map: null
			};
		}

		return null;
	};

	return {
		name: 'vite-plugin-hermitcss',
		compile,
		transform: compile
	};
}
