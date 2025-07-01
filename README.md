# Kütüphane Yönetim Sistemi

Modern bir kütüphane yönetim sistemi. Supabase ve Next.js ile geliştirilmiştir.

## Özellikler

- 📚 Kitap kataloğu yönetimi
- 👥 Üye yönetimi
- 📅 Ödünç verme işlemleri
- 💰 Ceza hesaplama sistemi
- 🔐 Güvenli kimlik doğrulama
- 📱 Responsive tasarım

## 🚀 Kurulum

### 1. Gereksinimler
- Node.js 18+
- Supabase hesapı
- npm veya yarn

### 2. Projeyi klonlayın:
\`\`\`bash
git clone <repository-url>
cd library-system
\`\`\`

### 3. Supabase Projesi Oluşturun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'da aşağıdaki scriptleri çalıştırın:

\`\`\`sql
-- scripts/01-create-tables.sql dosyasındaki kodu çalıştırın
-- scripts/02-seed-data.sql dosyasındaki kodu çalıştırın
\`\`\`

### 4. Environment Variables

`.env.local` dosyası oluşturun:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 5. Bağımlılıkları yükleyin:
\`\`\`bash
npm install
# veya
yarn install
\`\`\`

### 6. Uygulamayı başlatın:
\`\`\`bash
npm run dev
# veya
yarn dev
\`\`\`

## 📊 Veritabanı Şeması

### Tablolar:
- `books` - Kitap bilgileri
- `members` - Üye bilgileri
- `borrowings` - Ödünç verme kayıtları

### İlişkiler:
- Üyeler birden fazla kitap ödünç alabilir
- Kitaplar birden fazla üye tarafından ödünç alınabilir
- Ödünç verme kayıtları üye ve kitap ilişkisini tutar

## 🔐 Test Hesapları

### Yöneticiler:
- `admin@kutuphane.com` / `admin123`

### Üyeler:
- `mehmet@gmail.com` / `mehmet456`

## 🛠️ Geliştirme

### API Katmanları:
- `lib/supabase.ts` - Veritabanı bağlantısı
- `lib/auth-supabase.ts` - Kimlik doğrulama
- `lib/books-supabase.ts` - Kitap yönetimi
- `lib/borrowings-supabase.ts` - Ödünç verme

### Güvenlik:
- Supabase Auth ile güvenli giriş
- SQL injection koruması
- Prepared statements
- Transaction rollback

## 📈 Performans

- Connection pooling
- Optimized queries
- Database indexing
- Efficient joins

## 🔧 Üretim Dağıtımı

1. Supabase sunucusu kurulumu
2. SSL sertifikaları
3. Environment variables
4. Database migrations
5. Backup stratejisi

## Kullanım

1. Giriş yapın veya yeni hesap oluşturun
2. Dashboard'dan kitapları görüntüleyin
3. Ödünç alma işlemlerini yönetin
4. Admin olarak üyeleri ve kitapları yönetin

## Teknolojiler

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS, shadcn/ui
- **Authentication**: Supabase Auth

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

MIT License
# sakir_acar_030423006_libraryproject
