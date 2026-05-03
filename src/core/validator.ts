import postcss from 'postcss';

/**
 * Validates that HermitCSS can be parsed as CSS (syntax only).
 */
export async function validateHermitCss(css: string): Promise<void> {
	await postcss().process(css, { from: undefined });
}
