import postcss, { type AtRule, type ChildNode, type Root } from 'postcss';

export type WrapLegacyCssInLayerOptions = {
	layer?: string;
};

const DEFAULT_LAYER = 'legacy';
const WRAPPABLE_GROUP_RULES = new Set(['media', 'supports', 'container', 'scope', 'document']);

export async function wrapLegacyCssInLayer(
	css: string,
	options: WrapLegacyCssInLayerOptions = {}
): Promise<string> {
	const root = postcss.parse(css);
	const targetLayer = options.layer?.trim() || DEFAULT_LAYER;
	const runs = findWrappableRuns(root);

	if (runs.length === 0) {
		return css;
	}

	for (const run of runs) {
		const layerBlock = postcss.atRule({ name: 'layer', params: targetLayer });
		const firstNode = run[0];
		if (!firstNode) {
			continue;
		}
		root.insertBefore(firstNode, layerBlock);

		for (const node of run) {
			layerBlock.append(node);
		}
	}

	return root.toResult().css;
}

function findWrappableRuns(root: Root): ChildNode[][] {
	const runs: ChildNode[][] = [];
	let currentRun: ChildNode[] = [];

	for (const node of root.nodes ?? []) {
		if (isWrappableTopLevelNode(node)) {
			currentRun.push(node);
			continue;
		}

		if (currentRun.length > 0) {
			runs.push(currentRun);
			currentRun = [];
		}
	}

	if (currentRun.length > 0) {
		runs.push(currentRun);
	}

	return runs;
}

function isWrappableTopLevelNode(node: ChildNode): boolean {
	if (node.type === 'rule') {
		return true;
	}

	if (node.type !== 'atrule') {
		return false;
	}

	const atRuleNode = node as AtRule;
	const ruleName = atRuleNode.name.toLowerCase();

	if (ruleName === 'layer') {
		return false;
	}

	return WRAPPABLE_GROUP_RULES.has(ruleName);
}
