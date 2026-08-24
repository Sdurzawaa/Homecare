import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import multer from "multer";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import pool from "./db.js";
import { createCsrfToken, validateCsrfToken } from "./csrf.js";
import {
  isValidAdminPassword,
  isValidAdminUsername,
  normalizeAdminUsername,
  quoteIdent,
  resolveSchemaName,
  withSchema,
} from "./utils.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const resolveTrustProxy = () => {
  const raw = process.env.TRUST_PROXY;
  if (raw === undefined || raw === "") return 1;
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^\d+$/.test(raw)) return Number(raw);
  return 1;
};
app.set("trust proxy", resolveTrustProxy());
const isProduction =
  process.env.NODE_ENV === "production" ||
  ["preview", "production"].includes(process.env.VERCEL_ENV);
const requiredProductionSecrets = ["ADMIN_SESSION_SECRET", "ADMIN_JWT_SECRET"];

if (
  isProduction &&
  requiredProductionSecrets.some(
    (name) => !process.env[name] || process.env[name].length < 16,
  )
) {
  throw new Error(
    "Production requires explicit ADMIN secrets with at least 16 characters",
  );
}

const schemaName = resolveSchemaName(process.env.PGSCHEMA);
const table = (name) => {
  if (!name || typeof name !== "string") return name;

  const trimmed = name.trim();
  if (!trimmed || trimmed.includes(".")) return trimmed;

  return withSchema(trimmed, schemaName);
};
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET;
const adminJwtSecret = process.env.ADMIN_JWT_SECRET;

const adminUsername = normalizeAdminUsername(process.env.ADMIN_USERNAME);
const adminPassword = process.env.ADMIN_PASSWORD;

if (
  !adminSessionSecret ||
  !adminJwtSecret ||
  !isValidAdminUsername(adminUsername) ||
  !isValidAdminPassword(adminPassword)
) {
  throw new Error(
    "ADMIN_USERNAME must contain only letters, numbers, underscores, or dashes; ADMIN_PASSWORD must be at least 12 characters with uppercase, lowercase, and a number; ADMIN_SESSION_SECRET and ADMIN_JWT_SECRET are also required",
  );
}
const createAdminJwt = (username = adminUsername) =>
  jwt.sign(
    {
      username,
      type: "admin",
      jti: `${Date.now()}-${crypto.randomUUID()}`,
    },
    adminJwtSecret,
    {
      expiresIn: "12h",
    },
  );

const verifyAdminJwt = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, adminJwtSecret);
  } catch {
    return null;
  }
};

const verifyAdminCredentials = async (username, password) => {
  const normalizedUsername = normalizeAdminUsername(username);
  const normalizedPassword = typeof password === "string" ? password : "";

  if (!normalizedUsername || !normalizedPassword) {
    return { valid: false, username: null };
  }

  try {
    const result = await pool.query(
      `SELECT username, password_hash FROM ${table("admin_users")} WHERE LOWER(username) = $1 LIMIT 1`,
      [normalizedUsername],
    );

    const user = result.rows[0];
    if (!user || !user.password_hash) {
      return { valid: false, username: null };
    }

    const isPasswordValid = await bcrypt.compare(
      normalizedPassword,
      user.password_hash,
    );
    return { valid: isPasswordValid, username: user.username };
  } catch (error) {
    console.error("Admin credential verification failed", error);
    return { valid: false, username: null };
  }
};

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "homecare-uploads",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ]);
    const allowedExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(
      file.originalname,
    );
    if (allowedExtension && allowedTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format gambar tidak didukung"));
    }
  },
});

const defaultSections = {
  hero: {
    section_name: "Hero",
    title: "Kenyamanan Perawatan Medis di Rumah Anda",
    description:
      "Menghadirkan tenaga profesional medis berpengalaman untuk merawat orang terkasih dengan penuh kasih sayang dan kenyamanan maksimal.",
    image: "/Person.jpg",
    badge: "Dipercaya 1000+ keluarga",
    cta_label: "Konsultasi Gratis",
    cta_link: "#contact",
    secondary_cta_label: "Lihat Layanan",
    secondary_cta_link: "#services",
  },
  about: {
    section_name: "Tentang Kami",
    title: "Homecare modern untuk kebutuhan kesehatan keluarga",
    description:
      "Tim kami terlatih dan berpengalaman dalam memberikan perawatan terbaik untuk lansia, ibu hamil, dan pasien pemulihan dengan sentuhan personal.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    image_2:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    image_3:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80",
  },
  contact: {
    section_name: "Kontak",
    title: "Siap membantu kebutuhan kesehatan keluarga Anda",
    description:
      "Kami siap memberikan dukungan medis profesional di rumah dengan cara yang aman, cepat, dan nyaman.",
    phone: "+62 858-9200-6905",
    email: "bidanrismacare@gmail.com",
    address: "Jl. Kebon Mangga 1 No. 1 Rt 006/007 Cipulir, Kebayoran lama",
    button_label: "Chat via WhatsApp",
    button_link: "https://wa.me/6285892006905",
  },
  footer: {
    section_name: "Footer",
    brand: "Homecare",
    description:
      "Solusi perawatan kesehatan profesional di kenyamanan rumah Anda. Berkualitas, tepercaya, dan penuh kasih sayang.",
    phone: "+62 857-7378-0406",
    address: "AKR Tower Jl. Panjang No.5 Level M, Jakarta Barat, Indonesia",
  },
};

