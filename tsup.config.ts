import { defineConfig } from 'tsup';

export default defineConfig({
	name: 'webhooks',
	entry: ['src/server.ts'],
	format: 'esm',
});