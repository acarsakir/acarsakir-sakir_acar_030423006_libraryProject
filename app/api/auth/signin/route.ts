import { type NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/auth-mysql-fixed"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email ve şifre gerekli" }, { status: 400 })
    }

    const result = await signIn(email, password)

    return NextResponse.json({
      success: true,
      user: result.user,
      session: result.session,
    })
  } catch (error: any) {
    console.error("Sign in API error:", error)
    return NextResponse.json({ error: error.message || "Giriş yapılırken hata oluştu" }, { status: 400 })
  }
}
