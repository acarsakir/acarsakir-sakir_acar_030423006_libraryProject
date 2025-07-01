import { createClient } from "@supabase/supabase-js"

// Test function for Supabase connection
export async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("🔍 Supabase Test Başlıyor...")
  console.log("URL:", supabaseUrl)
  console.log("ANON KEY:", supabaseAnonKey ? "Mevcut ✅" : "Eksik ❌")

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase environment variables eksik!")
    return false
  }

  if (supabaseUrl.includes("YOUR_SUPABASE_URL") || supabaseAnonKey.includes("YOUR_SUPABASE_ANON_KEY")) {
    console.error("❌ Placeholder değerler kullanılıyor!")
    return false
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test connection
    const { data, error } = await supabase.from("books").select("count").limit(1)

    if (error) {
      console.error("❌ Supabase bağlantı hatası:", error.message)
      return false
    }

    console.log("✅ Supabase bağlantısı başarılı!")
    return true
  } catch (error) {
    console.error("❌ Supabase test hatası:", error)
    return false
  }
}

