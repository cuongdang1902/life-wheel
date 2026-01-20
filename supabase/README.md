# Supabase Database Setup

## Quick Start

### 1. Run Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/001_create_tables.sql`
4. Paste and click **Run**

### 2. Verify Tables Created

Go to **Table Editor** and confirm these tables exist:
- `life_entries`
- `life_goals`
- `life_reviews`

### 3. Verify RLS Enabled

Go to **Authentication** > **Policies** and confirm RLS policies for all 3 tables.

---

## Testing with Logged-in User

### Option A: Test via SQL Editor (with auth context)

```sql
-- First, get your user ID from auth.users
SELECT id, email FROM auth.users LIMIT 5;

-- Test INSERT (replace YOUR_USER_ID with actual UUID)
INSERT INTO life_entries (user_id, period_type, period_key, scores)
VALUES (
  'YOUR_USER_ID'::uuid,
  'month',
  '2026-01',
  '{"health": 8, "career": 7, "finance": 6, "family": 8, "growth": 5, "recreation": 6, "spiritual": 4, "contribution": 5}'::jsonb
);

-- Test SELECT
SELECT * FROM life_entries;

-- Test life_goals
INSERT INTO life_goals (user_id, period_type, period_key, area_id, objective, sub_goals)
VALUES (
  'YOUR_USER_ID'::uuid,
  'month',
  '2026-01',
  'health',
  'Improve fitness',
  '[{"id": "1", "title": "Exercise 3x/week", "tasks": [{"id": "t1", "text": "Morning run", "done": false}]}]'::jsonb
);

SELECT * FROM life_goals;
```

### Option B: Test via JavaScript (in browser console)

```javascript
// Make sure you're logged in first
const { data: user } = await supabase.auth.getUser();
console.log('User:', user);

// Test INSERT
const { data, error } = await supabase
  .from('life_entries')
  .insert({
    user_id: user.user.id,
    period_type: 'month',
    period_key: '2026-01',
    scores: { health: 8, career: 7, finance: 6 }
  })
  .select();

console.log('Insert result:', data, error);

// Test SELECT
const { data: entries } = await supabase
  .from('life_entries')
  .select('*');

console.log('Entries:', entries);
```

### Option C: Test RLS (should fail without auth)

```javascript
// Sign out first
await supabase.auth.signOut();

// This should return empty array (RLS blocks access)
const { data, error } = await supabase
  .from('life_entries')
  .select('*');

console.log('Without auth:', data); // Should be []
```

---

## Table Schemas

### life_entries
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| period_type | TEXT | 'week', 'month', or 'year' |
| period_key | TEXT | e.g., '2026-W03', '2026-01', '2026' |
| entry_date | DATE | Date of entry |
| scores | JSONB | 8 areas with 0-10 scores |
| overall_note | TEXT | Optional note |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

### life_goals
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| period_type | TEXT | 'week', 'month', or 'year' |
| period_key | TEXT | Period identifier |
| area_id | TEXT | One of 8 life areas |
| objective | TEXT | Main objective |
| sub_goals | JSONB | Array of sub-goals with tasks |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

### life_reviews
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| period_type | TEXT | 'week', 'month', or 'year' |
| period_key | TEXT | Period identifier |
| area_id | TEXT | One of 8 life areas |
| summary | TEXT | Review summary |
| review_json | JSONB | Structured review data |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

---

## RLS Policies

All tables have identical policies:
- **SELECT**: Only rows where `user_id = auth.uid()`
- **INSERT**: Only if `user_id = auth.uid()`
- **UPDATE**: Only rows where `user_id = auth.uid()`
- **DELETE**: Only rows where `user_id = auth.uid()`

Role: `authenticated` (logged-in users only)
