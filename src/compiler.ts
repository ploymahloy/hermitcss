import postcss from 'postcss';
import { validateFSS } from './validator.js';

const SANE_RESET = `
:host {
  display: block;
  contain: content;
}

:host * {
  all: unset;
  display: revert; // IMPORTANT! Keeps <div> as block and <span> as inline
  box-sizing: border-box;
  font-family: inherit;
}
`.trim();

export async function compileFSS(css: string): Promise<string> {
	// Step 1: Validate
	await validateFSS(css);

	// Step 2: Transform
	const result = await postcss([]).process(css, { from: undefined });

	// Step 3: Return reset/flat CSS
	return `${SANE_RESET}\n\n${result.css}`;
}
