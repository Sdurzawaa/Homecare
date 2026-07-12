import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE || "sadam",
  user: process.env.PGUSER || "sadam",
  password: process.env.PGPASSWORD,
  ssl:
    process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
  options: "-c search_path=website_co,public",
});

export default pool;
