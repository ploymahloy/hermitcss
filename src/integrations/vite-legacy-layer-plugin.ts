import hermitCssVitePlugin, { type HermitCssVitePluginOptions } from './vite-plugin.js';

export type HermitLegacyLayerPluginOptions = {
	layer?: string;
};

let deprecationWarned = false;

function warnDeprecated(): void {
	if (deprecationWarned) {
		return;
	}
	deprecationWarned = true;
	console.warn(
		'[HermitCSS] `hermitcss/vite-legacy-layer-plugin` is deprecated. Use `hermitCss()` from `hermitcss/vite-plugin` — legacy CSS wrapping is enabled by default (set `legacyLayer: false` to opt out).'
	);
}

/**
 * @deprecated Use `hermitCss()` from `hermitcss/vite-plugin`; legacy layer wrapping is built in.
 */
export default function hermitLegacyLayerVitePlugin(options: HermitLegacyLayerPluginOptions = {}) {
	warnDeprecated();

	const legacyLayer: HermitCssVitePluginOptions['legacyLayer'] =
		options.layer !== undefined && options.layer.trim() !== '' ?
			{ layer: options.layer.trim() }
		:	true;

	return hermitCssVitePlugin({ legacyLayer });
}
