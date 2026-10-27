const express = require("express");

const database = require("../database/database");

const {
  createTestRunRepository,
} = require("../repositories/testRunRepository");

const {
  createTestSuiteRepository,
} = require("../repositories/testSuiteRepository");

const {
  createObservabilityService,
} = require("../services/observabilityService");

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const testRunRepository = createTestRunRepository(database);

const testSuiteRepository = createTestSuiteRepository(database);

const observabilityService = createObservabilityService({
  testRunRepository,
  testSuiteRepository,
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "QA Observability Platform",
  });
});

// Dashboard summary
app.get("/api/v1/observability/summary", (req, res) => {
  res.status(200).json(observabilityService.getDashboardSummary());
});

// Latest test execution
app.get("/api/v1/observability/runs/latest", (req, res) => {
  res.status(200).json(observabilityService.getLatestRun());
});

// Test execution history
app.get("/api/v1/observability/runs", (req, res, next) => {
  const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);

  const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);

  const environment = req.query.environment;

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      error: "Limit must be an integer between 1 and 100.",
    });
  }

  if (!Number.isSafeInteger(offset) || offset < 0) {
    return res.status(400).json({
      error: "Offset must be a non-negative integer.",
    });
  }

  if (
    environment !== undefined &&
    (typeof environment !== "string" || environment.trim().length === 0)
  ) {
    return res.status(400).json({
      error: "Environment must be a non-empty string.",
    });
  }

  try {
    const runs = observabilityService.getRuns({
      limit,
      offset,
      environment,
    });

    return res.status(200).json(runs);
  } catch (error) {
    return next(error);
  }
});

// Test execution details
app.get("/api/v1/observability/runs/:id", (req, res, next) => {
  const runId = Number(req.params.id);

  if (!Number.isSafeInteger(runId) || runId <= 0) {
    return res.status(400).json({
      error: "Run ID must be a positive integer.",
    });
  }

  try {
    const result = observabilityService.getRunDetails(runId);

    if (!result) {
      return res.status(404).json({
        error: "Test execution not found.",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

// Suite performance
app.get("/api/v1/observability/suites/performance", (req, res, next) => {
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      error: "Limit must be an integer between 1 and 100.",
    });
  }

  try {
    return res
      .status(200)
      .json(observabilityService.getSuitePerformance({ limit }));
  } catch (error) {
    return next(error);
  }
});

// Slowest suites
app.get("/api/v1/observability/suites/slowest", (req, res, next) => {
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      error: "Limit must be an integer between 1 and 100.",
    });
  }

  try {
    return res
      .status(200)
      .json(observabilityService.getSlowestSuites({ limit }));
  } catch (error) {
    return next(error);
  }
});

// Centralized error handler
app.use((error, req, res, next) => {
  console.error("Observability API error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: "Internal server error.",
  });
});

const server = app.listen(PORT, () => {
  console.log(`QA Observability API running on port ${PORT}`);
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
