import { type NextRequest, NextResponse } from "next/server"
import { signUp } from "@/lib/auth-mysql-fixed"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, address } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, şifre ve ad soyad gerekli" }, { status: 400 })
    }

    const result = await signUp(email, password, fullName, phone, address)

    return NextResponse.json({
      success: true,
      user: result.user,
      session: result.session,
    })
  } catch (error: any) {
    console.error("Sign up API error:", error)
    return NextResponse.json({ error: error.message || "Kayıt olurken hata oluştu" }, { status: 400 })
  }
}