const normalizeSection = (sectionKey, payload = {}) => {
  const defaults = defaultSections[sectionKey] || {};
  return {
    section_key: sectionKey,
    section_name: payload.section_name || defaults.section_name || sectionKey,
    title: payload.title ?? defaults.title ?? "",
    description: payload.description ?? defaults.description ?? "",
    image: payload.image ?? defaults.image ?? "",
    image_2: payload.image_2 ?? defaults.image_2 ?? "",
    image_3: payload.image_3 ?? defaults.image_3 ?? "",
    badge: payload.badge ?? defaults.badge ?? "",
    cta_label: payload.cta_label ?? defaults.cta_label ?? "",
    cta_link: payload.cta_link ?? defaults.cta_link ?? "",
    secondary_cta_label:
      payload.secondary_cta_label ?? defaults.secondary_cta_label ?? "",
    secondary_cta_link:
      payload.secondary_cta_link ?? defaults.secondary_cta_link ?? "",
    phone: payload.phone ?? defaults.phone ?? "",
    email: payload.email ?? defaults.email ?? "",
    address: payload.address ?? defaults.address ?? "",
    button_label: payload.button_label ?? defaults.button_label ?? "",
    button_link: payload.button_link ?? defaults.button_link ?? "",
    brand: payload.brand ?? defaults.brand ?? "Homecare",
  };
};

async function ensureAdminUsersTable() {
  // Ensure the schema exists. Use quoted identifier for mixed-case names.
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(schemaName)};`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${table("admin_users")} (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const existing = await pool.query(
    `SELECT username FROM ${table("admin_users")} WHERE username = $1 LIMIT 1`,
    [adminUsername],
  );

  if (existing.rowCount === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await pool.query(
      `INSERT INTO ${table("admin_users")} (username, password_hash)
       VALUES ($1, $2)`,
      [adminUsername, passwordHash],
    );
  }
}

async function ensureAdminSessionsTable() {
  // Ensure the schema exists. Use quoted identifier for mixed-case names.
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(schemaName)};`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${table("admin_sessions")} (
      id SERIAL PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT,
      device_fingerprint TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      FOREIGN KEY (username) REFERENCES ${table("admin_users")}(username) ON DELETE CASCADE
    );
  `);

  // Create index untuk faster lookups
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON ${table("admin_sessions")}(token);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_session_id ON ${table("admin_sessions")}(session_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_username ON ${table("admin_sessions")}(username);
  `);

  // Clean up expired sessions setiap hari
  await pool.query(`
    DELETE FROM ${table("admin_sessions")} WHERE expires_at < NOW();
  `);
}

