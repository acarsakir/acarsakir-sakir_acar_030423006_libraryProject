"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar, Search, CheckCircle, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Borrowing {
  id: number
  borrowed_date: string
  due_date: string
  returned_date: string | null
  is_returned: boolean
  fine_amount: number
  members: {
    full_name: string
    email: string
  }
  books: {
    title: string
    author: string
    id: number
  }
}

interface Member {
  id: string
  full_name: string
  email: string
}

interface Book {
  id: number
  title: string
  author: string
  available_copies: number
}

export default function AdminBorrowings() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [filteredBorrowings, setFilteredBorrowings] = useState<Borrowing[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isNewBorrowingDialogOpen, setIsNewBorrowingDialogOpen] = useState(false)

  // New borrowing form states
  const [members, setMembers] = useState<Member[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [selectedMember, setSelectedMember] = useState("")
  const [selectedBook, setSelectedBook] = useState("")
  const [borrowDays, setBorrowDays] = useState("14")

  useEffect(() => {
    loadBorrowings()
    loadMembers()
    loadBooks()
  }, [])

  useEffect(() => {
    filterBorrowings()
  }, [borrowings, searchTerm, filterStatus])

  const loadBorrowings = async () => {
    try {
      // Mock borrowings data
      const mockBorrowings = [
        {
          id: 1,
          borrowed_date: "2024-01-15",
          due_date: "2024-01-29",
          returned_date: null,
          is_returned: false,
          fine_amount: 0,
          members: {
            full_name: "John Doe",
            email: "john@example.com",
          },
          books: {
            id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
          },
        },
        {
          id: 2,
          borrowed_date: "2024-01-10",
          due_date: "2024-01-24",
          returned_date: null,
          is_returned: false,
          fine_amount: 0,
          members: {
            full_name: "John Doe",
            email: "john@example.com",
          },
          books: {
            id: 3,
            title: "1984",
            author: "George Orwell",
          },
        },
        {
          id: 3,
          borrowed_date: "2023-12-20",
          due_date: "2024-01-03",
          returned_date: "2024-01-02",
          is_returned: true,
          fine_amount: 0,
          members: {
            full_name: "Jane Smith",
            email: "jane@example.com",
          },
          books: {
            id: 5,
            title: "The Catcher in the Rye",
            author: "J.D. Salinger",
          },
        },
        {
          id: 4,
          borrowed_date: "2023-12-01",
          due_date: "2023-12-15",
          returned_date: null,
          is_returned: false,
          fine_amount: 5.5,
          members: {
            full_name: "Bob Wilson",
            email: "bob@example.com",
          },
          books: {
            id: 6,
            title: "Lord of the Flies",
            author: "William Golding",
          },
        },
      ]

      setBorrowings(mockBorrowings)
    } catch (error) {
      console.error("Error loading borrowings:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      // Mock members data
      const mockMembers = [
        {
          id: "user-456",
          full_name: "John Doe",
          email: "john@example.com",
        },
        {
          id: "user-789",
          full_name: "Jane Smith",
          email: "jane@example.com",
        },
        {
          id: "user-101",
          full_name: "Bob Wilson",
          email: "bob@example.com",
        },
      ]

      setMembers(mockMembers)
    } catch (error) {
      console.error("Error loading members:", error)
    }
  }

  const loadBooks = async () => {
    try {
      // Mock available books
      const mockBooks = [
        {
          id: 2,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          available_copies: 2,
        },
        {
          id: 4,
          title: "Pride and Prejudice",
          author: "Jane Austen",
          available_copies: 2,
        },
        {
          id: 7,
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          available_copies: 5,
        },
        {
          id: 8,
          title: "Harry Potter and the Sorcerer's Stone",
          author: "J.K. Rowling",
          available_copies: 4,
        },
      ]

      setBooks(mockBooks)
    } catch (error) {
      console.error("Error loading books:", error)
    }
  }

  const filterBorrowings = () => {
    let filtered = borrowings

    if (searchTerm) {
      filtered = filtered.filter(
        (borrowing) =>
          borrowing.members.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          borrowing.members.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          borrowing.books.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          borrowing.books.author.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus !== "all") {
      if (filterStatus === "active") {
        filtered = filtered.filter((b) => !b.is_returned)
      } else if (filterStatus === "returned") {
        filtered = filtered.filter((b) => b.is_returned)
      } else if (filterStatus === "overdue") {
        filtered = filtered.filter((b) => !b.is_returned && new Date(b.due_date) < new Date())
      }
    }

    setFilteredBorrowings(filtered)
  }

  const handleNewBorrowing = async () => {
    if (!selectedMember || !selectedBook) {
      toast({ title: "Hata", description: "Lütfen üye ve kitap seçin.", variant: "destructive" })
      return
    }

    try {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + Number.parseInt(borrowDays))

      const member = members.find((m) => m.id === selectedMember)
      const book = books.find((b) => b.id === Number.parseInt(selectedBook))

      if (!member || !book) {
        toast({ title: "Hata", description: "Seçilen üye veya kitap bulunamadı.", variant: "destructive" })
        return
      }

      const newBorrowing = {
        id: Math.max(...borrowings.map((b) => b.id)) + 1,
        borrowed_date: new Date().toISOString().split("T")[0],
        due_date: dueDate.toISOString().split("T")[0],
        returned_date: null,
        is_returned: false,
        fine_amount: 0,
        members: {
          full_name: member.full_name,
          email: member.email,
        },
        books: {
          id: book.id,
          title: book.title,
          author: book.author,
        },
      }

      setBorrowings([newBorrowing, ...borrowings])

      // Update book available copies
      const updatedBooks = books.map((b) => (b.id === book.id ? { ...b, available_copies: b.available_copies - 1 } : b))
      setBooks(updatedBooks.filter((b) => b.available_copies > 0))

      setIsNewBorrowingDialogOpen(false)
      setSelectedMember("")
      setSelectedBook("")
      setBorrowDays("14")

      toast({ title: "Başarılı", description: "Yeni ödünç verme kaydı oluşturuldu!" })
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" })
    }
  }

  const handleReturnBook = async (borrowingId: number, bookId: number) => {
    try {
      // Update borrowing record
      const updatedBorrowings = borrowings.map((borrowing) =>
        borrowing.id === borrowingId
          ? {
              ...borrowing,
              is_returned: true,
              returned_date: new Date().toISOString().split("T")[0],
            }
          : borrowing,
      )

      setBorrowings(updatedBorrowings)
      toast({ title: "Başarılı", description: "Kitap başarıyla iade edildi!" })
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" })
    }
  }

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (dueDate: string, isReturned: boolean) => {
    if (isReturned) {
      return <Badge variant="secondary">İade Edildi</Badge>
    }

    const daysRemaining = getDaysRemaining(dueDate)

    if (daysRemaining < 0) {
      return <Badge variant="destructive">Geciken ({Math.abs(daysRemaining)} gün)</Badge>
    } else if (daysRemaining <= 3) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          Kalan süre {daysRemaining} gün
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="border-green-500 text-green-600">
          {daysRemaining} gün kaldı
        </Badge>
      )
    }
  }

  if (loading) {
    return <div>Ödünç vermeler yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Ödünç Verme Yönetimi</span>
            </div>
            <Dialog open={isNewBorrowingDialogOpen} onOpenChange={setIsNewBorrowingDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Ödünç Verme
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Ödünç Verme Kaydı</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="member">Üye Seç</Label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger>
                        <SelectValue placeholder="Bir üye seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.full_name} ({member.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="book">Kitap Seç</Label>
                    <Select value={selectedBook} onValueChange={setSelectedBook}>
                      <SelectTrigger>
                        <SelectValue placeholder="Bir kitap seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {books.map((book) => (
                          <SelectItem key={book.id} value={book.id.toString()}>
                            {book.title} by {book.author} ({book.available_copies} mevcut)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="days">Ödünç Alma Süresi (gün)</Label>
                    <Select value={borrowDays} onValueChange={setBorrowDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 gün</SelectItem>
                        <SelectItem value="14">14 gün</SelectItem>
                        <SelectItem value="21">21 gün</SelectItem>
                        <SelectItem value="30">30 gün</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleNewBorrowing} className="w-full">
                    Ödünç Ver
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Üye adı, e-posta veya kitap başlığı ile arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Ödünç Vermeler</option>
              <option value="active">Aktif</option>
              <option value="returned">İade Edildi</option>
              <option value="overdue">Geciken</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredBorrowings.map((borrowing) => (
              <Card key={borrowing.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{borrowing.books.title}</h3>
                        {getStatusBadge(borrowing.due_date, borrowing.is_returned)}
                      </div>
                      <p className="text-sm text-muted-foreground">by {borrowing.books.author}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Üye: {borrowing.members.full_name}</span>
                        <span>E-posta: {borrowing.members.email}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Ödünç alındı: {new Date(borrowing.borrowed_date).toLocaleDateString()}</span>
                        <span>İade tarihi: {new Date(borrowing.due_date).toLocaleDateString()}</span>
                        {borrowing.returned_date && (
                          <span>İade edildi: {new Date(borrowing.returned_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!borrowing.is_returned && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReturnBook(borrowing.id, borrowing.books.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          İade Edildi Olarak İşaretle
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBorrowings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Arama kriterlerinize uygun ödünç verme bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
