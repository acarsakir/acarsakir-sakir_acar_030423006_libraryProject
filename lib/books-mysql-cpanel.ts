import { getMany, getOne, insertOne, updateMany, deleteMany } from "./mysql-cpanel"

export interface Book {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  total_copies: number
  available_copies: number
  description?: string
  created_at: string
  updated_at: string
}

// Get all books
export async function getAllBooks() {
  try {
    const books = await getMany(`
      SELECT id, title, author, isbn, category, total_copies, 
             available_copies, description, created_at, updated_at
      FROM books 
      ORDER BY created_at DESC
    `)
    return books as Book[]
  } catch (error) {
    console.error("Get books error:", error)
    throw new Error("Kitaplar yüklenirken hata oluştu")
  }
}

// Get available books (for borrowing)
export async function getAvailableBooks() {
  try {
    const books = await getMany(`
      SELECT id, title, author, isbn, category, total_copies, 
             available_copies, description
      FROM books 
      WHERE available_copies > 0
      ORDER BY title
    `)
    return books as Book[]
  } catch (error) {
    console.error("Get available books error:", error)
    throw new Error("Mevcut kitaplar yüklenirken hata oluştu")
  }
}

// Get book by ID
export async function getBookById(id: number) {
  try {
    const book = await getOne(
      `
      SELECT id, title, author, isbn, category, total_copies, 
             available_copies, description, created_at, updated_at
      FROM books 
      WHERE id = ?
    `,
      [id],
    )
    return book as Book | null
  } catch (error) {
    console.error("Get book error:", error)
    throw new Error("Kitap bilgileri yüklenirken hata oluştu")
  }
}

// Add new book with duplicate check
export async function addBook(bookData: Omit<Book, "id" | "created_at" | "updated_at">) {
  try {
    // Check for duplicate ISBN if provided
    if (bookData.isbn && bookData.isbn.trim()) {
      const existingBook = await getOne("SELECT id FROM books WHERE isbn = ?", [bookData.isbn])
      if (existingBook) {
        throw new Error(`Bu ISBN numarası (${bookData.isbn}) zaten kullanılıyor`)
      }
    }

    const insertId = await insertOne(
      `
      INSERT INTO books (title, author, isbn, category, total_copies, available_copies, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        bookData.title,
        bookData.author,
        bookData.isbn || null,
        bookData.category,
        bookData.total_copies,
        bookData.available_copies,
        bookData.description || null,
      ],
    )

    return insertId
  } catch (error: any) {
    console.error("Add book error:", error)
    // Handle cPanel specific errors
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Bu ISBN numarası zaten kullanılıyor")
    }
    throw new Error(error.message || "Kitap eklenirken hata oluştu")
  }
}

// Update book with duplicate check
export async function updateBook(id: number, bookData: Partial<Omit<Book, "id" | "created_at" | "updated_at">>) {
  try {
    // Check for duplicate ISBN if ISBN is being updated
    if (bookData.isbn && bookData.isbn.trim()) {
      const existingBook = await getOne("SELECT id FROM books WHERE isbn = ? AND id != ?", [bookData.isbn, id])
      if (existingBook) {
        throw new Error(`Bu ISBN numarası (${bookData.isbn}) başka bir kitap tarafından kullanılıyor`)
      }
    }

    const fields = []
    const values = []

    if (bookData.title !== undefined) {
      fields.push("title = ?")
      values.push(bookData.title)
    }
    if (bookData.author !== undefined) {
      fields.push("author = ?")
      values.push(bookData.author)
    }
    if (bookData.isbn !== undefined) {
      fields.push("isbn = ?")
      values.push(bookData.isbn || null)
    }
    if (bookData.category !== undefined) {
      fields.push("category = ?")
      values.push(bookData.category)
    }
    if (bookData.total_copies !== undefined) {
      fields.push("total_copies = ?")
      values.push(bookData.total_copies)
    }
    if (bookData.available_copies !== undefined) {
      fields.push("available_copies = ?")
      values.push(bookData.available_copies)
    }
    if (bookData.description !== undefined) {
      fields.push("description = ?")
      values.push(bookData.description)
    }

    if (fields.length === 0) {
      throw new Error("Güncellenecek alan bulunamadı")
    }

    values.push(id)

    const affectedRows = await updateMany(
      `
      UPDATE books 
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      values,
    )

    return affectedRows
  } catch (error: any) {
    console.error("Update book error:", error)
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Bu ISBN numarası başka bir kitap tarafından kullanılıyor")
    }
    throw new Error(error.message || "Kitap güncellenirken hata oluştu")
  }
}

// Delete book
export async function deleteBook(id: number) {
  try {
    // Check if book has active borrowings
    const activeBorrowings = await getOne(
      `
      SELECT COUNT(*) as count 
      FROM borrowings 
      WHERE book_id = ? AND is_returned = FALSE
    `,
      [id],
    )

    if (activeBorrowings && activeBorrowings.count > 0) {
      throw new Error("Bu kitap şu anda ödünç verilmiş durumda, silinemez")
    }

    const affectedRows = await deleteMany("DELETE FROM books WHERE id = ?", [id])
    return affectedRows
  } catch (error: any) {
    console.error("Delete book error:", error)
    throw new Error(error.message || "Kitap silinirken hata oluştu")
  }
}

// Get book categories
export async function getBookCategories() {
  try {
    const categories = await getMany(`
      SELECT DISTINCT category 
      FROM books 
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `)
    return categories.map((c) => c.category)
  } catch (error) {
    console.error("Get categories error:", error)
    return []
  }
}

// Search books
export async function searchBooks(searchTerm: string, category?: string) {
  try {
    let query = `
      SELECT id, title, author, isbn, category, total_copies, 
             available_copies, description, created_at, updated_at
      FROM books 
      WHERE (title LIKE ? OR author LIKE ? OR isbn LIKE ?)
    `
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]

    if (category && category !== "all") {
      query += " AND category = ?"
      params.push(category)
    }

    query += " ORDER BY title"

    const books = await getMany(query, params)
    return books as Book[]
  } catch (error) {
    console.error("Search books error:", error)
    throw new Error("Kitap arama sırasında hata oluştu")
  }
}

// Generate unique ISBN for cPanel
export async function generateUniqueISBN() {
  let isbn: string
  let attempts = 0
  const maxAttempts = 10

  do {
    // Generate a random 13-digit ISBN
    isbn =
      "978" +
      Math.floor(Math.random() * 10000000000)
        .toString()
        .padStart(10, "0")

    try {
      const existing = await getOne("SELECT id FROM books WHERE isbn = ?", [isbn])
      if (!existing) {
        return isbn
      }
    } catch (error) {
      console.error("ISBN check error:", error)
    }

    attempts++
  } while (attempts < maxAttempts)

  throw new Error("Benzersiz ISBN oluşturulamadı")
}
