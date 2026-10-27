function createTestSuiteRepository(database) {
  function validateRunId(runId) {
    if (!Number.isSafeInteger(runId) || runId <= 0) {
      throw new Error("Run ID must be a positive integer.");
    }
  }

  function validateLimit(limit) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be an integer between 1 and 100.");
    }
  }

  function findByRunId(runId) {
    validateRunId(runId);

    return database
      .prepare(`
        SELECT
          id,
          run_id,
          suite_name,
          spec_file,
          duration_ms,
          total_tests,
          passed_tests,
          failed_tests,
          pending_tests,
          skipped_tests
        FROM test_suites
        WHERE run_id = ?
        ORDER BY duration_ms DESC
      `)
      .all(runId);
  }

  function getPerformance({ limit = 10 } = {}) {
    validateLimit(limit);

    return database
      .prepare(`
        SELECT
          suite_name,
          COUNT(*) AS executions,
          SUM(total_tests) AS total_tests,
          SUM(passed_tests) AS passed_tests,
          SUM(failed_tests) AS failed_tests,

          ROUND(
            AVG(duration_ms) / 1000.0,
            2
          ) AS avg_duration_seconds,

          ROUND(
            MAX(duration_ms) / 1000.0,
            2
          ) AS max_duration_seconds

        FROM test_suites

        GROUP BY suite_name

        ORDER BY avg_duration_seconds DESC

        LIMIT ?
      `)
      .all(limit);
  }

  function findSlowest({ limit = 10 } = {}) {
    validateLimit(limit);

    return database
      .prepare(`
        SELECT
          s.id,
          s.run_id,
          r.run_uuid,
          r.environment,
          r.started_at,
          s.suite_name,
          s.spec_file,
          s.duration_ms,
          s.total_tests,
          s.passed_tests,
          s.failed_tests

        FROM test_suites AS s

        INNER JOIN test_runs AS r
          ON r.id = s.run_id

        ORDER BY s.duration_ms DESC

        LIMIT ?
      `)
      .all(limit);
  }

  return {
    findByRunId,
    getPerformance,
    findSlowest,
  };
}

module.exports = { createTestSuiteRepository };