import type { Hover } from 'vscode-languageserver/node';
import { MarkupKind } from 'vscode-languageserver/node';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { extractClasses, parseDefineVariables } from '../../../src/index.js';

export function getHover(doc: TextDocument, lineText: string, offsetInLine: number): Hover | null {
	const text = doc.getText();

	for (const m of lineText.matchAll(/\$([\w-]+)/g)) {
		const full = m[0]!;
		const start = m.index!;
		const end = start + full.length;
		if (offsetInLine >= start && offsetInLine <= end) {
			const map = parseDefineVariables(text);
			const val = map[full];
			const md =
				val !== undefined ? `**${full}** — \`${val}\`` : `Variable **${full}** is not declared in \`@define\`.`;
			return {
				contents: { kind: MarkupKind.Markdown, value: md }
			};
		}
	}

	let classes: Set<string>;
	try {
		classes = new Set(extractClasses(text));
	} catch {
		classes = new Set();
	}

	for (const m of lineText.matchAll(/\.([\w-]+)/g)) {
		const full = m[0]!;
		const start = m.index!;
		const end = start + full.length;
		if (offsetInLine >= start && offsetInLine <= end) {
			const name = m[1]!;
			const known = classes.has(name);
			const md =
				known ?
					`**Class** \`.${name}\` — declared in this sheet.`
				:	`**Class** \`.${name}\` — no matching class selector found in this file.`;
			return {
				contents: { kind: MarkupKind.Markdown, value: md }
			};
		}
	}

	return null;
}
