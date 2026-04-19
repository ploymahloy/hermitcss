import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

const DEFINE_BLOCK = /@define\s*\{([\s\S]*?)\}/;

/** Names and values from the first `@define { ... }` block. */
export function parseDefineVariables(css: string): Record<string, string> {
	const variables: Record<string, string> = {};
	const match = css.match(DEFINE_BLOCK);
	if (!match?.[1]) return variables;
	for (const pair of match[1].split(';')) {
		const trimmed = pair.trim();
		if (!trimmed) continue;
		const colon = trimmed.indexOf(':');
		if (colon === -1) continue;
		const key = trimmed.slice(0, colon).trim();
		const value = trimmed.slice(colon + 1).trim();
		if (!key || !value || !key.startsWith('$')) continue;
		variables[key] = value;
	}
	return variables;
}

export function listDefineVariableNames(css: string): string[] {
	return Object.keys(parseDefineVariables(css));
}

export async function processVariables(css: string): Promise<string> {
	const variables = parseDefineVariables(css);
	const usedVariables = new Set<string>();

	const defineKeywordRemoved = css.replace(DEFINE_BLOCK, '');

	const processor = postcss([
		{
			postcssPlugin: 'fss-variables',
			Declaration(decl) {
				decl.value = valueParser(decl.value)
					.walk(node => {
						if (node.type !== 'word' || !node.value.startsWith('$')) return;

						const replacement = variables[node.value];
						// Check for undefined variables
						if (replacement === undefined) {
							throw decl.error(`Variable ${node.value} is not defined in @define`, { word: node.value });
						}

						usedVariables.add(node.value);
						node.value = replacement;
					})
					.toString();
			}
		}
	]);

	const result = await processor.process(defineKeywordRemoved, { from: undefined });

	// Check for unused variables
	const unusedVariables = Object.keys(variables).filter(variable => !usedVariables.has(variable));
	if (unusedVariables.length > 0) {
		const message =
			unusedVariables.length === 1 ?
				`Variable ${unusedVariables[0]} is not used`
			:	`Variables ${unusedVariables.join(', ')} are not used`;
		throw new Error(message);
	}

	return result.css;
}
