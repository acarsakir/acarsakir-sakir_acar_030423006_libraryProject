"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, BookOpen, Plus, Trash2, Edit, RefreshCw } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"

interface Book {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  total_copies: number
  available_copies: number
  description?: string
}

// Local storage key for persistence in preview
const BOOKS_STORAGE_KEY = "library_books_preview"

export default function BooksCatalog() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [user, setUser] = useState<any>(null)
  const [member, setMember] = useState<any>(null)

  // Form states
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    total_copies: 1,
    description: "",
  })

  const [editBook, setEditBook] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    total_copies: 1,
    available_copies: 1,
    description: "",
  })

  useEffect(() => {
    loadUserAndBooks()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [books, searchTerm, selectedCategory])

  // Save books to localStorage whenever books change
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books))
    }
  }, [books])

  const loadUserAndBooks = async () => {
    try {
      const { user, member } = await getCurrentUser()
      setUser(user)
      setMember(member)

      if (member?.role === "admin") {
        await loadBooks()
      }
    } catch (error) {
      console.error("Error loading user:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadBooks = async () => {
    try {
      // Try to load from localStorage first
      const savedBooks = localStorage.getItem(BOOKS_STORAGE_KEY)

      if (savedBooks) {
        const parsedBooks = JSON.parse(savedBooks)
        setBooks(parsedBooks)

        // Extract unique categories
        const uniqueCategories = [...new Set(parsedBooks.map((book: Book) => book.category))]
        setCategories(uniqueCategories)

        toast({
          title: "📚 Veriler Yüklendi",
          description: "Önceki oturumdan kaydedilen kitaplar yüklendi!",
          className: "bg-blue-50 border-blue-200 text-blue-800",
        })
        return
      }

      // Default mock books data if no saved data
      const mockBooks = [
        {
          id: 1,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          isbn: "9780743273565",
          category: "Fiction",
          total_copies: 3,
          available_copies: 2,
          description: "A classic American novel set in the Jazz Age.",
        },
        {
          id: 2,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          isbn: "9780061120084",
          category: "Fiction",
          total_copies: 2,
          available_copies: 2,
          description: "A gripping tale of racial injustice and childhood innocence.",
        },
        {
          id: 3,
          title: "1984",
          author: "George Orwell",
          isbn: "9780451524935",
          category: "Dystopian Fiction",
          total_copies: 4,
          available_copies: 3,
          description: "A dystopian social science fiction novel.",
        },
        {
          id: 4,
          title: "Pride and Prejudice",
          author: "Jane Austen",
          isbn: "9780141439518",
          category: "Romance",
          total_copies: 2,
          available_copies: 2,
          description: "A romantic novel of manners.",
        },
        {
          id: 5,
          title: "The Catcher in the Rye",
          author: "J.D. Salinger",
          isbn: "9780316769174",
          category: "Fiction",
          total_copies: 3,
          available_copies: 3,
          description: "A controversial novel about teenage rebellion.",
        },
        {
          id: 6,
          title: "Lord of the Flies",
          author: "William Golding",
          isbn: "9780571056866",
          category: "Fiction",
          total_copies: 2,
          available_copies: 1,
          description: "A novel about the dark side of human nature.",
        },
        {
          id: 7,
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          isbn: "9780547928227",
          category: "Fantasy",
          total_copies: 5,
          available_copies: 5,
          description: "A fantasy adventure novel.",
        },
        {
          id: 8,
          title: "Harry Potter and the Sorcerer's Stone",
          author: "J.K. Rowling",
          isbn: "9780439708180",
          category: "Fantasy",
          total_copies: 4,
          available_copies: 4,
          description: "The first book in the Harry Potter series.",
        },
      ]

      setBooks(mockBooks)

      // Extract unique categories
      const uniqueCategories = [...new Set(mockBooks.map((book) => book.category))]
      setCategories(uniqueCategories)

      toast({
        title: "📚 Varsayılan Veriler Yüklendi",
        description: "Başlangıç kitap koleksiyonu hazırlandı!",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Error loading books:", error)
    }
  }

  const resetToDefaults = () => {
    localStorage.removeItem(BOOKS_STORAGE_KEY)
    loadBooks()
    toast({
      title: "🔄 Veriler Sıfırlandı",
      description: "Kitap koleksiyonu varsayılan haline döndürüldü!",
      className: "bg-orange-50 border-orange-200 text-orange-800",
    })
  }

  const filterBooks = () => {
    let filtered = books

    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.isbn.includes(searchTerm),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((book) => book.category === selectedCategory)
    }

    setFilteredBooks(filtered)
  }

  const handleAddBook = async () => {
    try {
      if (!newBook.title || !newBook.author || !newBook.isbn) {
        toast({ title: "Hata", description: "Lütfen tüm zorunlu alanları doldurun.", variant: "destructive" })
        return
      }

      const bookToAdd = {
        id: Math.max(...books.map((b) => b.id), 0) + 1,
        ...newBook,
        available_copies: newBook.total_copies,
      }

      const updatedBooks = [...books, bookToAdd]
      setBooks(updatedBooks)

      setNewBook({
        title: "",
        author: "",
        isbn: "",
        category: "",
        total_copies: 1,
        description: "",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "✅ Kitap Eklendi",
        description: `"${bookToAdd.title}" başarıyla eklendi ve kaydedildi!`,
        className: "bg-green-50 border-green-200 text-green-800",
      })

      // Update categories if new category added
      if (newBook.category && !categories.includes(newBook.category)) {
        setCategories([...categories, newBook.category])
      }
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" })
    }
  }

  const handleEditBook = async () => {
    try {
      if (!editBook.title || !editBook.author || !editBook.isbn) {
        toast({ title: "Hata", description: "Lütfen tüm zorunlu alanları doldurun.", variant: "destructive" })
        return
      }

      if (editBook.available_copies > editBook.total_copies) {
        toast({
          title: "Hata",
          description: "Mevcut kopya sayısı toplam kopya sayısından fazla olamaz.",
          variant: "destructive",
        })
        return
      }

      const updatedBooks = books.map((book) =>
        book.id === editingBook?.id
          ? {
              ...book,
              title: editBook.title,
              author: editBook.author,
              isbn: editBook.isbn,
              category: editBook.category,
              total_copies: editBook.total_copies,
              available_copies: editBook.available_copies,
              description: editBook.description,
            }
          : book,
      )

      setBooks(updatedBooks)
      setIsEditDialogOpen(false)
      setEditingBook(null)

      toast({
        title: "✅ Kitap Güncellendi",
        description: `"${editBook.title}" başarıyla güncellendi ve kaydedildi!`,
        className: "bg-green-50 border-green-200 text-green-800",
      })

      // Update categories if new category added
      if (editBook.category && !categories.includes(editBook.category)) {
        setCategories([...categories, editBook.category])
      }
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" })
    }
  }

  const openEditDialog = (book: Book) => {
    setEditingBook(book)
    setEditBook({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      total_copies: book.total_copies,
      available_copies: book.available_copies,
      description: book.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteBook = async (bookId: number) => {
    try {
      const bookToDelete = books.find((b) => b.id === bookId)
      const updatedBooks = books.filter((book) => book.id !== bookId)
      setBooks(updatedBooks)

      toast({
        title: "🗑️ Kitap Silindi",
        description: `"${bookToDelete?.title}" başarıyla silindi!`,
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" })
    }
  }

  if (loading) {
    return <div>Yükleniyor...</div>
  }

  if (!user || !member) {
    return <div>Kullanıcı bilgileri yükleniyor...</div>
  }

  if (member.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Bu bölüm üyeler için mevcut değildir.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Kitap Yönetimi</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Preview Mode - LocalStorage
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetToDefaults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Varsayılana Sıfırla
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Kitap Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Yeni Kitap Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Kitap Başlığı *</Label>
                      <Input
                        id="title"
                        value={newBook.title}
                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        placeholder="Kitap başlığını girin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Yazar *</Label>
                      <Input
                        id="author"
                        value={newBook.author}
                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                        placeholder="Yazar adını girin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="isbn">ISBN *</Label>
                      <Input
                        id="isbn"
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                        placeholder="ISBN numarasını girin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Kategori</Label>
                      <Input
                        id="category"
                        value={newBook.category}
                        onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                        placeholder="Kategori girin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="copies">Kopya Sayısı</Label>
                      <Input
                        id="copies"
                        type="number"
                        min="1"
                        value={newBook.total_copies}
                        onChange={(e) => setNewBook({ ...newBook, total_copies: Number.parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Açıklama</Label>
                      <Textarea
                        id="description"
                        value={newBook.description}
                        onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                        placeholder="Kitap açıklaması (isteğe bağlı)"
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleAddBook} className="w-full">
                      Kitap Ekle
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Başlık, yazar veya ISBN ile arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1">{book.title}</h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(book)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBook(book.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground">by {book.author}</p>
                    {book.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{book.category}</Badge>
                      <div className="text-sm text-muted-foreground">
                        {book.available_copies > 0 ? (
                          <span className="text-green-600">{book.available_copies} mevcut</span>
                        ) : (
                          <span className="text-red-600">Mevcut değil</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>ISBN: {book.isbn}</div>
                      <div>Toplam kopya: {book.total_copies}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Arama kriterlerinize uygun kitap bulunamadı.</div>
          )}
        </CardContent>
      </Card>

      {/* Edit Book Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kitap Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Kitap Başlığı *</Label>
              <Input
                id="edit-title"
                value={editBook.title}
                onChange={(e) => setEditBook({ ...editBook, title: e.target.value })}
                placeholder="Kitap başlığını girin"
              />
            </div>
            <div>
              <Label htmlFor="edit-author">Yazar *</Label>
              <Input
                id="edit-author"
                value={editBook.author}
                onChange={(e) => setEditBook({ ...editBook, author: e.target.value })}
                placeholder="Yazar adını girin"
              />
            </div>
            <div>
              <Label htmlFor="edit-isbn">ISBN *</Label>
              <Input
                id="edit-isbn"
                value={editBook.isbn}
                onChange={(e) => setEditBook({ ...editBook, isbn: e.target.value })}
                placeholder="ISBN numarasını girin"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Kategori</Label>
              <Input
                id="edit-category"
                value={editBook.category}
                onChange={(e) => setEditBook({ ...editBook, category: e.target.value })}
                placeholder="Kategori girin"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-total-copies">Toplam Kopya</Label>
                <Input
                  id="edit-total-copies"
                  type="number"
                  min="1"
                  value={editBook.total_copies}
                  onChange={(e) => setEditBook({ ...editBook, total_copies: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-available-copies">Mevcut Kopya</Label>
                <Input
                  id="edit-available-copies"
                  type="number"
                  min="0"
                  max={editBook.total_copies}
                  value={editBook.available_copies}
                  onChange={(e) => setEditBook({ ...editBook, available_copies: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Açıklama</Label>
              <Textarea
                id="edit-description"
                value={editBook.description}
                onChange={(e) => setEditBook({ ...editBook, description: e.target.value })}
                placeholder="Kitap açıklaması (isteğe bağlı)"
                rows={3}
              />
            </div>
            <Button onClick={handleEditBook} className="w-full">
              Güncelle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