async function ensureSiteSectionsTable() {
  // Ensure the schema exists. Use quoted identifier for mixed-case names.
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(schemaName)};`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${table("site_sections")} (
      section_key TEXT PRIMARY KEY,
      section_name TEXT NOT NULL,
      title TEXT,
      description TEXT,
      image TEXT,
      image_2 TEXT,
      image_3 TEXT,
      badge TEXT,
      cta_label TEXT,
      cta_link TEXT,
      secondary_cta_label TEXT,
      secondary_cta_link TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      button_label TEXT,
      button_link TEXT,
      brand TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  for (const [sectionKey, section] of Object.entries(defaultSections)) {
    const row = normalizeSection(sectionKey, section);
    await pool.query(
      `INSERT INTO ${table("site_sections")}
       (section_key, section_name, title, description, image, image_2, image_3, badge, cta_label, cta_link, secondary_cta_label, secondary_cta_link, phone, email, address, button_label, button_link, brand, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
       ON CONFLICT (section_key) DO NOTHING`,
      [
        row.section_key,
        row.section_name,
        row.title,
        row.description,
        row.image,
        row.image_2,
        row.image_3,
        row.badge,
        row.cta_label,
        row.cta_link,
        row.secondary_cta_label,
        row.secondary_cta_link,
        row.phone,
        row.email,
        row.address,
        row.button_label,
        row.button_link,
        row.brand,
      ],
    );
  }
}

async function ensureCatalogTables() {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(schemaName)};`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${table("pricing")} (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price INTEGER NOT NULL,
      recommended BOOLEAN NOT NULL DEFAULT false
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${table("pricing_categories")} (
      id SERIAL PRIMARY KEY,
      category TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${table("testimoni")} (
      id_testi SERIAL PRIMARY KEY,
      teks TEXT NOT NULL,
      author TEXT NOT NULL,
      latarbelakang TEXT NOT NULL,
      initial TEXT NOT NULL
    );
  `);
  await pool.query(
    `SELECT setval(
       pg_get_serial_sequence($1, $2),
       COALESCE(MAX(id_testi), 0) + 1,
       false
     )
     FROM ${table("testimoni")}`,
    [`${schemaName}.testimoni`, "id_testi"],
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_pricing_category ON ${table("pricing")}(category);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_pricing_recommended ON ${table("pricing")}(recommended DESC, id);`,
  );
}

await ensureAdminUsersTable();
await Promise.all([
  ensureAdminSessionsTable(),
  ensureSiteSectionsTable(),
  ensureCatalogTables(),
]);

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,https://nurserisma.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .map((origin) => {
    try {
      const url = new URL(origin);
      return `${url.protocol}//${url.host}`;
    } catch {
      return "";
    }
  })
  .filter(Boolean);
const isAllowedOrigin = (origin) =>
  allowedOrigins.includes(origin) ||
  /^https:\/\/nurserisma-[a-z0-9-]+\.vercel\.app$/i.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Invalid CORS origin"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 204,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.path === "/health",
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
});

const failedLoginAttempts = new Map();
const failedLoginWindowMs = 15 * 60 * 1000;
const failedLoginBlockMs = 5 * 60 * 1000;

const getFailedLoginKey = (username) => normalizeAdminUsername(username) || "";

const cleanupFailedLogins = () => {
  const now = Date.now();
  for (const [key, value] of failedLoginAttempts.entries()) {
    if (now - value.firstAttempt > failedLoginWindowMs) {
      failedLoginAttempts.delete(key);
    }
  }
};

setInterval(cleanupFailedLogins, 60 * 1000);

const isUsernameLoginBlocked = (username) => {
  const key = getFailedLoginKey(username);
  if (!key) return false;

  const entry = failedLoginAttempts.get(key);
  if (!entry) return false;

  const now = Date.now();
  if (now - entry.firstAttempt > failedLoginWindowMs) {
    failedLoginAttempts.delete(key);
    return false;
  }

  if (entry.count >= 5 && now - entry.lastAttempt < failedLoginBlockMs) {
    return true;
  }

  return false;
};

const recordFailedLogin = (username) => {
  const key = getFailedLoginKey(username);
  if (!key) return;

  const now = Date.now();
  const existing = failedLoginAttempts.get(key);

  if (existing) {
    existing.count += 1;
    existing.lastAttempt = now;
    failedLoginAttempts.set(key, existing);
    return;
  }

  failedLoginAttempts.set(key, {
    count: 1,
    firstAttempt: now,
    lastAttempt: now,
  });
};

const clearFailedLogin = (username) => {
  const key = getFailedLoginKey(username);
  if (key) {
    failedLoginAttempts.delete(key);
  }
};

// Helper: Get client IP address
const getClientIp = (req) => {
  return req.ip || req.socket.remoteAddress || "unknown";
};

// Helper: Create device fingerprint dari user-agent
const getDeviceFingerprint = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  return crypto.createHash("sha256").update(userAgent).digest("hex");
};

