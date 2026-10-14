import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { apiApp } from './server/app.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildId = Date.now().toString();

// Write fresh version.json on build / startup so installed PWAs can detect newer deployments
try {
  const versionPath = path.resolve(__dirname, 'public', 'version.json');
  fs.writeFileSync(
    versionPath,
    JSON.stringify({ version: buildId, buildTime: new Date().toISOString() }, null, 2),
    'utf-8'
  );
} catch (e) {
  console.warn('Could not update version.json', e);
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        server.middlewares.use(apiApp);
      },
    },
  ],
})
