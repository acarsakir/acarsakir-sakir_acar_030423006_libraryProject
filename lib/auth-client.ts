// Client-side authentication helper
export interface User {
  id: string
  email: string
}

export interface Member {
  id: string
  full_name: string
  email: string
  phone?: string
  address?: string
  membership_date: string
  is_active: boolean
  role: "admin" | "member"
  created_at: string
}

export interface AuthResult {
  user: User | null
  member: Member | null
}

// Client-side sign in
export async function signInClient(email: string, password: string) {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Giriş yapılırken hata oluştu")
  }

  // Store user info in localStorage for client-side state
  if (data.success && data.user) {
    localStorage.setItem("library_user", JSON.stringify(data.user))
  }

  return data
}

// Client-side sign up
export async function signUpClient(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  address?: string,
) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, fullName, phone, address }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Kayıt olurken hata oluştu")
  }

  return data
}

// Client-side sign out
export async function signOutClient() {
  const response = await fetch("/api/auth/signout", {
    method: "POST",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Çıkış yapılırken hata oluştu")
  }

  // Clear localStorage
  localStorage.removeItem("library_user")

  return data
}

// Get current user from API
export async function getCurrentUserClient(): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/user")
    const data = await response.json()

    if (!response.ok) {
      return { user: null, member: null }
    }

    return {
      user: data.user,
      member: data.member,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return { user: null, member: null }
  }
}

// Get user from localStorage (for immediate access)
export function getUserFromStorage(): User | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("library_user")
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error("Error reading user from storage:", error)
    return null
  }
}
