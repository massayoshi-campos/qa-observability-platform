const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const databaseDirectory = path.resolve(__dirname, "../../database");

fs.mkdirSync(databaseDirectory, { recursive: true });

const databasePath = path.join(
  databaseDirectory,
  "qa-observability.db"
);

const database = new Database(databasePath);

database.pragma("foreign_keys = ON");
database.pragma("journal_mode = WAL");

const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

database.exec(schema);

module.exports = database;