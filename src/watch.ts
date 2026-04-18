import chokidar from 'chokidar';
import fs from 'node:fs/promises';
import { generateTypes } from './type-generator.js';

export function watch(dir: string) {
	const watcher = chokidar.watch(`${dir}/**/*.fss`, {
		ignoreInitial: false // Generates types for existing files on startup
	});

	const update = async (path: string) => {
		try {
			const content = await fs.readFile(path, 'utf-8');
			await generateTypes(path, content);
			console.log(`[FSS] Mirrored: ${path}`);
		} catch (err) {
			console.error(`[FSS] Mirror Error: ${err}`);
		}
	};

	// Trigger on changes and new arrivals
	watcher.on('change', update);
	watcher.on('add', update);
	watcher.on('error', err => {
		console.error(`[FSS] Watch Error: ${err}`);
	});

	return watcher;
}
