import { type NextRequest, NextResponse } from "next/server"
import { signOut } from "@/lib/auth-mysql-fixed"

export async function POST(request: NextRequest) {
  try {
    await signOut()

    return NextResponse.json({
      success: true,
      message: "Başarıyla çıkış yapıldı",
    })
  } catch (error: any) {
    console.error("Sign out API error:", error)
    return NextResponse.json({ error: error.message || "Çıkış yapılırken hata oluştu" }, { status: 400 })
  }
}
