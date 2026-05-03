import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import { generateTypes } from '../../src/integrations/type-generator.js';

vi.mock('node:fs/promises');

describe('HermitCSS type generator', () => {
	beforeEach(() => {
		vi.mocked(fs.writeFile).mockClear();
	});

	it('writes sibling .d.ts for extracted classes', async () => {
		const hcss = '.primaryBtn { color: red; } .sidebar_link { display: flex; }';
		const filePath = '/project/src/Button.hcss';

		await generateTypes(filePath, hcss);

		expect(fs.writeFile).toHaveBeenCalledWith(
			'/project/src/Button.hcss.d.ts',
			expect.stringContaining('export const classes = {'),
			'utf-8'
		);
		expect(fs.writeFile).toHaveBeenCalledWith(
			'/project/src/Button.hcss.d.ts',
			expect.stringContaining('"primaryBtn"'),
			'utf-8'
		);
	});

	it('handles Hermit sheets without extracted classes', async () => {
		await generateTypes('empty.hcss', '@layer scoped { aside { padding: 0; } }');
		const generatedContent = vi.mocked(fs.writeFile).mock.calls[0]?.[1] as string;

		expect(generatedContent).toBeDefined();
		expect(generatedContent).toMatch(/export const classes = \{\}\sas const;/);
	});
});
