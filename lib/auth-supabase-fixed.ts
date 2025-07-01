import { createClient } from "@/lib/supabase"

export interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "member"
  is_active: boolean
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient()

    console.log("🔐 Giriş denemesi:", email)

    // Supabase Auth ile giriş
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("❌ Auth hatası:", authError.message)

      // Yaygın hata mesajlarını Türkçe'ye çevir
      if (authError.message.includes("Invalid login credentials")) {
        throw new Error("E-posta veya şifre yanlış")
      }
      if (authError.message.includes("Email not confirmed")) {
        throw new Error("E-posta adresinizi doğrulamanız gerekiyor")
      }
      if (authError.message.includes("Too many requests")) {
        throw new Error("Çok fazla deneme. Lütfen biraz bekleyin.")
      }

      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error("Kullanıcı bilgileri alınamadı")
    }

    console.log("✅ Auth başarılı, profil kontrol ediliyor...")

    // Kullanıcı profilini al
    const { data: profile, error: profileError } = await supabase
      .from("members")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      console.error("❌ Profil hatası:", profileError.message)

      // Eğer profil yoksa oluştur
      if (profileError.code === "PGRST116") {
        console.log("📝 Profil oluşturuluyor...")

        const { error: insertError } = await supabase.from("members").insert([
          {
            id: authData.user.id,
            full_name: authData.user.user_metadata?.full_name || "Kullanıcı",
            email: authData.user.email!,
            role: "member",
            is_active: true,
          },
        ])

        if (insertError) {
          console.error("❌ Profil oluşturma hatası:", insertError.message)
          throw new Error("Kullanıcı profili oluşturulamadı")
        }

        // Yeni oluşturulan profili al
        const { data: newProfile } = await supabase.from("members").select("*").eq("id", authData.user.id).single()

        return {
          data: {
            user: authData.user,
            profile: newProfile,
          },
        }
      }

      throw new Error("Kullanıcı profili alınamadı")
    }

    console.log("✅ Giriş başarılı!")
    return { data: { user: authData.user, profile } }
  } catch (error: any) {
    console.error("🚨 SignIn hatası:", error)
    throw error
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const supabase = createClient()

    console.log("📝 Kayıt denemesi:", email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      console.error("❌ Kayıt hatası:", error.message)

      if (error.message.includes("User already registered")) {
        throw new Error("Bu e-posta adresi zaten kayıtlı")
      }
      if (error.message.includes("Password should be at least")) {
        throw new Error("Şifre en az 6 karakter olmalı")
      }

      throw new Error(error.message)
    }

    console.log("✅ Kayıt başarılı!")
    return { data }
  } catch (error: any) {
    console.error("🚨 SignUp hatası:", error)
    throw error
  }
}

export async function signOut() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    return { error: null }
  } catch (error: any) {
    console.error("🚨 SignOut hatası:", error)
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase.from("members").select("*").eq("id", user.id).single()

    if (!profile) return null

    return {
      id: user.id,
      email: user.email!,
      full_name: profile.full_name,
      role: profile.role,
      is_active: profile.is_active,
    }
  } catch (error) {
    console.error("🚨 GetCurrentUser hatası:", error)
    return null
  }
}

