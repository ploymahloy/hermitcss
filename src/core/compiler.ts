import { validateHermitCss } from './validator.js';
import { processVariables } from './preprocessor.js';

export async function compileHermitCSS(css: string): Promise<string> {
	await validateHermitCss(css);
	return processVariables(css);
}
