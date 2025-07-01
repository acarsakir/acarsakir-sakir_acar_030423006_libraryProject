// lib/supabase.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Fall-back placeholders avoid hard crashes in the v0 preview.
// ▸ In a real deployment set these in your project's ENV settings.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://tukybzwnzvhetbnbukol.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1a3lienduenZoZXRibmJ1a29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTg2MjEsImV4cCI6MjA2Njk3NDYyMX0.BcoTZST1IqieCcWbapM8fSyYvWldbpSyCQ6rlzHfGI8"

// Warn clearly during development / preview
if (supabaseUrl.includes("https://tukybzwnzvhetbnbukol.supabase.co") || supabaseAnonKey.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1a3lienduenZoZXRibmJ1a29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTg2MjEsImV4cCI6MjA2Njk3NDYyMX0.BcoTZST1IqieCcWbapM8fSyYvWldbpSyCQ6rlzHfGI8")) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] Missing env vars. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "to connect to your project.",
  )
}

// Client-side Supabase instance
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Named export for createClient
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Server-side helper for service-role key usage
export const createServerClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey,
  )

