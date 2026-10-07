import { defineConfig } from 'vite';
export default defineConfig({ root: new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/i, '$1'), server: { host: '127.0.0.1', port: 8137, strictPort: true } });
