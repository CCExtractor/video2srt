import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'
import path from 'path'

export default defineConfig({
  component: {
    devServer: {
      framework: "svelte",
      bundler: "vite",
    },
  },

  e2e: {
    baseUrl: "http://127.0.0.1:5173",
    setupNodeEvents(on) {
      on('file:preprocessor', vitePreprocessor());
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // auto open devtools
          console.log("THIS SHOULD EXEC")
          launchOptions.args.push('--enable-experimental-web-platform-features')
        }
      })
    },
  },
});
