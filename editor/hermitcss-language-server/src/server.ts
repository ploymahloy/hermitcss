import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	TextDocumentSyncKind,
	type CompletionParams,
	type HoverParams
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getCompilationDiagnostics } from './diagnostics.js';
import { getCompletions } from './completions.js';
import { getHover } from './hover.js';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => {
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			completionProvider: {
				resolveProvider: false,
				triggerCharacters: ['.', '$']
			},
			hoverProvider: true
		}
	};
});

async function publishDiagnostics(uri: string, text: string): Promise<void> {
	const diagnostics = await getCompilationDiagnostics(text);
	connection.sendDiagnostics({ uri, diagnostics });
}

documents.onDidOpen(async change => {
	await publishDiagnostics(change.document.uri, change.document.getText());
});

documents.onDidChangeContent(async change => {
	await publishDiagnostics(change.document.uri, change.document.getText());
});

documents.onDidClose(() => {
	// Let the client clear diagnostics when the document is gone.
});

connection.onCompletion((params: CompletionParams) => {
	const doc = documents.get(params.textDocument.uri);
	if (!doc) return [];
	const pos = params.position;
	const lineText = doc.getText({
		start: { line: pos.line, character: 0 },
		end: { line: pos.line, character: Number.MAX_SAFE_INTEGER }
	});
	return getCompletions(doc, lineText, pos.character);
});

connection.onHover((params: HoverParams) => {
	const doc = documents.get(params.textDocument.uri);
	if (!doc) return null;
	const pos = params.position;
	const lineText = doc.getText({
		start: { line: pos.line, character: 0 },
		end: { line: pos.line, character: Number.MAX_SAFE_INTEGER }
	});
	return getHover(doc, lineText, pos.character);
});

documents.listen(connection);
connection.listen();
