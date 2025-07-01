-- Insert sample books
INSERT INTO books (title, author, isbn, category, total_copies, available_copies) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Fiction', 3, 3),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', 2, 2),
('1984', 'George Orwell', '9780451524935', 'Dystopian Fiction', 4, 4),
('Pride and Prejudice', 'Jane Austen', '9780141439518', 'Romance', 2, 2),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 'Fiction', 3, 3),
('Lord of the Flies', 'William Golding', '9780571056866', 'Fiction', 2, 2),
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fantasy', 5, 5),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '9780439708180', 'Fantasy', 4, 4),
('The Da Vinci Code', 'Dan Brown', '9780307474278', 'Mystery', 3, 3),
('The Alchemist', 'Paulo Coelho', '9780061122415', 'Philosophy', 2, 2);

-- Note: Members will be created through the registration process
-- Admin user should be created manually through Supabase auth
