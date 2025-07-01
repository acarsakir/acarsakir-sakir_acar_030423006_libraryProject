import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-mysql-fixed"

export async function GET(request: NextRequest) {
  try {
    const result = await getCurrentUser()

    return NextResponse.json({
      success: true,
      user: result.user,
      member: result.member,
    })
  } catch (error: any) {
    console.error("Get user API error:", error)
    return NextResponse.json({ error: error.message || "Kullanıcı bilgileri alınırken hata oluştu" }, { status: 400 })
  }
}
