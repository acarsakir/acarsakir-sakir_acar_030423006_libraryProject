import { createClient } from "@/lib/supabase"

export interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "member"
  is_active: boolean
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error }
  }

  // Get user profile
  const { data: profile } = await supabase.from("members").select("*").eq("id", data.user.id).single()

  return { data: { user: data.user, profile } }
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()

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
    return { error }
  }

  // Create member profile
  if (data.user) {
    const { error: profileError } = await supabase.from("members").insert([
      {
        id: data.user.id,
        full_name: fullName,
        email: email,
        role: "member",
        is_active: true,
      },
    ])

    if (profileError) {
      return { error: profileError }
    }
  }

  return { data }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser(): Promise<User | null> {
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
}
