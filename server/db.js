import { Pool } from "pg";
import dotenv from "dotenv";
import { buildSearchPath, resolveSchemaName } from "./utils.js";

dotenv.config();

const schemaName = resolveSchemaName(process.env.PGSCHEMA);

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE || "sadam",
  user: process.env.PGUSER || "sadam",
  password: process.env.PGPASSWORD,
  max: Number(process.env.PGPOOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_TIMEOUT || 30000),
  connectionTimeoutMillis: Number(
    process.env.PGPOOL_CONNECTION_TIMEOUT || 5000,
  ),
  ssl:
    process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
  ...(schemaName === "public"
    ? {}
    : { options: `-c search_path=${buildSearchPath(schemaName)}` }),
});

export default pool;
