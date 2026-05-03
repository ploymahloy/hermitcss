/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { injectHermitStyleTag } from '../../src/runtime/light-dom.js';

describe('injectHermitStyleTag', () => {
	it('creates or updates a style element with Hermit markup', () => {
		document.documentElement.innerHTML = '<head></head><body></body>';
		const css = `.hermit-scope { margin: ${2}px; color: teal; }`;
		const first = injectHermitStyleTag(css, { document });
		expect(first.tagName.toLowerCase()).toBe('style');
		expect(first.getAttribute('data-hermit')).toBe('');
		expect(first.id).toBe('hermitcss-styles');
		expect(document.getElementById('hermitcss-styles')?.textContent).toBe(css);

		const second = injectHermitStyleTag('.hermit-scope { opacity: .5; }', { document });
		expect(second).toBe(first);
		expect(second.textContent).toContain('opacity');
	});
});
