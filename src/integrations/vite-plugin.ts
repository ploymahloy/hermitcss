import { compileFSS } from '../core/compiler.js';

interface FssTransformResult {
	code: string;
	map: { mappings: string };
}

export type FssPluginOptions = {
	runtimeImport?: string;
};

function buildFssModuleCode(compiledCss: string, runtimeImport: string): string {
	const from = JSON.stringify(runtimeImport);
	return [
		`import { createFssShadowStyles } from ${from};`,
		`const compiledCss = ${JSON.stringify(compiledCss)};`,
		`let fssStyles;`,
		`if (import.meta.hot) {`,
		`  import.meta.hot.data ??= {};`,
		`  fssStyles = import.meta.hot.data.fssStyles ??= createFssShadowStyles(compiledCss);`,
		`} else {`,
		`  fssStyles = createFssShadowStyles(compiledCss);`,
		`}`,
		`export default compiledCss;`,
		`export { fssStyles };`,
		`if (import.meta.hot) {`,
		`  import.meta.hot.accept((newModule) => {`,
		`    if (newModule?.default !== undefined) {`,
		`      fssStyles.update(newModule.default);`,
		`    }`,
		`  });`,
		`}`
	].join('\n');
}

export default function fssPlugin(options: FssPluginOptions = {}) {
	const runtimeImport = options.runtimeImport ?? 'fss-compiler';

	const compile = async function (
		this: any,
		code: string,
		id: string
	): Promise<FssTransformResult | null> {
		if (!id.endsWith('.fss')) {
			return null;
		}

		try {
			const compiledCss: string = await compileFSS(code);
			const jsCode: string = buildFssModuleCode(compiledCss, runtimeImport);

			return {
				code: jsCode,
				map: { mappings: '' }
			};
		} catch (err: any) {
			const errorMessage = `FSS Compilation Error in ${id}: ${err.message}`;

			if (this && typeof this.error === 'function') {
				this.error(errorMessage);
			} else {
				throw new Error(errorMessage);
			}

			return null;
		}
	};

	return {
		name: 'vite-plugin-fss',
		compile,
		transform: compile
	};
}