// Helper: Create admin session di database
const createAdminSession = async (username, token, req, res) => {
  const sessionId = crypto.randomUUID(); // Generate unique session ID
  const ipAddress = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "unknown";
  const deviceFingerprint = getDeviceFingerprint(req);
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours

  try {
    // Delete old sessions untuk enforce 1 session per account
    // Use LOWER() untuk case-insensitive username matching
    await pool.query(
      `DELETE FROM ${table("admin_sessions")} WHERE LOWER(username) = LOWER($1)`,
      [username],
    );

    // Insert session baru dengan session_id
    await pool.query(
      `INSERT INTO ${table("admin_sessions")} (session_id, username, token, ip_address, user_agent, device_fingerprint, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        sessionId,
        username,
        token,
        ipAddress,
        userAgent,
        deviceFingerprint,
        expiresAt,
      ],
    );

    // Set httpOnly cookie dengan session_id
    // httpOnly = tidak bisa diakses dari JavaScript, hanya browser yang kirim otomatis
    // secure = hanya dikirim via HTTPS (dalam production)
    // sameSite = prevent CSRF attacks

    res.cookie("admin_session_id", sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 12 * 60 * 60 * 1000,
      path: "/",
    });
    res.cookie("admin_auth_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 12 * 60 * 60 * 1000,
      path: "/",
    });

    const csrfToken = createCsrfToken();
    res.cookie("csrf_token", csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 12 * 60 * 60 * 1000,
      path: "/",
    });

    return true;
  } catch (error) {
    console.error("Error creating admin session:", error);
    return false;
  }
};

// Helper: Validate admin session dari database
const validateAdminSession = async (token, req) => {
  if (!token) return null;

  try {
    // Verify JWT first
    const jwtPayload = verifyAdminJwt(token);
    if (!jwtPayload) return null;

    // Get session_id dari httpOnly cookie
    const sessionId = req.cookies?.admin_session_id;
    if (!sessionId) {
      console.warn("Session validation failed: no session_id cookie found");
      return null;
    }

    // Check if session exists di database dengan BOTH token dan session_id
    const result = await pool.query(
      `SELECT id, username, ip_address, device_fingerprint, user_agent, expires_at 
       FROM ${table("admin_sessions")} 
       WHERE token = $1 AND session_id = $2 AND expires_at > NOW() 
       LIMIT 1`,
      [token, sessionId],
    );

    if (result.rows.length === 0) {
      return null; // Session tidak ada atau sudah expired
    }

    const session = result.rows[0];
    const currentIp = getClientIp(req);
    const currentFingerprint = getDeviceFingerprint(req);

    // Validation: Check IP dan device fingerprint match
    if (session.ip_address !== currentIp) {
      console.warn(
        `Session security: IP mismatch for user ${session.username}. Stored: ${session.ip_address}, Current: ${currentIp}`,
      );
      // Delete session karena IP berbeda (mungkin attacker)
      await pool.query(`DELETE FROM ${table("admin_sessions")} WHERE id = $1`, [
        session.id,
      ]);
      return null;
    }

    if (session.device_fingerprint !== currentFingerprint) {
      console.warn(
        `Session security: Device fingerprint mismatch for user ${session.username}. Stored: ${session.device_fingerprint}, Current: ${currentFingerprint}`,
      );
      // Delete session karena device berbeda
      await pool.query(`DELETE FROM ${table("admin_sessions")} WHERE id = $1`, [
        session.id,
      ]);
      return null;
    }

    return jwtPayload; // Session valid
  } catch (error) {
    console.error("Error validating admin session:", error);
    return null;
  }
};

// Helper: Delete admin session
const deleteAdminSession = async (token) => {
  try {
    await pool.query(
      `DELETE FROM ${table("admin_sessions")} WHERE token = $1`,
      [token],
    );
  } catch (error) {
    console.error("Error deleting admin session:", error);
  }
};

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const requireAdminAuth = async (req, res, next) => {
  const token = req.cookies?.admin_auth_token || "";

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const jwtPayload = await validateAdminSession(token, req);
  if (jwtPayload) {
    req.adminUser = jwtPayload;
    return next();
  }

  return res
    .status(401)
    .json({ error: "Unauthorized - Session tidak valid atau sudah berakhir" });
};

const requireCsrfToken = (req, res, next) => {
  const method = (req.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next();
  }

  const rawHeader = req.headers["x-csrf-token"];
  const cookieToken = req.cookies?.csrf_token || "";
  const headerToken = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader || "";

  if (!validateCsrfToken(cookieToken, headerToken)) {
    return res.status(403).json({ error: "CSRF token tidak valid" });
  }

  return next();
};

const validateNumericIdParam = (req, res, next) => {
  const id = req.params.id ?? req.params.id_testi;
  if (!/^[0-9]+$/.test(String(id))) {
    return res.status(400).json({ error: "ID tidak valid" });
  }
  next();
};

const validateTestimoniPayload = (req, res, next) => {
  const { teks, author, latarBelakang, latarbelakang, initial } =
    req.body || {};
  const resolvedLatarBelakang = (
    latarBelakang ??
    latarbelakang ??
    ""
  ).toString();

  if (
    !isObject(req.body) ||
    typeof teks !== "string" ||
    teks.trim() === "" ||
    typeof author !== "string" ||
    author.trim() === "" ||
    typeof resolvedLatarBelakang !== "string" ||
    resolvedLatarBelakang.trim() === "" ||
    typeof initial !== "string" ||
    initial.trim() === ""
  ) {
    return res.status(400).json({ error: "Payload testimoni tidak valid" });
  }

  req.body.latarBelakang = resolvedLatarBelakang.trim();
  req.body.latarbelakang = resolvedLatarBelakang.trim();

  next();
};

const validatePricingPayload = (req, res, next) => {
  const { category, title, description, image, duration, price, recommended } =
    req.body || {};

  const isDurationValid =
    typeof duration === "number" ||
    (typeof duration === "string" &&
      duration.trim() !== "" &&
      !Number.isNaN(Number(duration)));
  const isPriceValid =
    typeof price === "number" ||
    (typeof price === "string" &&
      price.trim() !== "" &&
      !Number.isNaN(Number(price)));

  if (
    !isObject(req.body) ||
    typeof category !== "string" ||
    category.trim() === "" ||
    typeof title !== "string" ||
    title.trim() === "" ||
    typeof description !== "string" ||
    description.trim() === "" ||
    typeof image !== "string" ||
    image.trim() === "" ||
    !isDurationValid ||
    !isPriceValid ||
    typeof recommended !== "boolean"
  ) {
    return res.status(400).json({ error: "Payload pricing tidak valid" });
  }

  next();
};

app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser()); // Parse cookies from requests
app.use("/api/public", (req, res, next) => {
  if (req.path === "/site-sections") {
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  }
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/admin/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  const normalizedUsername = normalizeAdminUsername(username);

  if (isUsernameLoginBlocked(normalizedUsername)) {
    return res.status(429).json({
      error: "Terlalu banyak percobaan login. Coba lagi nanti.",
    });
  }

  const credentialResult = await verifyAdminCredentials(username, password);

  if (!credentialResult.valid) {
    recordFailedLogin(normalizedUsername);
    return res.status(401).json({ error: "Username atau password salah" });
  }

  clearFailedLogin(normalizedUsername);

  const resolvedUsername = credentialResult.username || adminUsername;
  const jwtToken = createAdminJwt(resolvedUsername);
  const csrfToken = createCsrfToken();

  const sessionCreated = await createAdminSession(
    resolvedUsername,
    jwtToken,
    req,
    res,
  );

  if (!sessionCreated) {
    return res.status(500).json({
      error: "Gagal membuat session admin. Silakan coba lagi.",
    });
  }

  res.cookie("csrf_token", csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 12 * 60 * 60 * 1000,
    path: "/",
  });

  return res.json({
    user: resolvedUsername,
    message: "Login berhasil",
    csrfToken,
  });
});

// Logout endpoint
app.post(
  "/api/admin/logout",
  requireAdminAuth,
  requireCsrfToken,
  async (req, res) => {
    const token = req.cookies?.admin_auth_token || "";

    try {
      await pool.query(
        `DELETE FROM ${table("admin_sessions")}
       WHERE token = $1`,
        [token],
      );
    } catch (error) {
      console.error("Error while logging out admin:", error);
    }

    res.clearCookie("admin_session_id", {
      path: "/",
    });
    res.clearCookie("admin_auth_token", {
      path: "/",
    });
    res.clearCookie("csrf_token", {
      path: "/",
    });

    return res.json({
      message: "Logout berhasil",
    });
  },
);

// Create new admin user endpoint
app.post(
  "/api/admin/create-user",
  requireAdminAuth,
  requireCsrfToken,
  async (req, res) => {
    const { username, password } = req.body || {};

    // Validation
    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ error: "Username tidak boleh kosong" });
    }

    if (!isValidAdminPassword(password)) {
      return res.status(400).json({
        error:
          "Password minimal 12 karakter dan harus mengandung huruf besar, huruf kecil, serta angka",
      });
    }

    const trimmedUsername = normalizeAdminUsername(username);

    try {
      // Check if user already exists
      const existing = await pool.query(
        `SELECT username FROM ${table("admin_users")} WHERE LOWER(username) = $1 LIMIT 1`,
        [trimmedUsername],
      );

      if (existing.rowCount > 0) {
        return res.status(409).json({ error: "Username sudah terdaftar" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Insert new user
      const result = await pool.query(
        `INSERT INTO ${table("admin_users")} (username, password_hash)
       VALUES ($1, $2)
       RETURNING username, created_at`,
        [trimmedUsername, passwordHash],
      );

      const newUser = result.rows[0];

      return res.status(201).json({
        message: "User berhasil ditambahkan",
        user: {
          username: newUser.username,
          created_at: newUser.created_at,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Gagal membuat user" });
    }
  },
);

app.get("/api/public/site-sections", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ${table("site_sections")} ORDER BY section_key ASC`,
    );

    const sections = Object.fromEntries(
      result.rows.map((row) => [row.section_key, row]),
    );

    return res.json({
      ...defaultSections,
      ...sections,
    });
  } catch (error) {
    console.error("GET /api/public/site-sections error", error);
    return res.status(500).json({ error: "Gagal mengambil data section" });
  }
});

