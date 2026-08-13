import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import pool from "./db.js";
import { normalizeApiKey, resolveSchemaName, withSchema } from "./utils.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../client/public/uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const schemaName = resolveSchemaName(process.env.PGSCHEMA);
const table = (name) => withSchema(name, schemaName);
const adminSessionSecret =
  process.env.ADMIN_SESSION_SECRET || "homecare-admin-secret";

let adminUsername = (process.env.ADMIN_USERNAME || "admin").trim();
let adminPassword = (process.env.ADMIN_PASSWORD || "admin123").trim();
let adminToken = crypto
  .createHmac("sha256", adminSessionSecret)
  .update(`${adminUsername}:${adminPassword}`)
  .digest("hex");

const updateAdminToken = () => {
  adminToken = crypto
    .createHmac("sha256", adminSessionSecret)
    .update(`${adminUsername}:${adminPassword}`)
    .digest("hex");
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(file.originalname)) {
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${table("admin_users")} (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

async function ensureSiteSectionsTable() {
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
         updated_at = NOW()`,
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

await Promise.all([
  ensureAdminUsersTable().catch((error) => {
    console.error("Failed preparing admin users table", error);
  }),
  ensureSiteSectionsTable().catch((error) => {
    console.error("Failed preparing site sections table", error);
  }),
]);

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 204,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

// Admin-only guard. Every non-public /api/pricing and /api/testimoni
// endpoint requires this header:
//   x-api-key: <ADMIN_API_KEY value from .env>
const resolveBearerToken = (req) => {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
};

const requireAdminKey = (req, res, next) => {
  const key = normalizeApiKey(req.headers);
  const bearerToken = resolveBearerToken(req);

  if (bearerToken && bearerToken === adminToken) {
    return next();
  }

  if (!process.env.ADMIN_API_KEY) {
    console.error("ADMIN_API_KEY belum di-set di .env");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

const requireAdminAuth = (req, res, next) => {
  const token = resolveBearerToken(req);

  if (!token || token !== adminToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

const validateNumericIdParam = (req, res, next) => {
  const id = req.params.id ?? req.params.id_testi;
  if (!/^[0-9]+$/.test(String(id))) {
    return res.status(400).json({ error: "ID tidak valid" });
  }
  next();
};

const validateTestimoniPayload = (req, res, next) => {
  const { teks, author, latarBelakang, initial } = req.body || {};

  if (
    !isObject(req.body) ||
    typeof teks !== "string" ||
    teks.trim() === "" ||
    typeof author !== "string" ||
    author.trim() === "" ||
    typeof latarBelakang !== "string" ||
    latarBelakang.trim() === "" ||
    typeof initial !== "string" ||
    initial.trim() === ""
  ) {
    return res.status(400).json({ error: "Payload testimoni tidak valid" });
  }

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
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.trim() !== adminUsername ||
    password !== adminPassword
  ) {
    return res.status(401).json({ error: "Username atau password salah" });
  }

  return res.json({
    token: adminToken,
    user: adminUsername,
    message: "Login berhasil",
  });
});

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
  async (req, res) => {
    const { sectionKey } = req.params;
    const payload = normalizeSection(sectionKey, req.body || {});

    try {
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
       latarBelakang, 
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
app.get("/api/testimoni", requireAdminKey, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
       id_testi,
       teks, 
       author, 
       latarBelakang, 
       initial 
      FROM ${table("testimoni")} ORDER BY id_testi ASC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/testimoni error", error);
    fs.appendFileSync(
      "server-error.log",
      `GET /api/testimoni error: ${error.stack || error}\n`,
    );
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
        latarBelakang,
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
  requireAdminKey,
  validateTestimoniPayload,
  async (req, res) => {
    const { teks, author, latarBelakang, initial } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO ${table("testimoni")} (
        teks,
        author,
        latarBelakang,
        initial )
       VALUES ($1, $2, $3, $4)
       RETURNING id_testi, teks, author, latarBelakang, initial`,
        [teks, author, latarBelakang, initial],
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
  requireAdminKey,
  validateNumericIdParam,
  validateTestimoniPayload,
  async (req, res) => {
    const { id_testi } = req.params;
    const { teks, author, latarBelakang, initial } = req.body;
    try {
      const result = await pool.query(
        `UPDATE ${table("testimoni")}
       SET teks = $1,
           author = $2,
           latarBelakang = $3,
           initial = $4
       WHERE id_testi = $5
       RETURNING id_testi, teks, author, latarBelakang, initial`,
        [teks, author, latarBelakang, initial, id_testi],
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
  requireAdminKey,
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
app.get("/api/pricing", requireAdminKey, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, category, title, description, image, duration, price, recommended FROM ${table("pricing")} ORDER BY id ASC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/pricing error", error);
    fs.appendFileSync(
      "server-error.log",
      `GET /api/pricing error: ${error.stack || error}\n`,
    );
    res.status(500).json({ error: "Gagal mengambil data pricing" });
  }
});

// Read all pricing categories (admin only)
app.get("/api/pricing-categories", requireAdminKey, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, category, title, description FROM ${table("pricing_categories")} ORDER BY id ASC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/pricing-categories error", error);
    fs.appendFileSync(
      "server-error.log",
      `GET /api/pricing-categories error: ${error.stack || error}\n`,
    );
    res.status(500).json({ error: "Gagal mengambil data kategori pricing" });
  }
});

// Search pricing cards by category and query (admin only)
app.get("/api/pricing/search", requireAdminKey, async (req, res) => {
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
    fs.appendFileSync(
      "server-error.log",
      `GET /api/pricing/search error: ${error.stack || error}\n`,
    );
    res.status(500).json({ error: "Gagal mencari data pricing" });
  }
});

// Read single pricing (admin only)
app.get(
  "/api/pricing/:id",
  requireAdminKey,
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
  requireAdminKey,
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
  requireAdminKey,
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
  requireAdminKey,
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
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "File tidak ditemukan" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({ url: fileUrl, message: "File berhasil diupload" });
  },
);

// Change password endpoint
app.post("/api/admin/change-password", requireAdminAuth, async (req, res) => {
  const { newPassword, confirmPassword } = req.body || {};

  if (
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

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Password minimal 6 karakter" });
  }

  try {
    adminPassword = newPassword.trim();
    updateAdminToken();

    return res.json({
      message: "Password berhasil diubah",
      token: adminToken,
    });
  } catch (error) {
    console.error("POST /api/admin/change-password error", error);
    return res.status(500).json({ error: "Gagal mengubah password" });
  }
});

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

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS policy denied" });
  }

  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
