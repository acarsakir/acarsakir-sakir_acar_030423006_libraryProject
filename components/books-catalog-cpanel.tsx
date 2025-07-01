"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, BookOpen, Plus, Trash2, Edit, Server, AlertCircle } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-mysql-cpanel"
import {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
  getBookCategories,
  searchBooks,
  generateUniqueISBN,
} from "@/lib/books-mysql-cpanel"
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

export default function BooksCatalogCPanel() {
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
    if (searchTerm || selectedCategory !== "all") {
      handleSearch()
    } else {
      setFilteredBooks(books)
    }
  }, [books, searchTerm, selectedCategory])

  const loadUserAndBooks = async () => {
    try {
      const { user, member } = await getCurrentUser()
      setUser(user)
      setMember(member)

      if (member?.role === "admin") {
        await loadBooks()
        await loadCategories()
      }
    } catch (error) {
      console.error("Error loading user:", error)
      toast({
        title: "Bağlantı Hatası",
        description: "cPanel MySQL bağlantısı kurulamadı. Lütfen ayarları kontrol edin.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadBooks = async () => {
    try {
      const booksData = await getAllBooks()
      setBooks(booksData)
      toast({
        title: "📚 Veriler Yüklendi",
        description: `${booksData.length} kitap cPanel MySQL'den yüklendi!`,
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error: any) {
      console.error("Error loading books:", error)
      toast({
        title: "Veri Yükleme Hatası",
        description: error.message || "Kitaplar yüklenirken hata oluştu",
        variant: "destructive",
      })
    }
  }

  const loadCategories = async () => {
    try {
      const categoriesData = await getBookCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const handleSearch = async () => {
    try {
      if (!searchTerm && selectedCategory === "all") {
        setFilteredBooks(books)
        return
      }

      const results = await searchBooks(searchTerm, selectedCategory)
      setFilteredBooks(results)
    } catch (error: any) {
      console.error("Error searching books:", error)
      toast({
        title: "Arama Hatası",
        description: error.message || "Arama sırasında hata oluştu",
        variant: "destructive",
      })
    }
  }

  const generateISBN = async () => {
    try {
      const isbn = await generateUniqueISBN()
      setNewBook({ ...newBook, isbn })
      toast({
        title: "ISBN Oluşturuldu",
        description: `Benzersiz ISBN: ${isbn}`,
        className: "bg-blue-50 border-blue-200 text-blue-800",
      })
    } catch (error: any) {
      toast({
        title: "ISBN Hatası",
        description: error.message || "ISBN oluşturulamadı",
        variant: "destructive",
      })
    }
  }

  const handleAddBook = async () => {
    try {
      if (!newBook.title || !newBook.author) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen en az başlık ve yazar alanlarını doldurun.",
          variant: "destructive",
        })
        return
      }

      const bookData = {
        ...newBook,
        available_copies: newBook.total_copies,
      }

      await addBook(bookData)
      await loadBooks()
      await loadCategories()

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
        description: `"${newBook.title}" cPanel MySQL'e başarıyla eklendi!`,
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error: any) {
      console.error("Error adding book:", error)
      toast({
        title: "Ekleme Hatası",
        description: error.message || "Kitap eklenirken hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleEditBook = async () => {
    try {
      if (!editBook.title || !editBook.author || !editingBook) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen en az başlık ve yazar alanlarını doldurun.",
          variant: "destructive",
        })
        return
      }

      if (editBook.available_copies > editBook.total_copies) {
        toast({
          title: "Geçersiz Değer",
          description: "Mevcut kopya sayısı toplam kopya sayısından fazla olamaz.",
          variant: "destructive",
        })
        return
      }

      await updateBook(editingBook.id, editBook)
      await loadBooks()
      await loadCategories()

      setIsEditDialogOpen(false)
      setEditingBook(null)

      toast({
        title: "✅ Kitap Güncellendi",
        description: `"${editBook.title}" başarıyla güncellendi!`,
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error: any) {
      console.error("Error updating book:", error)
      toast({
        title: "Güncelleme Hatası",
        description: error.message || "Kitap güncellenirken hata oluştu",
        variant: "destructive",
      })
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
      await deleteBook(bookId)
      await loadBooks()

      toast({
        title: "🗑️ Kitap Silindi",
        description: `"${bookToDelete?.title}" başarıyla silindi!`,
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } catch (error: any) {
      console.error("Error deleting book:", error)
      toast({
        title: "Silme Hatası",
        description: error.message || "Kitap silinirken hata oluştu",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Server className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          <p>cPanel MySQL bağlantısı kuruluyor...</p>
        </div>
      </div>
    )
  }

  if (!user || !member) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <p className="text-lg text-muted-foreground">Kullanıcı bilgileri yüklenemedi</p>
          <p className="text-sm text-muted-foreground">cPanel MySQL ayarlarını kontrol edin</p>
        </div>
      </div>
    )
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
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                <Server className="h-3 w-3 mr-1" />
                cPanel MySQL
              </Badge>
            </div>
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
                    <Label htmlFor="isbn">ISBN</Label>
                    <div className="flex gap-2">
                      <Input
                        id="isbn"
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                        placeholder="ISBN numarasını girin"
                      />
                      <Button type="button" variant="outline" onClick={generateISBN}>
                        Oluştur
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      ISBN boş bırakılabilir veya otomatik oluşturulabilir
                    </p>
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
                      <div>ISBN: {book.isbn || "Belirtilmemiş"}</div>
                      <div>Toplam kopya: {book.total_copies}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedCategory !== "all"
                ? "Arama kriterlerinize uygun kitap bulunamadı."
                : "Henüz kitap eklenmemiş."}
            </div>
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
              <Label htmlFor="edit-isbn">ISBN</Label>
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
