import chokidar from 'chokidar';
import fs from 'node:fs/promises';
import { generateTypes } from './type-generator.js';

export function watch(dir: string) {
	const watcher = chokidar.watch(`${dir}/**/*.hcss`, {
		ignoreInitial: false // Generates types for existing files on startup
	});

	const update = async (path: string) => {
		try {
			const content = await fs.readFile(path, 'utf-8');
			await generateTypes(path, content);
			console.log(`[HermitCSS] Mirrored: ${path}`);
		} catch (err) {
			console.error(`[HermitCSS] Mirror Error: ${err}`);
		}
	};

	// Trigger on changes and new arrivals
	watcher.on('change', update);
	watcher.on('add', update);
	watcher.on('error', err => {
		console.error(`[HermitCSS] Watch Error: ${err}`);
	});

	return watcher;
}
