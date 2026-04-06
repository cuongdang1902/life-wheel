---
name: deploy-cloudflare-pages
description: Hướng dẫn deploy React/Vite SPA lên Cloudflare Pages đúng cách, tránh các lỗi phổ biến đã gặp (trang trắng, redirect loop, thiếu env vars).
---

# Deploy React/Vite SPA lên Cloudflare Pages

## ✅ Checklist trước khi deploy

### 1. Cấu hình Build Settings trên Cloudflare Dashboard

| Field | Giá trị |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(để trống nếu repo root)* |
| Node.js version | `18` hoặc `20` |

---

### 2. Environment Variables — **BẮT BUỘC SET TRƯỚC KHI BUILD**

> ⚠️ **QUAN TRỌNG**: Vite bake env vars vào bundle lúc BUILD, không phải runtime.
> Nếu không set trong Cloudflare dashboard thì `import.meta.env.VITE_*` sẽ là `undefined`
> trong production bundle, dù local chạy bình thường vì có `.env.local`.

**Cách set**: Cloudflare Pages → Settings → Environment variables → Add variable

Các biến cần set cho project này:

```
VITE_SUPABASE_URL      = https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci...  (anon public key, KHÔNG phải service_role)
```

**Supabase API Key nào dùng?**

| Tab trong Supabase Dashboard | Key | Dùng cho Frontend? |
|---|---|---|
| Legacy → **anon** (JWT `eyJhbGci...`) | ✅ **ĐÚNG** — `VITE_SUPABASE_ANON_KEY` | Yes |
| New → **Publishable** (`sb_publishable_...`) | ✅ Cũng OK (format mới) | Yes |
| Legacy → **service_role** | ❌ KHÔNG — bypass RLS | No |
| New → **Secret** (`sb_secret_...`) | ❌ KHÔNG — tương đương service_role | No |

---

### 3. SPA Routing — Dùng `404.html`, KHÔNG dùng `_redirects`

**❌ TRÁNH dùng `_redirects` với rule sau:**
```
/* /index.html 200
```
Cloudflare Pages detect rule này là "infinite loop" và REJECT nó, khiến SPA routing bị phá vỡ.

**✅ Cách đúng: Dùng `404.html` làm fallback**

Cloudflare Pages tự động serve `404.html` cho mọi route không tìm thấy — đây là cách chính thức để làm SPA routing.

**Setup trong `package.json`:**
```json
{
  "scripts": {
    "build": "vite build && node -e \"require('fs').copyFileSync('dist/index.html','dist/404.html')\""
  }
}
```

Script này copy `index.html` → `404.html` sau mỗi build. Cloudflare sẽ dùng `404.html` làm fallback cho mọi sub-route (`/charts`, `/goals`, etc.).

---

### 4. Supabase Client — Fallback khi thiếu env vars

File `src/shared/lib/supabase.js` phải có mock client để app không crash ngay cả khi thiếu env vars:

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Mock client khi thiếu env vars (app vẫn render, chỉ không dùng được auth/DB)
const mockAuth = {
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase chưa cấu hình' } }),
  signOut: () => Promise.resolve({ error: null }),
}
const mockSupabase = { auth: mockAuth, from: () => ({ /* ... */ }) }

// Bọc createClient trong try-catch để tránh crash ở module level
export let supabase
try {
  supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : mockSupabase
} catch (e) {
  console.error('Failed to create Supabase client:', e)
  supabase = mockSupabase
}
```

> **Tại sao cần try-catch?** Nếu `supabaseUrl` hoặc `supabaseAnonKey` bị format sai (ví dụ copy nhầm có dấu ngoặc kép thừa), `createClient` sẽ throw ngay lúc module load, crash toàn bộ app trước khi React mount được.

---

### 5. ErrorBoundary — Bắt runtime errors hiển thị thay vì trang trắng

File `src/shared/components/ErrorBoundary.jsx` phải được wrap tại `main.jsx`:

```jsx
// main.jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>       {/* ← bắt mọi React render error */}
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
```

---

## 🔍 Debug khi thấy trang trắng (Blank Page)

### Bước 1: Xác nhận vấn đề

```bash
# Kiểm tra xem assets có load không
curl -I https://<your-app>.pages.dev/assets/index-*.js
# -> 200 OK = JS load được, vấn đề là runtime error
# -> 404 = file không tồn tại, vấn đề là build hoặc routing

curl -I https://<your-app>.pages.dev/assets/index-*.css
# -> 200 OK = CSS OK
```

### Bước 2: Build local và preview

```bash
npm run build
npx vite preview
# Mở http://localhost:4173 → nếu OK ở local mà lỗi ở Cloudflare = vấn đề môi trường/env vars
```

### Bước 3: So sánh JS bundle hash

- Local build: `dist/assets/index-XXXX.js`
- Deployed: check URL trong `view-source:https://your-app.pages.dev`

**Nếu hash khác nhau** = bundle được build từ môi trường khác (env vars khác nhau baked vào bundle).

### Bước 4: Kiểm tra Cloudflare build logs

1. Cloudflare Dashboard → Pages → Project → Deployments
2. Click vào deployment đang deploy
3. Xem Build logs — tìm:
   - `Error` hoặc `Failed` trong output
   - `Found invalid redirect lines` → xóa `_redirects`
   - Build command có exit code 0 không

---

## 🚫 Các lỗi hay gặp và cách fix

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| Trang trắng ở `/` | Thiếu env vars trên Cloudflare | Set `VITE_*` vars trong CF dashboard và redeploy |
| Sub-route (`/charts`) bị 404 | `_redirects` bị reject hoặc thiếu `404.html` | Dùng `404.html` fallback (xem phần 3) |
| `Cannot use assets with a binding in assets-only Worker` | Có `wrangler.toml` với worker binding trong Pages | Xóa `wrangler.toml` và `worker.js` |
| `_redirects` invalid redirect line | Rule `/* /index.html 200` bị detect là loop | Xóa `_redirects`, dùng `404.html` |
| App crash khi Supabase key sai format | `createClient` throw ở module level | Bọc trong try-catch (xem phần 4) |
| JS bundle hash khác local vs deployed | Env vars khác nhau baked vào bundle | Set đúng env vars trên CF, rebuild |

---

## 📁 File structure chuẩn cho Cloudflare Pages

```
project/
├── public/
│   ├── wheel-of-life.ico     ✅ static assets
│   └── icons/                ✅ (KHÔNG có _redirects)
├── src/
│   ├── main.jsx              ✅ có ErrorBoundary wrap
│   └── shared/lib/supabase.js ✅ có mock fallback + try-catch
├── package.json              ✅ build script copy 404.html
├── vite.config.js            ✅ standard Vite config
└── index.html                ✅ entry point
```

> **KHÔNG có**: `wrangler.toml`, `worker.js`, `_worker.js`, `public/_redirects`

---

## 📝 Ghi chú bổ sung

- **Cloudflare Pages vs Cloudflare Workers**: Pages là static hosting (đơn giản hơn). Workers có thể chạy code server-side. Với SPA thuần React không cần SSR, dùng **Pages** là đủ.
- **D1 vs Supabase**: D1 là database của Cloudflare (cần Workers để access). Supabase có REST API riêng, phù hợp hơn cho frontend SPA.
- **Sau mỗi lần set/thay đổi env vars trên Cloudflare**: Phải **Redeploy** (trigger build mới) để env vars được bake vào bundle mới.
