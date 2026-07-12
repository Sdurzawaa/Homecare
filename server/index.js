import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pool from "./db.js";

dotenv.config();

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.API_KEY;
const REQUIRE_API_KEY = /^(true|1|yes)$/i.test(
  process.env.REQUIRE_API_KEY || "true",
);

if (REQUIRE_API_KEY && !ADMIN_API_KEY) {
  console.warn("WARNING: API key belum diatur di server/.env");
}

const app = express();
const port = process.env.PORT || 5000;

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

const validateAdminKey = (req, res, next) => {
  const apiKey =
    req.headers["x-api-key"] ||
    (typeof req.headers.authorization === "string"
      ? req.headers.authorization.replace(/^Bearer\s+/i, "")
      : undefined);

  if (REQUIRE_API_KEY && !ADMIN_API_KEY) {
    return res
      .status(500)
      .json({ error: "Server configuration missing API key" });
  }

  if (REQUIRE_API_KEY && apiKey !== ADMIN_API_KEY) {
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

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Read all pricing cards
app.get("/api/testimoni", validateAdminKey, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
       id_testi,
       teks, 
       author, 
       latarBelakang, 
       initial 
      FROM website_co.testimoni ORDER BY id_testi ASC`,
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

// Read single testimoni card
app.get(
  "/api/testimoni/:id_testi",
  validateNumericIdParam,
  validateAdminKey,
  async (req, res) => {
    const { id_testi } = req.params;
    try {
      const result = await pool.query(
        `SELECT 
        id_testi,
        teks,
        author,
        latarBelakang,
        INITIAL 
      FROM website_co.testimoni WHERE id_testi = $1`,
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

// Create testimoni card
app.post(
  "/api/testimoni",
  validateAdminKey,
  validateTestimoniPayload,
  async (req, res) => {
    const { teks, author, latarBelakang, initial } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO website_co.testimoni (
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

// Update testimoni card
app.put(
  "/api/testimoni/:id_testi",
  validateNumericIdParam,
  validateAdminKey,
  validateTestimoniPayload,
  async (req, res) => {
    const { id_testi } = req.params;
    const { teks, author, latarBelakang, initial } = req.body;
    try {
      const result = await pool.query(
        `UPDATE website_co.testimoni
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

// Delete testimoni card
app.delete(
  "/api/testimoni/:id_testi",
  validateNumericIdParam,
  validateAdminKey,
  async (req, res) => {
    const { id_testi } = req.params;
    try {
      const result = await pool.query(
        `DELETE FROM website_co.testimoni WHERE id_testi = $1 RETURNING id_testi`,
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

// Read all pricing cards
app.get("/api/pricing", validateAdminKey, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, category, title, description, image, duration, price, recommended FROM website_co.pricing ORDER BY id ASC`,
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

// Read single pricing card
app.get(
  "/api/pricing/:id",
  validateNumericIdParam,
  validateAdminKey,
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
      FROM website_co.pricing WHERE id = $1`,
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

// Create pricing card
app.post(
  "/api/pricing",
  validateAdminKey,
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
        `INSERT INTO website_co.pricing (category, title, description, image, duration, price, recommended)
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

// Update pricing card
app.put(
  "/api/pricing/:id",
  validateNumericIdParam,
  validateAdminKey,
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
        `UPDATE website_co.pricing
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

// Delete pricing card
app.delete(
  "/api/pricing/:id",
  validateNumericIdParam,
  validateAdminKey,
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `DELETE FROM website_co.pricing WHERE id = $1 RETURNING id`,
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
