function createTestRunRepository(database) {
  function validateId(id) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Run ID must be a positive integer.");
    }
  }

  function validatePagination(limit, offset) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be an integer between 1 and 100.");
    }

    if (!Number.isSafeInteger(offset) || offset < 0) {
      throw new Error("Offset must be a non-negative integer.");
    }
  }

  function findAll({ limit = 20, offset = 0, environment } = {}) {
    validatePagination(limit, offset);

    const conditions = [];
    const parameters = { limit, offset };

    if (environment !== undefined) {
      if (typeof environment !== "string" || environment.trim().length === 0) {
        throw new Error("Environment must be a non-empty string.");
      }

      conditions.push("environment = @environment");
      parameters.environment = environment.toLowerCase();
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    return database
      .prepare(
        `
        SELECT
          id,
          run_uuid,
          environment,
          started_at,
          finished_at,
          total_duration_ms,
          total_tests,
          passed_tests,
          failed_tests,
          pending_tests,
          skipped_tests,
          created_at
        FROM test_runs
        ${whereClause}
        ORDER BY id DESC
        LIMIT @limit OFFSET @offset
      `,
      )
      .all(parameters);
  }

  function findById(id) {
    validateId(id);

    return database
      .prepare(
        `
        SELECT *
        FROM test_runs
        WHERE id = ?
      `,
      )
      .get(id);
  }

  function findLatest() {
    return database
      .prepare(
        `
        SELECT *
        FROM test_runs
        ORDER BY id DESC
        LIMIT 1
      `,
      )
      .get();
  }

  function getSummary() {
    return database
      .prepare(
        `
        SELECT
          COUNT(*) AS total_runs,
          COALESCE(SUM(total_tests), 0) AS total_tests,
          COALESCE(SUM(passed_tests), 0) AS passed_tests,
          COALESCE(SUM(failed_tests), 0) AS failed_tests,
          COALESCE(SUM(pending_tests), 0) AS pending_tests,
          COALESCE(SUM(skipped_tests), 0) AS skipped_tests,

          COALESCE(
  ROUND(
    100.0 * SUM(passed_tests)
    / NULLIF(SUM(total_tests), 0),
    2
  ),
  0
) AS pass_rate_percent,

          ROUND(
            AVG(total_duration_ms) / 1000.0,
            2
          ) AS avg_duration_seconds

        FROM test_runs
      `,
      )
      .get();
  }

  return {
    findAll,
    findById,
    findLatest,
    getSummary,
  };
}

module.exports = { createTestRunRepository };
