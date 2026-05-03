import { defineConfig } from 'vite';
import hermitCss from 'hermitcss/vite-plugin';

export default defineConfig({
	plugins: [hermitCss()]
});
