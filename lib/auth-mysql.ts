import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { getOne, insertOne, getMany } from "./mysql"

export interface User {
  id: string
  email: string
  password_hash: string
  created_at: string
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

// Mock current user storage for preview (in production, use sessions/JWT)
let currentUser: { user: User; member: Member } | null = null

export async function signUp(email: string, password: string, fullName: string, phone?: string, address?: string) {
  try {
    // Check if user already exists
    const existingUser = await getOne("SELECT id FROM users WHERE email = ?", [email])
    if (existingUser) {
      throw new Error("Bu e-posta adresi zaten kullanılıyor")
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    // Insert user
    await insertOne("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)", [userId, email, passwordHash])

    // Insert member
    await insertOne("INSERT INTO members (id, full_name, email, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)", [
      userId,
      fullName,
      email,
      phone || null,
      address || null,
      "member",
    ])

    return {
      user: { id: userId, email },
      session: null,
    }
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Get user with member info
    const user = await getOne(
      `
      SELECT u.id, u.email, u.password_hash, u.created_at,
             m.full_name, m.phone, m.address, m.membership_date, 
             m.is_active, m.role, m.created_at as member_created_at
      FROM users u
      JOIN members m ON u.id = m.id
      WHERE u.email = ?
    `,
      [email],
    )

    if (!user) {
      throw new Error("Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı")
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error("Şifre yanlış")
    }

    // Check if member is active
    if (!user.is_active) {
      throw new Error("Hesabınız pasif durumda. Lütfen yönetici ile iletişime geçin.")
    }

    // Store current user (in production, use proper session management)
    currentUser = {
      user: {
        id: user.id,
        email: user.email,
        password_hash: user.password_hash,
        created_at: user.created_at,
      },
      member: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        membership_date: user.membership_date,
        is_active: user.is_active,
        role: user.role,
        created_at: user.member_created_at,
      },
    }

    return {
      user: { id: user.id, email: user.email },
      session: { access_token: "mysql-token" },
    }
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

export async function signOut() {
  currentUser = null
  return Promise.resolve()
}

export async function getCurrentUser() {
  if (!currentUser) {
    return { user: null, member: null }
  }

  return {
    user: currentUser.user,
    member: currentUser.member,
  }
}

// Get all members (for admin)
export async function getAllMembers() {
  try {
    const members = await getMany(`
      SELECT m.id, m.full_name, m.email, m.phone, m.address, 
             m.membership_date, m.is_active, m.role, m.created_at
      FROM members m
      ORDER BY m.created_at DESC
    `)
    return members
  } catch (error) {
    console.error("Get members error:", error)
    throw error
  }
}

// Get member borrowing statistics
export async function getMemberStats(memberId: string) {
  try {
    const stats = await getOne(
      `
      SELECT 
        COUNT(*) as total_borrowed,
        COUNT(CASE WHEN is_returned = FALSE THEN 1 END) as currently_borrowed,
        COUNT(CASE WHEN is_returned = FALSE AND due_date < CURDATE() THEN 1 END) as overdue
      FROM borrowings 
      WHERE member_id = ?
    `,
      [memberId],
    )

    return stats || { total_borrowed: 0, currently_borrowed: 0, overdue: 0 }
  } catch (error) {
    console.error("Get member stats error:", error)
    throw error
  }
}
