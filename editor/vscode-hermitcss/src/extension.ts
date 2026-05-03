import * as path from 'node:path';
import * as vscode from 'vscode';
import {
	LanguageClient,
	TransportKind,
	type LanguageClientOptions,
	type ServerOptions
} from 'vscode-languageclient/lib/node/main.js';

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext): void {
	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));

	const serverOptions: ServerOptions = {
		run: {
			command: process.execPath,
			args: [serverModule],
			transport: TransportKind.stdio
		},
		debug: {
			command: process.execPath,
			args: [serverModule],
			transport: TransportKind.stdio
		}
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'hermitcss' }]
	};

	client = new LanguageClient(
		'hermitCssLanguageServer',
		'HermitCSS Language Server',
		serverOptions,
		clientOptions
	);
	client.start();
	context.subscriptions.push(client);
}

export function deactivate(): Thenable<void> | undefined {
	return client?.stop();
}
