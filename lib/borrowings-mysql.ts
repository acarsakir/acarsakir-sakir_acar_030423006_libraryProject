import { getMany, updateMany, transaction } from "./mysql"

export interface Borrowing {
  id: number
  member_id: string
  book_id: number
  borrowed_date: string
  due_date: string
  returned_date?: string
  is_returned: boolean
  fine_amount: number
  created_at: string
  updated_at: string
  // Joined data
  member_name?: string
  member_email?: string
  book_title?: string
  book_author?: string
}

// Get all borrowings with member and book info
export async function getAllBorrowings() {
  try {
    const borrowings = await getMany(`
      SELECT b.id, b.member_id, b.book_id, b.borrowed_date, b.due_date, 
             b.returned_date, b.is_returned, b.fine_amount, b.created_at, b.updated_at,
             m.full_name as member_name, m.email as member_email,
             bk.title as book_title, bk.author as book_author
      FROM borrowings b
      JOIN members m ON b.member_id = m.id
      JOIN books bk ON b.book_id = bk.id
      ORDER BY b.created_at DESC
    `)
    return borrowings as Borrowing[]
  } catch (error) {
    console.error("Get borrowings error:", error)
    throw error
  }
}

// Get borrowings for a specific member
export async function getMemberBorrowings(memberId: string) {
  try {
    const borrowings = await getMany(
      `
      SELECT b.id, b.member_id, b.book_id, b.borrowed_date, b.due_date, 
             b.returned_date, b.is_returned, b.fine_amount, b.created_at, b.updated_at,
             bk.title as book_title, bk.author as book_author
      FROM borrowings b
      JOIN books bk ON b.book_id = bk.id
      WHERE b.member_id = ?
      ORDER BY b.created_at DESC
    `,
      [memberId],
    )
    return borrowings as Borrowing[]
  } catch (error) {
    console.error("Get member borrowings error:", error)
    throw error
  }
}

// Create new borrowing
export async function createBorrowing(memberId: string, bookId: number, daysToReturn = 14) {
  try {
    return await transaction(async (connection) => {
      // Check if book is available
      const [bookResult] = await connection.execute("SELECT available_copies FROM books WHERE id = ?", [bookId])

      if (!bookResult[0] || bookResult[0].available_copies <= 0) {
        throw new Error("Bu kitap şu anda mevcut değil")
      }

      // Calculate due date
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + daysToReturn)

      // Insert borrowing record
      const [borrowResult] = await connection.execute(
        `
        INSERT INTO borrowings (member_id, book_id, due_date)
        VALUES (?, ?, ?)
      `,
        [memberId, bookId, dueDate.toISOString().split("T")[0]],
      )

      // Update book available copies
      await connection.execute("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?", [bookId])

      return borrowResult.insertId
    })
  } catch (error) {
    console.error("Create borrowing error:", error)
    throw error
  }
}

// Return book
export async function returnBook(borrowingId: number) {
  try {
    return await transaction(async (connection) => {
      // Get borrowing info
      const [borrowingResult] = await connection.execute("SELECT book_id, is_returned FROM borrowings WHERE id = ?", [
        borrowingId,
      ])

      if (!borrowingResult[0]) {
        throw new Error("Ödünç verme kaydı bulunamadı")
      }

      if (borrowingResult[0].is_returned) {
        throw new Error("Bu kitap zaten iade edilmiş")
      }

      // Update borrowing record
      await connection.execute(
        `
        UPDATE borrowings 
        SET is_returned = TRUE, returned_date = CURDATE()
        WHERE id = ?
      `,
        [borrowingId],
      )

      // Update book available copies
      await connection.execute("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?", [
        borrowingResult[0].book_id,
      ])

      return true
    })
  } catch (error) {
    console.error("Return book error:", error)
    throw error
  }
}

// Get overdue borrowings
export async function getOverdueBorrowings() {
  try {
    const borrowings = await getMany(`
      SELECT b.id, b.member_id, b.book_id, b.borrowed_date, b.due_date, 
             b.returned_date, b.is_returned, b.fine_amount, b.created_at, b.updated_at,
             m.full_name as member_name, m.email as member_email,
             bk.title as book_title, bk.author as book_author,
             DATEDIFF(CURDATE(), b.due_date) as days_overdue
      FROM borrowings b
      JOIN members m ON b.member_id = m.id
      JOIN books bk ON b.book_id = bk.id
      WHERE b.is_returned = FALSE AND b.due_date < CURDATE()
      ORDER BY b.due_date ASC
    `)
    return borrowings as (Borrowing & { days_overdue: number })[]
  } catch (error) {
    console.error("Get overdue borrowings error:", error)
    throw error
  }
}

// Calculate and update fines for overdue books
export async function calculateFines(finePerDay = 2.5) {
  try {
    const affectedRows = await updateMany(
      `
      UPDATE borrowings 
      SET fine_amount = GREATEST(0, DATEDIFF(CURDATE(), due_date) * ?)
      WHERE is_returned = FALSE AND due_date < CURDATE()
    `,
      [finePerDay],
    )

    return affectedRows
  } catch (error) {
    console.error("Calculate fines error:", error)
    throw error
  }
}
