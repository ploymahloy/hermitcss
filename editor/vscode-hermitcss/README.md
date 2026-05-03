# HermitCSS for VS Code / Cursor

Hermit crab file icons plus **HermitCSS** language support (**`.hcss`**): syntax highlighting mapped to **`source.css`**, diagnostics tied to **`compileHermitCSS`**, plus completion after `.` and `$` tokens and Markdown hovers.

## Develop locally

```bash
npm install
npm run compile      # pulls grammar assets + bundles server stub + emits extension JS
npm run vscode:prepublish && code --extensionDevelopmentPath="$(pwd)"
```

Or follow the root [`editor/README.md`](../README.md) instructions.

### File icon theme

**Preferences: File Icon Theme** → **HermitCSS (Hermit Crab)**. Without it, explorers fall back to the stock icon for unknown extensions—only Hermit tweaks **`.hcss`**.

### Publishing

```bash
npm run vsix
```

Outputs `vscode-hermitcss-*.vsix` (depending on semver). Install via **Extensions: Install from VSIX…**.

Marketplace/Open VSX workflows mirror any other small language extension (`vsce publish`, etc.)—keep **`publisher`** and tokens aligned with how you distribute.
