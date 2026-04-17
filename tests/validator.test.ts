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

	it('should FAIL on descendant selectors', async () => {
		const input = '.parent .child { color: blue; }';
		await expect(validateFSS(input)).rejects.toThrow(/descendant combinators/);
	});

	it('should FAIL on child combinators', async () => {
		const input = '.parent > .child { margin: 10px; }';
		await expect(validateFSS(input)).rejects.toThrow(/child combinators/);
	});

	it('should FAIL on element tags', async () => {
		const input = 'div { display: flex; }';
		await expect(validateFSS(input)).rejects.toThrow(/Bare element tags/);
	});
});
