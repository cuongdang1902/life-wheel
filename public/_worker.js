// Cloudflare Worker fetch handler để serve Vite/React SPA
export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Thử serve file static (JS, CSS, images, icons...)
    // Nếu file không tồn tại (SPA route như /goals, /charts) → fallback về index.html
    try {
      const response = await env.ASSETS.fetch(request)

      // Nếu 404 (route của React Router) → serve index.html
      if (response.status === 404) {
        return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request))
      }

      return response
    } catch {
      // Fallback an toàn
      return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request))
    }
  },
}
