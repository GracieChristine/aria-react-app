import { defineConfig } from 'cypress'
import cypressGrep from '@bahmutov/cy-grep/src/plugin.js'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    browser: 'chrome',
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      return cypressGrep(config)
    },
  },
})
