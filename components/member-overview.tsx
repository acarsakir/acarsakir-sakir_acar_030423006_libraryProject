"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, Clock, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

interface BorrowedBook {
  id: string
  book_title: string
  book_author: string
  borrowed_date: string
  due_date: string
  is_overdue: boolean
  fine_amount: number
}

export default function MemberOverview() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([])
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    currentBorrowed: 0,
    overdue: 0,
    totalFines: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMemberData()
  }, [])

  const loadMemberData = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const supabase = createClient()

      // Get current borrowed books
      const { data: borrowings } = await supabase
        .from("borrowings")
        .select(`
          id,
          borrowed_date,
          due_date,
          fine_amount,
          books (
            title,
            author
          )
        `)
        .eq("member_id", user.id)
        .eq("is_returned", false)

      const currentDate = new Date()
      const borrowedBooks: BorrowedBook[] = (borrowings || []).map((b) => ({
        id: b.id,
        book_title: b.books?.title || "Bilinmeyen Kitap",
        book_author: b.books?.author || "Bilinmeyen Yazar",
        borrowed_date: b.borrowed_date,
        due_date: b.due_date,
        is_overdue: new Date(b.due_date) < currentDate,
        fine_amount: b.fine_amount || 0,
      }))

      setBorrowedBooks(borrowedBooks)

      // Calculate stats
      const { data: allBorrowings } = await supabase
        .from("borrowings")
        .select("id, fine_amount")
        .eq("member_id", user.id)

      const totalBorrowed = allBorrowings?.length || 0
      const currentBorrowed = borrowedBooks.length
      const overdue = borrowedBooks.filter((b) => b.is_overdue).length
      const totalFines = borrowedBooks.reduce((sum, b) => sum + b.fine_amount, 0)

      setStats({
        totalBorrowed,
        currentBorrowed,
        overdue,
        totalFines,
      })
    } catch (error) {
      console.error("Error loading member data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Ödünç</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBorrowed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Şu An Okuduğum</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentBorrowed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Geciken</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Ceza</p>
                <p className="text-2xl font-bold text-gray-900">₺{stats.totalFines.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Borrowed Books */}
      <Card>
        <CardHeader>
          <CardTitle>Şu An Okuduğum Kitaplar</CardTitle>
        </CardHeader>
        <CardContent>
          {borrowedBooks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Şu an okuduğunuz kitap bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {borrowedBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{book.book_title}</h3>
                    <p className="text-sm text-gray-600">{book.book_author}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-500">
                        Alındı: {new Date(book.borrowed_date).toLocaleDateString("tr-TR")}
                      </span>
                      <span className="text-xs text-gray-500">
                        Teslim: {new Date(book.due_date).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {book.is_overdue && <Badge variant="destructive">Gecikmiş</Badge>}
                    {book.fine_amount > 0 && <Badge variant="outline">₺{book.fine_amount.toFixed(2)} ceza</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
