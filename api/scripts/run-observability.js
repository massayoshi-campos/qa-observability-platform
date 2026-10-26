const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const projectDirectory = path.resolve(__dirname, "..");
const reportsDirectory = path.join(projectDirectory, "mochawesome-report");

const cleanupScript = path.join(__dirname, "cleanup-observability-reports.js");

const collectorScript = path.join(__dirname, "collect-results.js");

const cypressPackageDirectory = path.dirname(
  require.resolve("cypress/package.json"),
);

const cypressCli = path.join(cypressPackageDirectory, "bin", "cypress");

const mochawesomeMergeCli = require.resolve("mochawesome-merge");
const margeCli = require.resolve("mochawesome-report-generator");

function runCommand(command, args, description) {
  console.log(`\n========== ${description} ==========\n`);

  const result = spawnSync(command, args, {
    cwd: projectDirectory,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.signal) {
    throw new Error(`Process terminated by signal: ${result.signal}`);
  }

  return result.status ?? 1;
}

function verifyIndividualReports() {
  if (!fs.existsSync(reportsDirectory)) {
    throw new Error("Mochawesome report directory not found.");
  }

  const reports = fs
    .readdirSync(reportsDirectory)
    .filter((file) => /^mochawesome_.*\.json$/i.test(file));

  if (reports.length === 0) {
    throw new Error("No individual Mochawesome JSON reports were generated.");
  }

  console.log(`\nIndividual JSON reports found: ${reports.length}`);

  return reports;
}

function verifyConsolidatedReports() {
  const jsonReport = path.join(reportsDirectory, "report.json");

  const htmlReport = path.join(reportsDirectory, "report.html");

  if (!fs.existsSync(jsonReport)) {
    throw new Error("Consolidated report.json was not generated.");
  }

  if (!fs.existsSync(htmlReport)) {
    throw new Error("Consolidated report.html was not generated.");
  }

  const report = JSON.parse(fs.readFileSync(jsonReport, "utf8"));

  if (!report || typeof report !== "object") {
    throw new Error("Consolidated JSON report is invalid.");
  }

  console.log("Consolidated JSON and HTML reports verified.");

  return report;
}

function main() {
  // 1. Remove old individual JSON reports.
  const cleanupStatus = runCommand(
    process.execPath,
    [cleanupScript],
    "STEP 1: CLEAN OLD REPORTS",
  );

  if (cleanupStatus !== 0) {
    throw new Error("Failed to clean old individual reports.");
  }

  // 2. Execute Cypress using Node.js directly.
  const testStatus = runCommand(
    process.execPath,
    [cypressCli, "run", "--env", "configFile=qa"],
    "STEP 2: EXECUTE CYPRESS QA TESTS",
  );

  // 3. Verify individual reports.
  // Failed tests may still generate valid reports.
  const individualReports = verifyIndividualReports();

  // 4. Persist the results in SQLite.
  const collectorStatus = runCommand(
    process.execPath,
    [collectorScript],
    "STEP 3: SAVE RESULTS TO SQLITE",
  );

  if (collectorStatus !== 0) {
    throw new Error(
      "SQLite collection failed. Individual JSON files were preserved.",
    );
  }

  // 5. Merge individual JSON reports.
  const mergeStatus = runCommand(
    process.execPath,
    [
      mochawesomeMergeCli,
      ...individualReports.map((file) => path.join(reportsDirectory, file)),
      "-o",
      path.join(reportsDirectory, "report.json"),
    ],
    "STEP 4: MERGE JSON REPORTS",
  );

  if (mergeStatus !== 0) {
    throw new Error("Failed to merge individual Mochawesome JSON reports.");
  }

  // 6. Generate the consolidated HTML report.
  const margeStatus = runCommand(
    process.execPath,
    [
      margeCli,
      path.join(reportsDirectory, "report.json"),
      "--reportDir",
      reportsDirectory,
      "--reportPageTitle",
      "QA Observability Platform",
      "--reportTitle",
      "QA Observability Platform",
      "--charts",
    ],
    "STEP 5: GENERATE HTML REPORT",
  );

  if (margeStatus !== 0) {
    throw new Error("Failed to generate the consolidated HTML report.");
  }

  // 7. Verify consolidated reports before removing individual JSONs.
  verifyConsolidatedReports();

  // 8. Remove individual JSONs only after successful processing.
  const finalCleanupStatus = runCommand(
    process.execPath,
    [cleanupScript],
    "STEP 6: CLEAN PROCESSED JSON FILES",
  );

  if (finalCleanupStatus !== 0) {
    throw new Error("Final cleanup failed. Check the individual JSON files.");
  }

  console.log("\n========== OBSERVABILITY PIPELINE COMPLETED ==========\n");

  console.log(`Individual reports processed: ${individualReports.length}`);

  console.log("SQLite persistence and consolidated reports completed.");

  if (testStatus !== 0) {
    console.error(
      "\nWARNING: Cypress reported a failure. Results were collected and reports generated.",
    );

    process.exitCode = testStatus;
    return;
  }

  console.log("All Cypress tests passed.");
}

try {
  main();
} catch (error) {
  console.error(`\nOBSERVABILITY PIPELINE ERROR: ${error.message}`);

  process.exitCode = 1;
}