app.get("/api/admin/site-sections", requireAdminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ${table("site_sections")} ORDER BY section_key ASC`,
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("GET /api/admin/site-sections error", error);
    return res.status(500).json({ error: "Gagal mengambil data section" });
  }
});

app.put(
  "/api/admin/site-sections/:sectionKey",
  requireAdminAuth,
  requireCsrfToken,
  async (req, res) => {
    const { sectionKey } = req.params;

    try {
      const existingResult = await pool.query(
        `SELECT * FROM ${table("site_sections")} WHERE section_key = $1 LIMIT 1`,
        [sectionKey],
      );
      const existingSection = existingResult.rows[0] || {};
      const payload = normalizeSection(sectionKey, {
        ...existingSection,
        ...(req.body || {}),
      });

      const result = await pool.query(
        `INSERT INTO ${table("site_sections")}
       (section_key, section_name, title, description, image, image_2, image_3, badge, cta_label, cta_link, secondary_cta_label, secondary_cta_link, phone, email, address, button_label, button_link, brand, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
       ON CONFLICT (section_key) DO UPDATE SET
         section_name = EXCLUDED.section_name,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         image = EXCLUDED.image,
         image_2 = EXCLUDED.image_2,
         image_3 = EXCLUDED.image_3,
         badge = EXCLUDED.badge,
         cta_label = EXCLUDED.cta_label,
         cta_link = EXCLUDED.cta_link,
         secondary_cta_label = EXCLUDED.secondary_cta_label,
         secondary_cta_link = EXCLUDED.secondary_cta_link,
         phone = EXCLUDED.phone,
         email = EXCLUDED.email,
         address = EXCLUDED.address,
         button_label = EXCLUDED.button_label,
         button_link = EXCLUDED.button_link,
         brand = EXCLUDED.brand,
         updated_at = NOW()
       RETURNING *`,
        [
          payload.section_key,
          payload.section_name,
          payload.title,
          payload.description,
          payload.image,
          payload.image_2,
          payload.image_3,
          payload.badge,
          payload.cta_label,
          payload.cta_link,
          payload.secondary_cta_label,
          payload.secondary_cta_link,
          payload.phone,
          payload.email,
          payload.address,
          payload.button_label,
          payload.button_link,
          payload.brand,
        ],
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error("PUT /api/admin/site-sections error", error);
      return res.status(500).json({ error: "Gagal menyimpan section" });
    }
  },
);

// Read all testimoni (public)
app.get("/api/public/testimoni", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
       id_testi,
       teks, 
       author, 
       latarbelakang, 
       initial 
      FROM ${table("testimoni")} ORDER BY id_testi ASC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/public/testimoni error", error);
    res.status(500).json({ error: "Gagal mengambil data testimoni" });
  }
});

// Read all testimoni (admin only)
app.get("/api/testimoni", requireAdminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
       id_testi,
       teks, 
       author, 
       latarbelakang, 
       initial 
      FROM ${table("testimoni")} ORDER BY id_testi ASC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/testimoni error", error);
    res.status(500).json({ error: "Gagal mengambil data testimoni" });
  }
});

// Read single testimoni (public)
app.get(
  "/api/testimoni/:id_testi",
  validateNumericIdParam,
  async (req, res) => {
    const { id_testi } = req.params;
    try {
      const result = await pool.query(
        `SELECT 
        id_testi,
        teks,
        author,
        latarbelakang,
        initial 
      FROM ${table("testimoni")} WHERE id_testi = $1`,
        [id_testi],
      );
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "testimoni card tidak ditemukan" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("GET /api/testimoni/:id error", error);
      res.status(500).json({ error: "Gagal mengambil testimoni" });
    }
  },
);

// Create testimoni card (admin only)
app.post(
  "/api/testimoni",
  requireAdminAuth,
  requireCsrfToken,
  validateTestimoniPayload,
  async (req, res) => {
    const { teks, author, latarBelakang, latarbelakang, initial } = req.body;
    const resolvedLatarBelakang = (latarBelakang ?? latarbelakang ?? "").trim();

    try {
      const result = await pool.query(
        `INSERT INTO ${table("testimoni")} (
        teks,
        author,
        latarbelakang,
        initial )
       VALUES ($1, $2, $3, $4)
       RETURNING id_testi, teks, author, latarbelakang, initial`,
        [teks, author, resolvedLatarBelakang, initial],
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("POST /api/testimoni error", error);
      res.status(500).json({ error: "Gagal membuat testimoni card" });
    }
  },
);

// Update testimoni card (admin only)
app.put(
  "/api/testimoni/:id_testi",
  requireAdminAuth,
  requireCsrfToken,
  validateNumericIdParam,
  validateTestimoniPayload,
  async (req, res) => {
    const { id_testi } = req.params;
    const { teks, author, latarBelakang, latarbelakang, initial } = req.body;
    const resolvedLatarBelakang = (latarBelakang ?? latarbelakang ?? "").trim();

    try {
      const result = await pool.query(
        `UPDATE ${table("testimoni")}
       SET teks = $1,
           author = $2,
           latarbelakang = $3,
           initial = $4
       WHERE id_testi = $5
       RETURNING id_testi, teks, author, latarbelakang, initial`,
        [teks, author, resolvedLatarBelakang, initial, id_testi],
      );
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "testimoni card tidak ditemukan" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("PUT /api/testimoni/:id_testi error", error);
      res.status(500).json({ error: "Gagal mengupdate testimoni card" });
    }
  },
);

// Delete testimoni card (admin only)
app.delete(
  "/api/testimoni/:id_testi",
  requireAdminAuth,
  requireCsrfToken,
  validateNumericIdParam,
  async (req, res) => {
    const { id_testi } = req.params;
    try {
      const result = await pool.query(
        `DELETE FROM ${table("testimoni")} WHERE id_testi = $1 RETURNING id_testi`,
        [id_testi],
      );
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "testimoni card tidak ditemukan" });
      }
      res.json({ message: "testimoni card berhasil dihapus" });
    } catch (error) {
      console.error("DELETE /api/testimoni/:id_testi error", error);
      res.status(500).json({ error: "Gagal menghapus testimoni card" });
    }
  },
);

// Read all pricing (public)
app.get("/api/public/pricing", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, category, title, description, image, duration, price, recommended FROM ${table("pricing")} ORDER BY id ASC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/public/pricing error", error);
    res.status(500).json({ error: "Gagal mengambil data pricing" });
  }
});

// Read all pricing categories (public)
app.get("/api/public/pricing-categories", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, category, title, description FROM ${table("pricing_categories")} ORDER BY id ASC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/public/pricing-categories error", error);
    res.status(500).json({ error: "Gagal mengambil data kategori pricing" });
  }
});

// Search pricing cards by category and query (public)
app.get("/api/public/pricing/search", async (req, res) => {
  try {
    const { category, q } = req.query;
    const conditions = [];
    const params = [];

    if (category && category !== "Semua") {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (q && typeof q === "string" && q.trim() !== "") {
      params.push(`%${q.trim()}%`);
      const paramNum = params.length;
      conditions.push(
        `(title ILIKE $${paramNum} OR description ILIKE $${paramNum})`,
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT id, category, title, description, image, duration, price, recommended FROM ${table("pricing")} ${whereClause} ORDER BY recommended DESC, title ASC`,
      params,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/public/pricing/search error", error);
    res.status(500).json({ error: "Gagal mencari data pricing" });
  }
});

