import { Pool } from "pg";
import dotenv from "dotenv";
import { buildSearchPath, resolveSchemaName } from "./utils.js";

dotenv.config();

const schemaName = resolveSchemaName(process.env.PGSCHEMA);
const isNeon = Boolean(
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.PGHOST?.includes("neon.tech"),
);

const searchPathOption =
  schemaName === "public"
    ? {}
    : { options: `-c search_path=${buildSearchPath(schemaName)}` };

const pool =
  process.env.DATABASE_URL || process.env.POSTGRES_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
        max: Number(process.env.PGPOOL_MAX || 1),
        idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_TIMEOUT || 30000),
        connectionTimeoutMillis: Number(
          process.env.PGPOOL_CONNECTION_TIMEOUT || 5000,
        ),
        ssl: { rejectUnauthorized: false },
        ...searchPathOption,
      })
    : new Pool({
        host: process.env.PGHOST || "localhost",
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        database: process.env.PGDATABASE || "sadam",
        user: process.env.PGUSER || "sadam",
        password: process.env.PGPASSWORD,
        max: Number(process.env.PGPOOL_MAX || 1),
        idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_TIMEOUT || 30000),
        connectionTimeoutMillis: Number(
          process.env.PGPOOL_CONNECTION_TIMEOUT || 5000,
        ),
        ssl:
          isNeon || process.env.PGSSLMODE === "require"
            ? { rejectUnauthorized: false }
            : false,
        ...searchPathOption,
      });

export default pool;
