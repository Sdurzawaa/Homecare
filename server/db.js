import { Pool } from "pg";
import dotenv from "dotenv";
import { resolveSchemaName } from "./utils.js";

dotenv.config();

const schemaName = resolveSchemaName(process.env.PGSCHEMA);

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE || "sadam",
  user: process.env.PGUSER || "sadam",
  password: process.env.PGPASSWORD,
  ssl:
    process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
  options: `-c search_path=${schemaName}`,
});

export default pool;
