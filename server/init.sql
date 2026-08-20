CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.pricing (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price INTEGER NOT NULL,
  recommended BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.pricing_categories (
  id SERIAL PRIMARY KEY,
  category TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.testimoni (
	id_testi SERIAL PRIMARY KEY,
	teks TEXT NOT NULL,
	author TEXT NOT NULL,
	latarbelakang TEXT NOT NULL,
	initial TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pricing_category ON public.pricing(category);
CREATE INDEX IF NOT EXISTS idx_pricing_recommended ON public.pricing(recommended DESC, id);