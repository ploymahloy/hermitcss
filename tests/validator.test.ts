import { describe, it, expect } from 'vitest';
import { validateFSS } from '../src/validator.js';

describe('FSS Validator (No-Cascade Policy)', () => {
	it('should allow single class selectors', async () => {
		const input = '.button { color: red; }';
		await expect(validateFSS(input)).resolves.not.toThrow();
	});

	it('should allow :host selectors', async () => {
		const input = ':host { display: block; }';
		await expect(validateFSS(input)).resolves.not.toThrow();
	});

	it('should allow pseudo-classes on single classes', async () => {
		const input = '.button:hover { opacity: 0.8; }';
		await expect(validateFSS(input)).resolves.not.toThrow();
	});

	it('should FAIL on descendant selectors (the cascade)', async () => {
		const input = '.parent .child { color: blue; }';
		await expect(validateFSS(input)).rejects.toThrow(/descendant combinators are not allowed/);
	});

	it('should FAIL on child combinators', async () => {
		const input = '.parent > .child { margin: 10px; }';
		await expect(validateFSS(input)).rejects.toThrow(/child combinators are not allowed/);
	});

	it('should FAIL on element tags', async () => {
		const input = 'div { display: flex; }';
		await expect(validateFSS(input)).rejects.toThrow(/element tags (div) are not allowed/);
	});
});

describe('FSS Sane Reset Injection', () => {
	it('should inject "all: unset" and layout defaults into every class', async () => {
		const input = '.card { background: white; }';
		const output = await compileFSS(input);

		expect(output).toContain('all: unset');
		expect(output).toContain('display: block');
		expect(output).toContain('box-sizing: border-box');
	});
});

describe('FSS Variable Engine', () => {
	it('should replace $variables with their defined values', async () => {
		const input = `
        @define { $brand: #ff0000; }
        .title { color: $brand; }
      `;
		const output = await compileFSS(input);

		expect(output).toContain('color: #ff0000');
		expect(output).not.toContain('$brand');
	});
});
