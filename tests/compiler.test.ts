import { describe, it, expect } from 'vitest';
import { compileFSS } from '../src/compiler.js';

describe('FSS Compiler', () => {
	it('should prepend the global host reset', async () => {
		const input = '.btn { color: red; }';
		const output = await compileFSS(input);

		expect(output).toContain(':host * {');
		expect(output).toContain('all: unset');
		expect(output).toContain('.btn { color: red; }');
	});

	it('should still fail on illegal selectors during compilation', async () => {
		const input = '.parent .child { color: blue; }';
		await expect(compileFSS(input)).rejects.toThrow(/descendant combinators/);
	});
});

it('should handle @define variables and remove the block from output', async () => {
	const input = `
	  @define { 
		$bg: #000; 
		$text: white; 
	  }
	  .box { background: $bg; color: $text; }
	`;

	const output = await compileFSS(input);

	expect(output).toContain('background: #000');
	expect(output).toContain('color: white');
	expect(output).not.toContain('@define');
	expect(output).not.toContain('$bg');
});

it('should fail if a variable is used but not defined', async () => {
	const input = '.box { color: $missing; }';
	await expect(compileFSS(input)).rejects.toThrow(/Variable \$missing is not defined/);
});

it('should fail if a variable is defined but not used', async () => {
	const input = `
	  @define { $bg: #000; }
	`;
	await expect(compileFSS(input)).rejects.toThrow(/Variable \$bg is not used/);
});
