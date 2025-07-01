import { getMany, getOne, insertOne, updateMany, deleteMany } from "./mysql"

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
    throw error
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
    throw error
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
    throw error
  }
}

// Add new book
export async function addBook(bookData: Omit<Book, "id" | "created_at" | "updated_at">) {
  try {
    const insertId = await insertOne(
      `
      INSERT INTO books (title, author, isbn, category, total_copies, available_copies, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        bookData.title,
        bookData.author,
        bookData.isbn,
        bookData.category,
        bookData.total_copies,
        bookData.available_copies,
        bookData.description || null,
      ],
    )

    return insertId
  } catch (error) {
    console.error("Add book error:", error)
    throw error
  }
}

// Update book
export async function updateBook(id: number, bookData: Partial<Omit<Book, "id" | "created_at" | "updated_at">>) {
  try {
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
      values.push(bookData.isbn)
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
      throw new Error("No fields to update")
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
  } catch (error) {
    console.error("Update book error:", error)
    throw error
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

    if (activeBorrowings.count > 0) {
      throw new Error("Bu kitap şu anda ödünç verilmiş durumda, silinemez")
    }

    const affectedRows = await deleteMany("DELETE FROM books WHERE id = ?", [id])
    return affectedRows
  } catch (error) {
    console.error("Delete book error:", error)
    throw error
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
    throw error
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
    throw error
  }
}
