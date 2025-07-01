import { type NextRequest, NextResponse } from "next/server"
import { getAllBooks, searchBooks } from "@/lib/books-mysql-safe"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let books
    if (search || category) {
      books = await searchBooks(search || "", category || "", page, limit)
    } else {
      books = await getAllBooks(page, limit)
    }

    return NextResponse.json({
      success: true,
      books: books,
    })
  } catch (error: any) {
    console.error("Get books API error:", error)
    return NextResponse.json({ error: error.message || "Kitaplar alınırken hata oluştu" }, { status: 500 })
  }
}
