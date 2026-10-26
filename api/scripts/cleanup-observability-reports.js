const fs = require("node:fs");
const path = require("node:path");

const reportsDirectory = path.resolve(
  __dirname,
  "../mochawesome-report"
);

const reportPattern = /^mochawesome_.*\.json$/i;

function cleanupObservabilityReports() {
  if (!fs.existsSync(reportsDirectory)) {
    console.log("Mochawesome report directory does not exist.");
    return;
  }

  const files = fs
    .readdirSync(reportsDirectory)
    .filter((file) => reportPattern.test(file));

  if (files.length === 0) {
    console.log("No individual Mochawesome JSON reports to clean.");
    return;
  }

  for (const file of files) {
    const filePath = path.join(reportsDirectory, file);

    fs.unlinkSync(filePath);

    console.log(`Removed: ${file}`);
  }

  console.log(
    `Observability cleanup completed. Files removed: ${files.length}`
  );
}

try {
  cleanupObservabilityReports();
} catch (error) {
  console.error("Observability cleanup failed:", error.message);
  process.exitCode = 1;
}