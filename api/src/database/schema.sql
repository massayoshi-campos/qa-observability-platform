CREATE TABLE IF NOT EXISTS test_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_uuid TEXT NOT NULL UNIQUE,
    environment TEXT NOT NULL,
    started_at TEXT,
    finished_at TEXT,
    total_duration_ms INTEGER NOT NULL DEFAULT 0,
    total_tests INTEGER NOT NULL DEFAULT 0,
    passed_tests INTEGER NOT NULL DEFAULT 0,
    failed_tests INTEGER NOT NULL DEFAULT 0,
    pending_tests INTEGER NOT NULL DEFAULT 0,
    skipped_tests INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_suites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,
    suite_name TEXT NOT NULL,
    spec_file TEXT,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    total_tests INTEGER NOT NULL DEFAULT 0,
    passed_tests INTEGER NOT NULL DEFAULT 0,
    failed_tests INTEGER NOT NULL DEFAULT 0,
    pending_tests INTEGER NOT NULL DEFAULT 0,
    skipped_tests INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (run_id) REFERENCES test_runs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_test_runs_environment
    ON test_runs(environment);

CREATE INDEX IF NOT EXISTS idx_test_runs_started_at
    ON test_runs(started_at);

CREATE INDEX IF NOT EXISTS idx_test_suites_run_id
    ON test_suites(run_id);