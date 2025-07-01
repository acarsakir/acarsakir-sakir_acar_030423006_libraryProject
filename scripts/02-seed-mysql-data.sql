-- Insert sample books
INSERT INTO books (title, author, isbn, category, total_copies, available_copies, description) VALUES
('Suç ve Ceza', 'Fyodor Dostoyevski', '9789750719387', 'Klasik Edebiyat', 3, 3, 'Rus edebiyatının başyapıtlarından biri'),
('Tutunamayanlar', 'Oğuz Atay', '9789750738265', 'Türk Edebiyatı', 2, 2, 'Modern Türk edebiyatının önemli eseri'),
('1984', 'George Orwell', '9780451524935', 'Distopya', 4, 4, 'Totaliter rejimi anlatan distopik roman'),
('Gurur ve Önyargı', 'Jane Austen', '9780141439518', 'Romantik', 2, 2, 'İngiliz edebiyatının klasik aşk romanı'),
('Çalıkuşu', 'Reşat Nuri Güntekin', '9789750738272', 'Türk Edebiyatı', 3, 3, 'Türk edebiyatının sevilen romanı'),
('Sineklerin Tanrısı', 'William Golding', '9780571056866', 'Klasik Edebiyat', 2, 2, 'İnsan doğası üzerine düşündüren roman'),
('Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fantastik', 5, 5, 'Orta Dünya maceralarının başlangıcı'),
('Harry Potter ve Felsefe Taşı', 'J.K. Rowling', '9789750738289', 'Fantastik', 4, 4, 'Büyücülük dünyasına giriş'),
('Da Vinci Şifresi', 'Dan Brown', '9780307474278', 'Gizem', 3, 3, 'Tarihsel gizem ve macera romanı'),
('Simyacı', 'Paulo Coelho', '9789750738296', 'Felsefe', 2, 2, 'Kişisel gelişim ve felsefe'),
('Beyaz Zambaklar Ülkesinde', 'Grigory Petrov', '9789750738303', 'Gezi', 2, 2, 'Finlandiya gezi notları'),
('İnce Memed', 'Yaşar Kemal', '9789750738310', 'Türk Edebiyatı', 3, 3, 'Anadolu insanının destanı');

-- Insert sample users (passwords are hashed versions of simple passwords)
-- Note: In production, use proper password hashing like bcrypt
INSERT INTO users (id, email, password_hash) VALUES
('admin-123-456-789', 'admin@kutuphane.com', '$2b$10$rOzJqQZQXQXQXQXQXQXQXu'), -- password: admin123
('admin-456-789-012', 'yonetici@kutuphane.com', '$2b$10$rOzJqQZQXQXQXQXQXQXQXu'), -- password: yonetici2024
('user-456-789-123', 'mehmet@gmail.com', '$2b$10$rOzJqQZQXQXQXQXQXQXQXu'), -- password: mehmet456
('user-789-012-345', 'ayse@hotmail.com', '$2b$10$rOzJqQZQXQXQXQXQXQXQXu'), -- password: ayse789
('user-012-345-678', 'ali@outlook.com', '$2b$10$rOzJqQZQXQXQXQXQXQXQXu'), -- password: ali654
('user-345-678-901', 'fatma@yahoo.com', '$2b$10$rOzJqQZQXQXQXQXQXQXQXu'); -- password: fatma321

-- Insert sample members
INSERT INTO members (id, full_name, email, phone, address, membership_date, is_active, role) VALUES
('admin-123-456-789', 'Kütüphane Yöneticisi', 'admin@kutuphane.com', '+90 555 123 4567', 'Kütüphane Caddesi No:1, Merkez/İstanbul', '2023-01-01', TRUE, 'admin'),
('admin-456-789-012', 'Ahmet Yılmaz', 'yonetici@kutuphane.com', '+90 532 987 6543', 'Atatürk Bulvarı No:25, Çankaya/Ankara', '2023-02-15', TRUE, 'admin'),
('user-456-789-123', 'Mehmet Demir', 'mehmet@gmail.com', '+90 544 321 9876', 'Kitap Mahallesi No:42, Beşiktaş/İstanbul', '2023-06-15', TRUE, 'member'),
('user-789-012-345', 'Ayşe Kaya', 'ayse@hotmail.com', '+90 533 654 3210', 'Bilim Caddesi No:8, Üsküdar/İstanbul', '2023-08-20', TRUE, 'member'),
('user-012-345-678', 'Ali Çelik', 'ali@outlook.com', '+90 542 147 8520', 'Kültür Mahallesi No:17, Bakırköy/İstanbul', '2023-09-10', TRUE, 'member'),
('user-345-678-901', 'Fatma Özkan', 'fatma@yahoo.com', '+90 505 789 1234', 'Eğitim Sokak No:33, Şişli/İstanbul', '2023-10-05', FALSE, 'member');

-- Insert sample borrowing records
INSERT INTO borrowings (member_id, book_id, borrowed_date, due_date, returned_date, is_returned, fine_amount) VALUES
('user-456-789-123', 1, '2024-01-15', '2024-01-29', NULL, FALSE, 0.00),
('user-456-789-123', 3, '2024-01-10', '2024-01-24', NULL, FALSE, 0.00),
('user-789-012-345', 5, '2023-12-20', '2024-01-03', '2024-01-02', TRUE, 0.00),
('user-345-678-901', 6, '2023-12-01', '2023-12-15', NULL, FALSE, 15.50),
('user-012-345-678', 7, '2024-01-05', '2024-01-19', NULL, FALSE, 0.00);

-- Update available copies based on borrowings
UPDATE books SET available_copies = available_copies - 1 WHERE id IN (1, 3, 6, 7);
