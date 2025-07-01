-- Create tables for the library system

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  category VARCHAR(100),
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  membership_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Borrowing records table
CREATE TABLE IF NOT EXISTS borrowings (
  id SERIAL PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  book_id INTEGER REFERENCES books(id),
  borrowed_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  returned_date DATE,
  is_returned BOOLEAN DEFAULT false,
  fine_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_borrowings_member_id ON borrowings(member_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_book_id ON borrowings(book_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_due_date ON borrowings(due_date);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
