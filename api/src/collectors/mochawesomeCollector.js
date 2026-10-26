const fs = require("node:fs");
const path = require("node:path");

function collectMochawesomeReports(reportsDirectory) {
  const directory = path.resolve(reportsDirectory);

  if (!fs.existsSync(directory)) {
    throw new Error(`Reports directory not found: ${directory}`);
  }

  const files = fs
    .readdirSync(directory)
    .filter((file) => /^mochawesome_.*\.json$/i.test(file))
    .sort();

  if (files.length === 0) {
    throw new Error("No individual Mochawesome JSON reports found.");
  }

  return files.map((file) => {
    const filePath = path.join(directory, file);
    const report = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!report.stats || !Array.isArray(report.results)) {
      throw new Error(`Invalid Mochawesome report: ${file}`);
    }

    const stats = report.stats;

    return {
      sourceFile: file,
      startedAt: stats.start ?? null,
      finishedAt: stats.end ?? null,
      durationMs: stats.duration ?? 0,
      totalTests: stats.tests ?? 0,
      passedTests: stats.passes ?? 0,
      failedTests: stats.failures ?? 0,
      pendingTests: stats.pending ?? 0,
      skippedTests: stats.skipped ?? 0,
      specs: report.results.map((result) => ({
        title: result.title || "",
        file: result.fullFile || result.file || "",
      })),
    };
  });
}

module.exports = { collectMochawesomeReports };