// Read all pricing (admin only)
app.get("/api/pricing", requireAdminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, category, title, description, image, duration, price, recommended FROM ${table("pricing")} ORDER BY id ASC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/pricing error", error);
    res.status(500).json({ error: "Gagal mengambil data pricing" });
  }
});

// Read all pricing categories (admin only)
app.get("/api/pricing-categories", requireAdminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, category, title, description FROM ${table("pricing_categories")} ORDER BY id ASC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/pricing-categories error", error);
    res.status(500).json({ error: "Gagal mengambil data kategori pricing" });
  }
});

// Search pricing cards by category and query (admin only)
app.get("/api/pricing/search", requireAdminAuth, async (req, res) => {
  try {
    const { category, q } = req.query;
    const conditions = [];
    const params = [];

    if (category && category !== "Semua") {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (q && typeof q === "string" && q.trim() !== "") {
      params.push(`%${q.trim()}%`);
      const paramNum = params.length;
      conditions.push(
        `(title ILIKE $${paramNum} OR description ILIKE $${paramNum})`,
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT id, category, title, description, image, duration, price, recommended FROM ${table("pricing")} ${whereClause} ORDER BY recommended DESC, title ASC`,
      params,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/pricing/search error", error);
    res.status(500).json({ error: "Gagal mencari data pricing" });
  }
});

// Read single pricing (admin only)
app.get(
  "/api/pricing/:id",
  requireAdminAuth,
  validateNumericIdParam,
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT 
        id,
        category,
        title,
        description,
        image,
        duration,
        price, 
        recommended 
      FROM ${table("pricing")} WHERE id = $1`,
        [id],
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Pricing card tidak ditemukan" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("GET /api/pricing/:id error", error);
      res.status(500).json({ error: "Gagal mengambil pricing" });
    }
  },
);

// Create pricing card (admin only)
app.post(
  "/api/pricing",
  requireAdminAuth,
  requireCsrfToken,
  validatePricingPayload,
  async (req, res) => {
    const {
      category,
      title,
      description,
      image,
      duration,
      price,
      recommended,
    } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO ${table("pricing")} (category, title, description, image, duration, price, recommended)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, category, title, description, image, duration, price, recommended`,
        [category, title, description, image, duration, price, recommended],
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("POST /api/pricing error", error);
      res.status(500).json({ error: "Gagal membuat pricing card" });
    }
  },
);

// Update pricing card (admin only)
app.put(
  "/api/pricing/:id",
  requireAdminAuth,
  requireCsrfToken,
  validateNumericIdParam,
  validatePricingPayload,
  async (req, res) => {
    const { id } = req.params;
    const {
      category,
      title,
      description,
      image,
      duration,
      price,
      recommended,
    } = req.body;
    try {
      const result = await pool.query(
        `UPDATE ${table("pricing")}
       SET category = $1,
           title = $2,
           description = $3,
           image = $4,
           duration = $5,
           price = $6,
           recommended = $7
       WHERE id = $8
       RETURNING id, category, title, description, image, duration, price, recommended`,
        [category, title, description, image, duration, price, recommended, id],
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Pricing card tidak ditemukan" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("PUT /api/pricing/:id error", error);
      res.status(500).json({ error: "Gagal mengupdate pricing card" });
    }
  },
);

// Delete pricing card (admin only)
app.delete(
  "/api/pricing/:id",
  requireAdminAuth,
  requireCsrfToken,
  validateNumericIdParam,
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `DELETE FROM ${table("pricing")} WHERE id = $1 RETURNING id`,
        [id],
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Pricing card tidak ditemukan" });
      }
      res.json({ message: "Pricing card berhasil dihapus" });
    } catch (error) {
      console.error("DELETE /api/pricing/:id error", error);
      res.status(500).json({ error: "Gagal menghapus pricing card" });
    }
  },
);

// Upload image endpoint
app.post(
  "/api/admin/upload",
  requireAdminAuth,
  requireCsrfToken,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "File tidak ditemukan" });
    }

    const fileUrl = req.file.path;
    return res.json({ url: fileUrl, message: "File berhasil diupload" });
  },
);

// Change password endpoint
app.post(
  "/api/admin/change-password",
  requireAdminAuth,
  requireCsrfToken,
  async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (
      typeof currentPassword !== "string" ||
      currentPassword.trim() === "" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      newPassword.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      return res.status(400).json({ error: "Password tidak valid" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Password tidak cocok" });
    }

    if (!isValidAdminPassword(newPassword)) {
      return res.status(400).json({
        error:
          "Password minimal 12 karakter dan harus mengandung huruf besar, huruf kecil, serta angka",
      });
    }

    try {
      const username = req.adminUser.username;
      const userResult = await pool.query(
        `SELECT password_hash FROM ${table("admin_users")}
         WHERE LOWER(username) = LOWER($1) LIMIT 1`,
        [username],
      );

      const savedHash = userResult.rows[0]?.password_hash;
      if (!savedHash) {
        return res.status(401).json({ error: "Password lama tidak valid" });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        savedHash,
      );

      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: "Password lama tidak sesuai" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await pool.query(
        `UPDATE ${table("admin_users")} SET password_hash = $1, updated_at = NOW()
         WHERE LOWER(username) = LOWER($2)`,
        [passwordHash, username],
      );

      await pool.query(
        `DELETE FROM ${table("admin_sessions")}
         WHERE LOWER(username) = LOWER($1)`,
        [username],
      );

      res.clearCookie("admin_session_id", { path: "/" });
      res.clearCookie("admin_auth_token", { path: "/" });
      res.clearCookie("csrf_token", { path: "/" });

      return res.json({
        message: "Password berhasil diubah. Silakan login kembali.",
      });
    } catch (error) {
      console.error("POST /api/admin/change-password error", error);
      return res.status(500).json({ error: "Gagal mengubah password" });
    }
  },
);

// Get admin info
app.get("/api/admin/info", requireAdminAuth, async (req, res) => {
  return res.json({
    username: adminUsername,
    message: "Info admin",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  if (
    err.message === "Not allowed by CORS" ||
    err.message === "Invalid CORS origin"
  ) {
    return res.status(403).json({ error: "CORS policy denied" });
  }

  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
  });
}

export default app;
