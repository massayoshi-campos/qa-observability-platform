const { defineConfig } = require("cypress");

// timestamp
function getTimestamp() {
  const date = new Date();
  const pad = (n) => (n < 10 ? `0${n}` : n);
  return `${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}${date.getFullYear()}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(
    date.getSeconds()
  )}`;
}

module.exports = defineConfig({
  allowCypressEnv: false,
  chromeWebSecurity: false,
  defaultCommandTimeout: 30000,
  execTimeout: 60000,
  taskTimeout: 60000,
  pageLoadTimeout: 90000,
  requestTimeout: 9000,
  responseTimeout: 400000,
  trashAssetsBeforeRuns: true,

  reporter: "cypress-multi-reporters",
  reporterOptions: {
    reporterEnabled: "mochawesome, mocha-junit-reporter",

    mochawesomeReporterOptions: {
      reportDir: "mochawesome-report",
      overwrite: false,
      html: false,
      json: true,
      timestamp: "mmddyyyy_HHMMss",
      reportTitle: "Petstore API"
    },

    mochaJunitReporterReporterOptions: {
      mochaFile: `mochawesome-report/junit-report-${getTimestamp()}.xml`,
      toConsole: false
    }
  },

  e2e: {
    screenshotsFolder: "./cypress/reports/screenshots",
    video: false,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx,spec}",
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0,
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    env: {
      snapshotOnly: true,
      PASSPHRASE: process.env.PASSPHRASE,
      API_KEY: process.env.API_KEY
    }
  },

  retries: {
    runMode: 2,
    openMode: 0
  }
});
