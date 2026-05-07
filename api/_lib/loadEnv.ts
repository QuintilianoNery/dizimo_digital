import { config as loadDotenv } from 'dotenv'

// Load environment variables from .env files
// This ensures all env vars are available in Vercel Functions and local development
// Note: In Vercel production, env vars are injected by the platform
// In vercel dev and local dev, dotenv needs to load them explicitly
try {
  loadDotenv({ path: '.env.local', override: true })
  loadDotenv({ path: '.env', override: false })
} catch {
  // Silently fail if dotenv not available (shouldn't happen in development)
}
