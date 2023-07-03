import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'

import {config} from 'dotenv';
import replace from '@rollup/plugin-replace';

const configToReplace = {};
for (const [key, v] of Object.entries(config().parsed)) {
  configToReplace[`process.env.${key}`] = `'${v}'`;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    crossOriginIsolation(),
    replace({
      include: ["src/**/*.ts", "src/**/*.svelte"],
      preventAssignment: true,
      values: configToReplace
    })
  ],
})
