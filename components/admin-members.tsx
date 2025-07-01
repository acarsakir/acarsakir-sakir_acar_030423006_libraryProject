"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Users, Plus, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Member {
  id: string
  full_name: string
  email: string
  phone: string
  address: string
  membership_date: string
  is_active: boolean
  role: string
}

interface Book {
  id: number
  title: string
  author: string
  available_copies: number
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedBook, setSelectedBook] = useState("")
  const [borrowDays, setBorrowDays] = useState("14")
  const [loading, setLoading] = useState(true)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  useEffect(() => {
    loadMembers()
    loadBooks()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm])

  const loadMembers = async () => {
    try {
      // Updated mock members data with Turkish names
      const mockMembers = [
        {
          id: "user-456",
          full_name: "John Doe",
          email: "john@example.com",
          phone: "+90 555 987 6543",
          address: "Okuyucu Sokak No:15, Kadıköy/İstanbul",
          membership_date: "2023-06-15",
          is_active: true,
          role: "member",
        },
        {
          id: "user-789",
          full_name: "Mehmet Demir",
          email: "mehmet@gmail.com",
          phone: "+90 544 321 9876",
          address: "Kitap Mahallesi No:42, Beşiktaş/İstanbul",
          membership_date: "2023-08-20",
          is_active: true,
          role: "member",
        },
        {
          id: "user-101",
          full_name: "Ayşe Kaya",
          email: "ayse@hotmail.com",
          phone: "+90 533 654 3210",
          address: "Bilim Caddesi No:8, Üsküdar/İstanbul",
          membership_date: "2023-09-10",
          is_active: true,
          role: "member",
        },
        {
          id: "user-202",
          full_name: "Fatma Özkan",
          email: "fatma@yahoo.com",
          phone: "+90 505 789 1234",
          address: "Eğitim Sokak No:33, Şişli/İstanbul",
          membership_date: "2023-10-05",
          is_active: false,
          role: "member",
        },
        {
          id: "user-303",
          full_name: "Ali Çelik",
          email: "ali@outlook.com",
          phone: "+90 542 147 8520",
          address: "Kültür Mahallesi No:17, Bakırköy/İstanbul",
          membership_date: "2023-11-12",
          is_active: true,
          role: "member",
        },
      ]

      setMembers(mockMembers)
    } catch (error) {
      console.error("Error loading members:", error)
    } finally {
      setLoading(false)
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
          id: 3,
          title: "1984",
          author: "George Orwell",
          available_copies: 3,
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
      ]

      setBooks(mockBooks)
    } catch (error) {
      console.error("Error loading books:", error)
    }
  }

  const filterMembers = () => {
    let filtered = members

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredMembers(filtered)
  }

  const handleAssignBook = async () => {
    if (!selectedMember || !selectedBook) return

    try {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + Number.parseInt(borrowDays))

      // Create borrowing record
      const { error: borrowError } = await supabase.from("borrowings").insert({
        member_id: selectedMember.id,
        book_id: Number.parseInt(selectedBook),
        due_date: dueDate.toISOString().split("T")[0],
      })

      if (borrowError) throw borrowError

      // Update book available copies
      const book = books.find((b) => b.id === Number.parseInt(selectedBook))
      if (book) {
        const { error: updateError } = await supabase
          .from("books")
          .update({ available_copies: book.available_copies - 1 })
          .eq("id", Number.parseInt(selectedBook))

        if (updateError) throw updateError
      }

      toast({ title: "Başarılı", description: "Kitap başarıyla atandı!" })
      setIsAssignDialogOpen(false)
      setSelectedMember(null)
      setSelectedBook("")
      loadBooks() // Refresh available books
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" })
    }
  }

  if (loading) {
    return <div>Üyeler yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Üye Yönetimi</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Üyeleri ad veya e-posta ile arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{member.full_name}</h3>
                        <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
                        <Badge variant={member.is_active ? "outline" : "destructive"}>
                          {member.is_active ? "Aktif" : "Pasif"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      {member.phone && <p className="text-sm text-muted-foreground">{member.phone}</p>}
                      <p className="text-xs text-muted-foreground">
                        Üyelik tarihi: {new Date(member.membership_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog
                        open={isAssignDialogOpen && selectedMember?.id === member.id}
                        onOpenChange={(open) => {
                          setIsAssignDialogOpen(open)
                          if (open) setSelectedMember(member)
                          else setSelectedMember(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Kitap Ata
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Kitap Ata: {member.full_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
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
                            <Button onClick={handleAssignBook} className="w-full">
                              Kitap Ata
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Arama kriterlerinize uygun üye bulunamadı.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
