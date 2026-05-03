import { describe, it, expect } from 'vitest';
import { extractClasses } from '../../src/integrations/extractor.js';

describe('HermitCSS class extractor', () => {
	it('should extract simple class names', () => {
		const input = '.btn { color: red; } .card { padding: 10px; }';
		const classes = extractClasses(input);
		expect(classes).toContain('btn');
		expect(classes).toContain('card');
		expect(classes).toHaveLength(2);
	});

	it('should ignore :host and element tags', () => {
		const input = ':host { display: block; } div { color: blue; } .item { color: green; }';
		const classes = extractClasses(input);
		expect(classes).toEqual(['item']);
	});

	it('should extract base class from pseudo-classes', () => {
		const input = '.button:hover { opacity: 0.8; } .input:focus-within { outline: none; }';
		const classes = extractClasses(input);
		expect(classes).toContain('button');
		expect(classes).toContain('input');
	});

	it('should ignore decimals in values', () => {
		const input = '.box { opacity: 0.5; width: 10.5px; }';
		const classes = extractClasses(input);
		expect(classes).toEqual(['box']);
		expect(classes).not.toContain('5');
	});

	it('should handle multiple classes in one selector', () => {
		const input = '.btn.primary { color: white; }';
		const classes = extractClasses(input);
		expect(classes).toContain('btn');
		expect(classes).toContain('primary');
	});

	it('should unique the results', () => {
		const input = '.btn { color: red; } .btn { font-weight: bold; }';
		const classes = extractClasses(input);
		expect(classes).toEqual(['btn']);
	});
});
