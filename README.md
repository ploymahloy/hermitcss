# HermitCSS

Author **predictable CSS** as `*.hcss` files (real CSS syntax) and ship it against messy legacy bundles by using **CSS cascade layers** in the document. HermitCSS is **light‑DOM only**—no Shadow DOM, no tie-in to Web Components—and works with plain HTML or any framework once your styles load in global CSS order.

Hermit compilation is intentionally small:

- Parses and validates authoring with PostCSS (`compileHermitCSS`).
- Optionally expands Hermit **`@define { $tokens }`** placeholders (omit entirely if you prefer native **`var()`** everywhere).
- A Vite plugin (`hermitCss()`) compiles `*.hcss` imports into modules whose **default export** is the compiled CSS string, and by default wraps unlayered top-level rules in ordinary `.css` files into **`@layer legacy`** (see Vite section for options).
- Helpers like **`injectHermitStyleTag()`** glue quick demos together; bundlers typically emit a regular CSS bundle instead.

## Install

```bash
npm install --save hermitcss
```

Build-time tools like Vite are often installed as devDependencies; add `-D` to the above if you prefer `hermitcss` as a dev-only dependency.

Editor support (grammar, diagnostics, completions) lives under [`editor/`](editor/README.md).

## How Hermit stays the “Unlayered King”

The Vite plugin applies a legacy-layer transform automatically: unlayered top-level rules in ordinary `.css` files are wrapped into **`@layer legacy`** unless you configure otherwise. Compiled Hermit **`*.hcss` output stays unlayered**—so Hermit beats messy IDs and specificity in those legacy layers regardless of selector shape. For SSR or non-Vite pipelines, use **`wrapLegacyCssInLayer()`** from the core package (`hermitcss`).

Minimal pattern:

```css
/* app-legacy.css — regular legacy css; plugin wraps this automatically */
#HugeLegacyButton {
	padding: 60px !important;
	color: fuchsia;
}
```

```css
/* button.hcss — compiled/imported later as unlayered */
.btn-replacement {
	padding: 8px;
	color: teal;
}
```

The `.btn-replacement` rules win against `#HugeLegacyButton` declarations **because unlayered rules outrank layered ones**, not because you matched ID specificity.

### Explicit layer order (alternative)

If everything lives in `@layer`:

```css
@layer legacy, widgets;

@layer legacy {
	div {
		opacity: 0.3;
	}
}

@layer widgets {
	.hero {
		opacity: 1;
	}
}
```

Here `widgets` beats `legacy` because it appears later in the layer **order declaration**. Put Hermit in the winning layer once and keep docs consistent.

### `!important`

Avoid `!important` in Hermit unless you consciously want the cascade “nuclear” option—and document that layered styles (`!important`) can still behave differently from unlayered `!important` per spec.

## TypeScript ambient module for `*.hcss`

```txt
src/vite-env.d.ts
```

```typescript
/// <reference types="hermitcss/hcss-module" />
```

Then `import styles from './button.hcss'` type-checks as `styles: string`.

## Vite

```typescript
import { defineConfig } from 'vite';
import hermitCss from 'hermitcss/vite-plugin';

export default defineConfig({
	plugins: [
		hermitCss({
			// optional — wrapping is on by default
			legacyLayer: { layer: 'legacy' },
			// legacyLayer: false, // disable automatic legacy wrapping
		}),
	],
});
```

By default **`hermitCss()`** wraps unlayered top-level rules in `.css` files into `@layer legacy` and compiles `.hcss` files into JS modules exporting the stylesheet string.

**Deprecated:** `hermitcss/vite-legacy-layer-plugin` is kept as a compatibility shim that delegates to **`hermitCss()`** (with a console warning once per process). Prefer a single **`hermitCss()`** plugin in `vite.config`.

**Upgrading:** If you previously registered both `hermitcss/vite-legacy-layer-plugin` and `hermitcss/vite-plugin`, remove the legacy-layer plugin and keep a single **`hermitCss()`** call—otherwise Hermit hooks run twice. Plain `.css` is now layered by default when `legacyLayer` is not `false`; set **`legacyLayer: false`** only if your app relied on `.css` staying unlayered.

Emitted module shape:

```typescript
/** default export === compiled stylesheet string */
import compiled from './component.hcss';
```

## Inject at runtime (optional)

```typescript
import { injectHermitStyleTag } from 'hermitcss/inject';
import shell from './island.hcss';

injectHermitStyleTag(shell, { document, id: 'hermit-slot' });
```

Use **`hermitcss/inject`** in browser bundles so you do not pull the compiler graph (PostCSS, selector parsing, etc.). `import { injectHermitStyleTag } from 'hermitcss'` is fine for Node/tooling.

Call this **after** your legacy layered CSS is linked so layering + source order behave as documented.

## SSR/build pipelines

Use the shared utility to wrap generated/collected legacy CSS without requiring an entry wrapper file:

```typescript
import { wrapLegacyCssInLayer } from 'hermitcss';

const legacyCss = `
#legacyRoot .banner { font-size: 42px; }
`;

const layeredLegacyCss = await wrapLegacyCssInLayer(legacyCss, { layer: 'legacy' });
```

This keeps server-produced legacy output layered while Hermit `.hcss` output stays unlayered.

## Repository layout

| Command | Meaning |
| --- | --- |
| `npm run build` | Emit `dist/` for the npm package (`tsc`). |
| `npm test` | Vitest suite. |
| `npm run examples:dev` | Vite example under `examples/basic` (`npm ci` in the example; build the package once from the repo root). |
| `npm run editor:build` | Build the bundled language server + VS Code/Cursor extension. |

## Publishing

```bash
npm run build
npx vitest run
npm publish
```

`prepublishOnly` already runs build + tests.
