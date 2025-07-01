-- MySQL Database Schema for Library Management System

-- Create database
CREATE DATABASE IF NOT EXISTS library_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_system;

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  category VARCHAR(100),
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Members table (extends users)
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  membership_date DATE DEFAULT (CURRENT_DATE),
  is_active BOOLEAN DEFAULT TRUE,
  role ENUM('admin', 'member') DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Borrowing records table
CREATE TABLE IF NOT EXISTS borrowings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id VARCHAR(36) NOT NULL,
  book_id INT NOT NULL,
  borrowed_date DATE DEFAULT (CURRENT_DATE),
  due_date DATE NOT NULL,
  returned_date DATE NULL,
  is_returned BOOLEAN DEFAULT FALSE,
  fine_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_borrowings_member_id ON borrowings(member_id);
CREATE INDEX idx_borrowings_book_id ON borrowings(book_id);
CREATE INDEX idx_borrowings_due_date ON borrowings(due_date);
CREATE INDEX idx_borrowings_is_returned ON borrowings(is_returned);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_author ON books(author);
