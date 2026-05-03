import type { Diagnostic, Range } from 'vscode-languageserver/node';
import { DiagnosticSeverity } from 'vscode-languageserver/node';
import { compileHermitCSS } from '../../../src/index.js';

interface PostcssLikeError {
	message?: string;
	line?: number;
	column?: number;
	endLine?: number;
	endColumn?: number;
}

export async function getCompilationDiagnostics(text: string): Promise<Diagnostic[]> {
	try {
		await compileHermitCSS(text);
		return [];
	} catch (err) {
		return [normalizeErrorDiagnostic(text, err)];
	}
}

export function normalizeErrorDiagnostic(text: string, err: unknown): Diagnostic {
	const message = err instanceof Error ? err.message : String(err);
	const e = err as PostcssLikeError;

	if (typeof e.line === 'number' && typeof e.column === 'number') {
		return {
			severity: DiagnosticSeverity.Error,
			range: postcssLikeRange(text, e),
			message,
			source: 'hermitcss'
		};
	}

	return {
		severity: DiagnosticSeverity.Error,
		range: guessRangeForPlainError(text, message),
		message,
		source: 'hermitcss'
	};
}

function postcssLikeRange(text: string, err: PostcssLikeError): Range {
	const lines = text.split('\n');
	const startLine = Math.max(0, err.line! - 1);
	const startCol = Math.max(0, err.column! - 1);
	const endLineNum =
		typeof err.endLine === 'number' ? Math.max(0, err.endLine - 1) : startLine;

	let endCol: number;
	if (typeof err.endColumn === 'number') {
		endCol = Math.max(startCol, err.endColumn - 1);
	} else if (endLineNum === startLine && lines[startLine] !== undefined) {
		endCol = lines[startLine]!.length;
	} else {
		endCol = startCol + 1;
	}

	return {
		start: { line: startLine, character: startCol },
		end: { line: endLineNum, character: endCol }
	};
}

function guessRangeForPlainError(text: string, _message: string): Range {
	const lines = text.split('\n');
	const defineIdx = lines.findIndex(l => /^\s*@define\b/.test(l));
	if (defineIdx >= 0) {
		const line = lines[defineIdx]!;
		const start = line.indexOf('@define');
		const from = start >= 0 ? start : 0;
		return {
			start: { line: defineIdx, character: from },
			end: { line: defineIdx, character: line.length }
		};
	}

	const first = lines[0] ?? '';
	return {
		start: { line: 0, character: 0 },
		end: { line: 0, character: Math.min(first.length, 1) }
	};
}
