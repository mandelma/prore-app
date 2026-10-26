// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  // Playwrighti testide asukoht
  testDir: './tests/e2e',

  // Esialgu ei käivita teste paralleelselt
  fullyParallel: false,

  // Väldime test.only juhuslikku kasutamist CI keskkonnas
  forbidOnly: !!process.env.CI,

  // Esialgu ei korda ebaõnnestunud teste
  retries: 0,

  // Üks test korraga
  workers: 1,

  // HTML raport
  reporter: 'html',

  use: {

    // DuunHubi lokaalne frontend
    baseURL: 'http://localhost:5173',

    // Salvestame vea korral ekraanipildi
    screenshot: 'only-on-failure',

    // Salvestame vea korral video
    video: 'retain-on-failure',

    // Salvestame jälje vea korral
    trace: 'retain-on-failure',
  },

  // Esialgu testime Chromiumiga
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

});