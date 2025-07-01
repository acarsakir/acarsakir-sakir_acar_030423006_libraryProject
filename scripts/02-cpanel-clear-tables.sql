-- Clear existing data from tables (cPanel compatible)
-- Run this before inserting new data to avoid duplicates

SET FOREIGN_KEY_CHECKS = 0;

-- Clear tables in correct order
DELETE FROM borrowings;
DELETE FROM members;
DELETE FROM users;
DELETE FROM books;

-- Reset auto increment counters
ALTER TABLE books AUTO_INCREMENT = 1;
ALTER TABLE borrowings AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;
