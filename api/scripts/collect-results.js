const path = require("node:path");
const { randomUUID } = require("node:crypto");

const database = require("../src/database/database");
const {
  collectMochawesomeReports,
} = require("../src/collectors/mochawesomeCollector");

const reportsDirectory = path.resolve(
  __dirname,
  "../mochawesome-report"
);

const environment = (process.env.TEST_ENVIRONMENT || "qa").toLowerCase();

function getSpecName(report) {
  const firstSpec = report.specs[0]?.file || report.sourceFile;
  return firstSpec.replace(/\\/g, "/");
}

const reports = collectMochawesomeReports(reportsDirectory);

const totalTests = reports.reduce(
  (sum, report) => sum + report.totalTests,
  0
);

const passedTests = reports.reduce(
  (sum, report) => sum + report.passedTests,
  0
);

const failedTests = reports.reduce(
  (sum, report) => sum + report.failedTests,
  0
);

const pendingTests = reports.reduce(
  (sum, report) => sum + report.pendingTests,
  0
);

const skippedTests = reports.reduce(
  (sum, report) => sum + report.skippedTests,
  0
);

const startedAt = reports
  .map((report) => report.startedAt)
  .filter(Boolean)
  .sort()[0] ?? null;

const finishedAt = reports
  .map((report) => report.finishedAt)
  .filter(Boolean)
  .sort()
  .at(-1) ?? null;

const durationMs = reports.reduce(
  (sum, report) => sum + report.durationMs,
  0
);

const insertRun = database.prepare(`
  INSERT INTO test_runs (
    run_uuid,
    environment,
    started_at,
    finished_at,
    total_duration_ms,
    total_tests,
    passed_tests,
    failed_tests,
    pending_tests,
    skipped_tests
  ) VALUES (
    @runUuid,
    @environment,
    @startedAt,
    @finishedAt,
    @durationMs,
    @totalTests,
    @passedTests,
    @failedTests,
    @pendingTests,
    @skippedTests
  )
`);

const insertSuite = database.prepare(`
  INSERT INTO test_suites (
    run_id,
    suite_name,
    spec_file,
    duration_ms,
    total_tests,
    passed_tests,
    failed_tests,
    pending_tests,
    skipped_tests
  ) VALUES (
    @runId,
    @suiteName,
    @specFile,
    @durationMs,
    @totalTests,
    @passedTests,
    @failedTests,
    @pendingTests,
    @skippedTests
  )
`);

const saveResults = database.transaction(() => {
  const runUuid = randomUUID();

  const runResult = insertRun.run({
    runUuid,
    environment,
    startedAt,
    finishedAt,
    durationMs,
    totalTests,
    passedTests,
    failedTests,
    pendingTests,
    skippedTests,
  });

  for (const report of reports) {
    const specFile = getSpecName(report);

    insertSuite.run({
      runId: runResult.lastInsertRowid,
      suiteName: path.basename(specFile, ".cy.js"),
      specFile,
      durationMs: report.durationMs,
      totalTests: report.totalTests,
      passedTests: report.passedTests,
      failedTests: report.failedTests,
      pendingTests: report.pendingTests,
      skippedTests: report.skippedTests,
    });
  }

  return { runUuid, runId: runResult.lastInsertRowid };
});

try {
  const savedRun = saveResults();

  console.log("Mochawesome results saved to SQLite.");
  console.log(JSON.stringify({
    runUuid: savedRun.runUuid,
    environment,
    reports: reports.length,
    totalTests,
    passedTests,
    failedTests,
    pendingTests,
    skippedTests,
    durationMs,
  }, null, 2));
} catch (error) {
  console.error("Failed to save Mochawesome results:", error.message);
  process.exitCode = 1;
} finally {
  database.close();
}