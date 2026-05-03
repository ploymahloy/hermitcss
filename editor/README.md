# HermitCSS editor tooling

HermitCSS (`.hcss`) support for editors: TextMate grammar (syntax highlighting), a bundled language server (diagnostics, completions, hover), and a VS Code/Cursor extension.

There is no single installer for every IDE. Use the VS Code extension where supported; reuse the grammar or run the language server elsewhere.

## Prerequisites (first-time setup)

Install dependencies for the editor subpackages once (`npm ci` works if lockfiles are committed and in sync):

```bash
npm install --prefix editor/hermitcss-language-server
npm install --prefix editor/vscode-hermitcss
```

From the repository root, build everything:

```bash
npm run editor:build
```

This produces `editor/hermitcss-language-server/out/server.js` and compiles `editor/vscode-hermitcss` (syntax assets, bundled server copy, extension `out/`).

## VS Code / Cursor / VSCodium

1. Build artifacts (see above).

2. Install the extension locally:

   - **VS Code**: _File → Open Folder…_ and choose `editor/vscode-hermitcss`, then run **Developer: Install Extension from Location…** (or equivalent).
   - **VSIX**: From the repo root run `npm run editor:package`, then install the generated `editor/vscode-hermitcss/vscode-hermitcss-*.vsix` with **Extensions: Install from VSIX…**.

3. **File icon**: Command Palette → **Preferences: File Icon Theme** → **HermitCSS (Hermit Crab)**.

Extension metadata and publishing to the Visual Studio Marketplace and Open VSX are documented in [`vscode-hermitcss/README.md`](./vscode-hermitcss/README.md).

During `npm run compile` inside `editor/vscode-hermitcss`, **`../grammars/hcss.tmLanguage.json`** + `language-configuration.json` are synced into **`syntaxes/`**.

## Grammar only (JetBrains, Sublime Text, Zed, …)

Reuse these files under [`editor/grammars/`](./grammars/):

- [`hcss.tmLanguage.json`](./grammars/hcss.tmLanguage.json) — TextMate grammar for `.hcss` (`source.css`). **Primary authoring path.**
- [`hermitcss.tmLanguage.json`](./grammars/hermitcss.tmLanguage.json) — legacy Hermit-themed grammar (`source.hermitcss`); kept for tooling that imports a standalone grammar bundle.
- [`language-configuration.json`](./grammars/language-configuration.json) — brackets, comments, indentation.

**JetBrains** (IntelliJ, WebStorm, …): _Settings → Editor → TextMate Bundles → Add…_ and select a folder that contains the grammar JSON (layout may vary by version; see JetBrains docs for TextMate import).

**Icons**: VS Code file icon themes do not apply to JetBrains. To customize icons there, use _Settings → Editor → File Types_ (mapping `*.hcss`) and optional custom icon plugins for your IDE.

**Sublime Text**: Install the `.tmLanguage` / JSON grammar via package or **View → Syntax → Open all with…** after adding the syntax definition; consult Sublime’s TextMate import docs.

**Zed**: Use extension or JSON/TextMate grammar import per [Zed docs](https://zed.dev/docs) for custom languages.

## Language server only (Neovim, Helix, Emacs, …)

After `npm run editor:build`, the server is a single Node bundle:

- Path: `editor/hermitcss-language-server/out/server.js`
- Start with **`cwd`** set to `editor/hermitcss-language-server` (or absolute paths everywhere).

The server speaks LSP over **stdio** (`node out/server.js`). Clients must negotiate text document sync. Capabilities include diagnostics, completion (trigger characters `.` and `$`), and hover on `$variables` and `.classes`.

### Neovim (`nvim-lspconfig`)

Adjust the repo path and ensure `editor:build` has been run:

```lua
local root = '~/dev/hermitcss' -- change to your clone

vim.api.nvim_create_autocmd('FileType', {
	pattern = 'hermitcss',
	callback = function()
		vim.lsp.start({
			name = 'hermitcss-language-server',
			cmd = {
				'node',
				vim.fn.expand(root .. '/editor/hermitcss-language-server/out/server.js'),
			},
			cmd_cwd = vim.fn.expand(root .. '/editor/hermitcss-language-server'),
			root_dir = vim.fs.dirname(vim.api.nvim_buf_get_name(0)),
		})
	end,
})

vim.filetype.add({ extension = { hcss = 'hermitcss' } })
```

Also set a grammar (Tree-sitter/TextMate via plugin) if you want highlighting beyond `filetype`.

### Helix

In `languages.toml` (see [Helix languages](https://docs.helix-editor.com/master/languages.html)):

```toml
[[language]]
name = "hcss"
scope = "source.css"
file-types = ["hcss"]
roots = []
language-servers = ["hermitcss"]

[language-server.hermitcss]
command = "node"
args = ["/ABS/PATH/TO/hermitcss/editor/hermitcss-language-server/out/server.js"]
working-directory = "/ABS/PATH/TO/hermitcss/editor/hermitcss-language-server"
```

Add a `[[grammar]]` or external highlighter if you need TextMate-level highlighting in Helix.

### Emacs (`eglot`)

```elisp
(with-eval-after-load 'eglot
  (add-to-list 'eglot-server-programs
               '(hcss-ts-mode . ("node" "/ABS/PATH/TO/hermitcss/editor/hermitcss-language-server/out/server.js"))))
```

Define a major mode with `auto-mode-alist` for `\\.hcss\\'`, or reuse `css-mode` as a base and hook eglot.

## TypeScript `import '*.hcss'`

Install the npm package **`hermitcss`** and add ambient types — see the repository root [`README.md`](../README.md) for install and Vite setup.
