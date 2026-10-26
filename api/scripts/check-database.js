const database = require("../src/database/database");

try {
  const tables = database
    .prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `)
    .all();

  console.log("Database initialized successfully.");
  console.log("Tables:", tables.map((table) => table.name));
} finally {
  database.close();
}