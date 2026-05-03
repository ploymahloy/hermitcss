/**
 * Injects Hermit compiled CSS into a document as a `<style>` element.
 * Intended for apps that load legacy CSS behind `@layer` so Hermit’s unlayered rules win (see README).
 *
 * Prefer appending near the end of `<head>` (or `<body>`) **after** the legacy-layer stylesheet
 * so authored order stays predictable alongside cascade layers.
 */
export function injectHermitStyleTag(
	css: string,
	options?: { document?: Document; id?: string; parent?: HTMLElement }
): HTMLStyleElement {
	const doc = options?.document ?? (typeof document !== 'undefined' ? document : undefined);
	if (!doc) {
		throw new Error('injectHermitStyleTag: no Document provided and no global document.');
	}

	const id = options?.id ?? 'hermitcss-styles';
	let el = doc.getElementById(id) as HTMLStyleElement | null;
	if (el) {
		el.textContent = css;
		return el;
	}

	el = doc.createElement('style');
	el.id = id;
	el.setAttribute('data-hermit', '');
	el.textContent = css;

	const root = options?.parent ?? doc.head ?? doc.documentElement;
	if (typeof root.append === 'function') {
		root.append(el);
	} else {
		root.appendChild(el);
	}
	return el;
}
