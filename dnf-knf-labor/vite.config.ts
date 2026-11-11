import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({ base: '/logic/', plugins: [react()], test: { environment: 'jsdom', setupFiles: './src/testSetup.ts' } });
