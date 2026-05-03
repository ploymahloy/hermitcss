import type { CompletionItem } from 'vscode-languageserver/node';
import { CompletionItemKind } from 'vscode-languageserver/node';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { extractClasses, listDefineVariableNames } from '../../../src/index.js';

export function getCompletions(doc: TextDocument, lineText: string, offsetInLine: number): CompletionItem[] {
	const text = doc.getText();
	const beforeCursor = lineText.slice(0, offsetInLine);

	const dollar = beforeCursor.match(/\$([\w-]*)$/);
	if (dollar) {
		const prefix = dollar[1] ?? '';
		const vars = listDefineVariableNames(text);
		return vars
			.filter(v => v.slice(1).startsWith(prefix))
			.map(v => ({
				label: v,
				kind: CompletionItemKind.Variable,
				insertText: v
			}));
	}

	const dot = beforeCursor.match(/\.([\w-]*)$/);
	if (dot) {
		const partial = dot[1] ?? '';
		let classes: string[];
		try {
			classes = extractClasses(text);
		} catch {
			classes = [];
		}
		return classes
			.filter(c => c.startsWith(partial))
			.map(c => ({
				label: `.${c}`,
				kind: CompletionItemKind.Class,
				insertText: c.slice(partial.length)
			}));
	}

	return [];
}
