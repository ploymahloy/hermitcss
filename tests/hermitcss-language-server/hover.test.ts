import { describe, it, expect } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getHover } from '../../editor/hermitcss-language-server/src/hover.js';

describe('HermitCSS language-server hover', () => {
	it('shows @define value for variables', () => {
		const doc = TextDocument.create(
			'file:///x.hcss',
			'hermitcss',
			1,
			`@define { $pad: 8px; }
.hero { padding: $pad; }`
		);
		const line = doc.getText({
			start: { line: 1, character: 0 },
			end: { line: 1, character: Number.MAX_SAFE_INTEGER }
		});
		const hover = getHover(doc, line, line.indexOf('$pad') + 2);
		expect(hover?.contents).toMatchObject({
			kind: 'markdown'
		});
		expect(String((hover?.contents as { value: string }).value)).toContain('8px');
	});

	it('reports classes not declared in selectors', () => {
		const doc = TextDocument.create(
			'file:///x.hcss',
			'hermitcss',
			1,
			`.foo { color: red; }
 .bar { margin: .nope; }`
		);
		const line = doc.getText({
			start: { line: 1, character: 0 },
			end: { line: 1, character: Number.MAX_SAFE_INTEGER }
		});
		const hover = getHover(doc, line, line.indexOf('.nope') + 3);
		expect(String((hover?.contents as { value: string }).value)).toMatch(/no matching class/);
	});
});
