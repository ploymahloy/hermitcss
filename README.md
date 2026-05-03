# HermitCSS

Author **predictable CSS** as `*.hcss` files (real CSS syntax) and ship it against messy legacy bundles by using **CSS cascade layers** in the document. HermitCSS is **light‑DOM only**—no Shadow DOM, no tie-in to Web Components—and works with plain HTML or any framework once your styles load in global CSS order.

Hermit compilation is intentionally small:

- Parses and validates authoring with PostCSS (`compileHermitCSS`).
- Optionally expands Hermit **`@define { $tokens }`** placeholders (omit entirely if you prefer native **`var()`** everywhere).
- A Vite plugin turns `*.hcss` imports into modules whose **default export** is the compiled CSS string.
- Helpers like **`injectHermitStyleTag()`** glue quick demos together; bundlers typically emit a regular CSS bundle instead.

## Install

```bash
npm install --save hermitcss
```

Build-time tools like Vite are often installed as devDependencies; add `-D` to the above if you prefer `hermitcss` as a dev-only dependency.

Editor support (grammar, diagnostics, completions) lives under [`editor/`](editor/README.md).

## How Hermit stays the “Unlayered King”

Every adopting app should ship a **canonical bootstrap stylesheet** that puts **everything that is _not_ HermitCSS** into one or more **`@layer` blocks** or equivalent (`@import "…" layer(legacy)`). Compiled Hermit **`*.hcss` output stays unlayered** (by default)—so Hermit beats messy IDs and specificity in those layers regardless of selector shape.

Minimal pattern:

```css
/* app-legacy-layers.css — load this before Hermit output */
@layer legacy-app {
	#HugeLegacyButton {
		padding: 60px !important;
		color: fuchsia;
	}
}
```

```css
/* button.hcss — compiled/imported later as unlayered */
.btn-replacement {
	padding: 8px;
	color: teal;
}
```

The `.btn-replacement` rules win against the `#HugeLegacyButton` declarations **because unlayered rules outrank layered ones**, not because you matched ID specificity.

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
	plugins: [hermitCss()],
});
```

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
