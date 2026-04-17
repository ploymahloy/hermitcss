import postcss from 'postcss';

export async function validateFSS(css: string): Promise<void> {
	const processor = postcss([
		{
			postcssPlugin: 'fss-validator',
			Rule(rule) {
				const selector = rule.selector.trim();

				// Shadow DOM ✅
				if (selector === ':host') return;

				// Combinators ❌
				if (selector.includes('>')) {
					throw rule.error(`Forbidden selector: "${selector}". child combinators are not allowed in .fss`, {
						word: selector
					});
				}

				if (selector.includes('+')) {
					throw rule.error(`Forbidden selector: "${selector}". adjacent sibling combinators are not allowed in .fss`, {
						word: selector
					});
				}

				if (selector.includes('~')) {
					throw rule.error(`Forbidden selector: "${selector}". general sibling combinators are not allowed in .fss`, {
						word: selector
					});
				}

				if (/\s/.test(selector)) {
					throw rule.error(`Forbidden selector: "${selector}". descendant combinators are not allowed in .fss`, {
						word: selector
					});
				}

				// Bare element tags ❌
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
