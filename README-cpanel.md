# Kütüphane Yönetim Sistemi - cPanel MySQL Entegrasyonu

Bu proje cPanel shared hosting ortamında MySQL veritabanı ile çalışacak şekilde optimize edilmiştir.

## 🏗️ cPanel Kurulum Rehberi

### 1. cPanel'de Veritabanı Oluşturma

#### MySQL Databases Bölümü:
1. cPanel → **MySQL Databases** bölümüne gidin
2. **Create New Database** alanında:
   - Database Name: `library_system`
   - **Create Database** butonuna tıklayın

#### Kullanıcı Oluşturma:
1. **MySQL Users** bölümünde:
   - Username: `library_user` (veya istediğiniz isim)
   - Password: Güçlü bir şifre oluşturun
   - **Create User** butonuna tıklayın

#### Kullanıcıyı Veritabanına Atama:
1. **Add User to Database** bölümünde:
   - User: Az önce oluşturduğunuz kullanıcıyı seçin
   - Database: `library_system` veritabanını seçin
   - **Add** butonuna tıklayın
   - **ALL PRIVILEGES** seçeneğini işaretleyin
   - **Make Changes** butonuna tıklayın

### 2. SQL Scriptlerini Çalıştırma

#### phpMyAdmin Kullanarak:
1. cPanel → **phpMyAdmin** bölümüne gidin
2. Sol menüden `library_system` veritabanını seçin
3. **SQL** sekmesine tıklayın
4. Aşağıdaki scriptleri sırasıyla çalıştırın:

\`\`\`sql
-- 1. Önce tabloları oluşturun
-- scripts/01-cpanel-create-tables.sql içeriğini kopyalayıp çalıştırın

-- 2. Sonra verileri ekleyin  
-- scripts/03-cpanel-seed-data.sql içeriğini kopyalayıp çalıştırın
\`\`\`

### 3. Environment Variables Ayarlama

`.env.local` dosyası oluşturun:

\`\`\`env
# cPanel MySQL Ayarları
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=cpanel_username_library_user
MYSQL_PASSWORD=your_database_password
MYSQL_DATABASE=cpanel_username_library_system

# Uygulama Ayarları
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
\`\`\`

**Not:** cPanel'de kullanıcı adı genellikle `cpanel_username_database_name` formatındadır.

## 🔧 cPanel Özel Optimizasyonlar

### Bağlantı Havuzu Ayarları:
- **Connection Limit:** 5 (shared hosting için optimize)
- **Idle Timeout:** 5 dakika
- **SSL:** Devre dışı (çoğu cPanel'de)
- **Multiple Statements:** Güvenlik için devre dışı

### Hata Yönetimi:
- Gelişmiş error handling
- cPanel specific error codes
- Connection retry logic
- Graceful degradation

### Performans Optimizasyonları:
- Düşük connection limit için optimize
- Efficient query patterns
- Index optimization
- Memory usage optimization

## 🚨 cPanel Kısıtlamaları

### Veritabanı Kısıtlamaları:
- ❌ `DROP DATABASE` komutu çalışmaz
- ❌ `CREATE DATABASE` yetkisi yoktur
- ❌ Root access yoktur
- ✅ `INSERT IGNORE` kullanılır
- ✅ `IF NOT EXISTS` kontrolleri

### Bağlantı Kısıtlamaları:
- Düşük connection limit (5-10)
- Timeout kısıtlamaları
- SSL genellikle kapalı
- Remote access kısıtlı

## 🧪 Test Hesapları

### Yönetici Hesapları:
\`\`\`
Email: admin@kutuphane.com
Şifre: admin123

Email: yonetici@kutuphane.com  
Şifre: yonetici2024
\`\`\`

### Üye Hesapları:
\`\`\`
Email: mehmet@gmail.com
Şifre: mehmet456

Email: ayse@hotmail.com
Şifre: ayse789
\`\`\`

## 🔍 Sorun Giderme

### Bağlantı Hataları:

#### "Connection refused" Hatası:
- Host adresini kontrol edin (genellikle `localhost`)
- Port numarasını kontrol edin (genellikle `3306`)
- MySQL servisinin çalıştığından emin olun

#### "Access denied" Hatası:
- Kullanıcı adı formatını kontrol edin
- Şifrenin doğru olduğundan emin olun
- Kullanıcının veritabanına erişim yetkisi olduğunu kontrol edin

#### "Database does not exist" Hatası:
- Veritabanı adının doğru olduğundan emin olun
- cPanel'de veritabanının oluşturulduğunu kontrol edin

### Performans Sorunları:

#### Yavaş Sorgular:
- Index'lerin oluşturulduğundan emin olun
- Query optimization yapın
- Connection pooling kullanın

#### Timeout Hataları:
- Connection timeout değerlerini artırın
- Query complexity'yi azaltın
- Batch operations kullanın

## 📊 Monitoring ve Bakım

### Veritabanı Boyutu:
- cPanel'de disk kullanımını kontrol edin
- Log dosyalarını düzenli temizleyin
- Gereksiz verileri silin

### Performans İzleme:
- Slow query log'ları kontrol edin
- Connection usage'ı izleyin
- Error log'ları takip edin

## 🚀 Deployment

### Production Checklist:
- [ ] Environment variables ayarlandı
- [ ] SSL sertifikası kuruldu (varsa)
- [ ] Backup stratejisi oluşturuldu
- [ ] Error monitoring kuruldu
- [ ] Performance monitoring aktif

### Backup Stratejisi:
1. cPanel'de otomatik backup aktif edin
2. Düzenli database export'ları alın
3. Critical data için off-site backup kullanın

Bu rehber cPanel shared hosting ortamında sorunsuz çalışacak şekilde optimize edilmiştir. Herhangi bir sorun yaşarsanız hosting sağlayıcınızın teknik desteği ile iletişime geçin.
