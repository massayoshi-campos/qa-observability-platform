function createObservabilityService({
  testRunRepository,
  testSuiteRepository,
}) {
  if (!testRunRepository || !testSuiteRepository) {
    throw new Error("Test run and test suite repositories are required.");
  }

  function getDashboardSummary() {
    return testRunRepository.getSummary();
  }

  function getLatestRun() {
    return testRunRepository.findLatest() ?? null;
  }

  function getSuitePerformance({ limit = 10 } = {}) {
    return testSuiteRepository.getPerformance({ limit });
  }

  function getSlowestSuites({ limit = 10 } = {}) {
    return testSuiteRepository.findSlowest({ limit });
  }

  function getRunDetails(runId) {
    const run = testRunRepository.findById(runId);

    if (!run) {
      return null;
    }

    const suites = testSuiteRepository.findByRunId(runId);

    return {
      run,
      suites,
    };
  }

  function getDashboard() {
    return {
      summary: getDashboardSummary(),
      latestRun: getLatestRun(),
      suitePerformance: getSuitePerformance(),
      slowestSuites: getSlowestSuites(),
    };
  }

  function getRuns({ limit = 20, offset = 0, environment } = {}) {
    return testRunRepository.findAll({
      limit,
      offset,
      environment,
    });
  }

  return {
    getDashboardSummary,
    getLatestRun,
    getRuns,
    getSuitePerformance,
    getSlowestSuites,
    getRunDetails,
    getDashboard,
  };
}

module.exports = { createObservabilityService };
