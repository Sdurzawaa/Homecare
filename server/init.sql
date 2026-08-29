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
	initial TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'pending',
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.testimoni
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.testimoni
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.testimoni
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.testimoni
SET status = 'pending'
WHERE status IS NULL OR status = '';

CREATE INDEX IF NOT EXISTS idx_testimoni_status ON public.testimoni(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_category ON public.pricing(category);
CREATE INDEX IF NOT EXISTS idx_pricing_recommended ON public.pricing(recommended DESC, id);