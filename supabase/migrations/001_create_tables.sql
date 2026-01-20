-- ============================================
-- Life Wheel Database Schema
-- Migration: 001_create_tables
-- ============================================

-- ============================================
-- 1. LIFE_ENTRIES - Store scores/snapshots
-- ============================================
CREATE TABLE public.life_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('week', 'month', 'year')),
  period_key TEXT NOT NULL, -- e.g., '2026-W03', '2026-01', '2026'
  entry_date DATE NOT NULL DEFAULT now()::date,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb, -- {"health": 8, "career": 7, ...}
  overall_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT life_entries_unique UNIQUE (user_id, period_type, period_key, entry_date)
);

-- Indexes
CREATE INDEX idx_life_entries_user_id ON public.life_entries(user_id);
CREATE INDEX idx_life_entries_period ON public.life_entries(period_type, period_key);
CREATE INDEX idx_life_entries_date ON public.life_entries(entry_date DESC);

-- ============================================
-- 2. LIFE_GOALS - OKR goals per period+area
-- ============================================
CREATE TABLE public.life_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('week', 'month', 'year')),
  period_key TEXT NOT NULL,
  area_id TEXT NOT NULL CHECK (area_id IN (
    'health', 'career', 'finance', 'family', 
    'growth', 'recreation', 'spiritual', 'contribution'
  )),
  objective TEXT DEFAULT '',
  sub_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{ "id": "...", "title": "...", "tasks": [{"id": "...", "text": "...", "done": false}] }]
  -- Max 3 sub-goals, each max 3 tasks (enforced by app)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT life_goals_unique UNIQUE (user_id, period_type, period_key, area_id)
);

-- Indexes
CREATE INDEX idx_life_goals_user_id ON public.life_goals(user_id);
CREATE INDEX idx_life_goals_period ON public.life_goals(period_type, period_key);
CREATE INDEX idx_life_goals_area ON public.life_goals(area_id);

-- ============================================
-- 3. LIFE_REVIEWS - Review past cycle per period+area
-- ============================================
CREATE TABLE public.life_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('week', 'month', 'year')),
  period_key TEXT NOT NULL,
  area_id TEXT NOT NULL CHECK (area_id IN (
    'health', 'career', 'finance', 'family', 
    'growth', 'recreation', 'spiritual', 'contribution'
  )),
  summary TEXT DEFAULT '',
  review_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { "done": [...], "not_done": [...], "reason": "...", "fix": "..." }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT life_reviews_unique UNIQUE (user_id, period_type, period_key, area_id)
);

-- Indexes
CREATE INDEX idx_life_reviews_user_id ON public.life_reviews(user_id);
CREATE INDEX idx_life_reviews_period ON public.life_reviews(period_type, period_key);

-- ============================================
-- 4. UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER on_life_entries_updated
  BEFORE UPDATE ON public.life_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_life_goals_updated
  BEFORE UPDATE ON public.life_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_life_reviews_updated
  BEFORE UPDATE ON public.life_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.life_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES - Users can only access their own data
-- ============================================

-- LIFE_ENTRIES policies
CREATE POLICY "life_entries_select_own" ON public.life_entries
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "life_entries_insert_own" ON public.life_entries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "life_entries_update_own" ON public.life_entries
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "life_entries_delete_own" ON public.life_entries
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- LIFE_GOALS policies
CREATE POLICY "life_goals_select_own" ON public.life_goals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "life_goals_insert_own" ON public.life_goals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "life_goals_update_own" ON public.life_goals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "life_goals_delete_own" ON public.life_goals
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- LIFE_REVIEWS policies
CREATE POLICY "life_reviews_select_own" ON public.life_reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "life_reviews_insert_own" ON public.life_reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "life_reviews_update_own" ON public.life_reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "life_reviews_delete_own" ON public.life_reviews
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- DONE! Schema created successfully.
-- ============================================
