// Cloudflare Worker entry point - serves Vite/React SPA with SPA routing support
export default {
  async fetch(request, env, ctx) {
    return env.ASSETS.fetch(request)
  },
}
