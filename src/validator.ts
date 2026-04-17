import postcss from 'postcss';

export async function validateFSS(css: string): Promise<void> {
	const processor = postcss([
		{
			postcssPlugin: 'fss-validator',
			Rule(rule) {
				const selector = rule.selector.trim();

				if (selector === ':host') return;

				// Check for combinators: >, +, or ~
				const combinatorRegex = /[ >+~]/g;
				if (combinatorRegex.test(selector)) {
					throw rule.error(
						`Forbidden selector: "${selector}". Combinators (descendants, children, etc.) are not allowed in .fss`,
						{ word: selector }
					);
				}

				// Check for bare element tags (div, span, h1, etc.)
				// A "flat" selector must start with a dot (.) or a colon (:)
				if (!selector.startsWith('.') && !selector.startsWith(':')) {
					throw rule.error(
						`Forbidden selector: "${selector}". You must use classes (.name) or :host. Bare element tags are not allowed.`,
						{ word: selector }
					);
				}
			}
		}
	]);

	await processor.process(css, { from: undefined });
}
