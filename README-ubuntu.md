# 🐧 Ubuntu 22.04 Kütüphane Yönetim Sistemi

Bu rehber Ubuntu 22.04 LTS üzerinde production-ready kütüphane yönetim sistemi kurulumunu anlatır.

## 🚀 Hızlı Kurulum

### Tek Komut Kurulum:
\`\`\`bash
sudo bash scripts/ubuntu-install.sh
\`\`\`

## 📋 Manuel Kurulum

### 1. Sistem Hazırlığı
\`\`\`bash
# Sistem güncelleme
sudo apt update && sudo apt upgrade -y

# Gerekli paketler
sudo apt install -y curl wget gnupg2 software-properties-common
\`\`\`

### 2. Node.js 18.x Kurulumu
\`\`\`bash
# NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js kurulumu
sudo apt-get install -y nodejs

# Sürüm kontrolü
node --version  # v18.x.x
npm --version   # 9.x.x
\`\`\`

### 3. MySQL Server Kurulumu
\`\`\`bash
# MySQL kurulumu
sudo apt install -y mysql-server

# Güvenlik ayarları
sudo mysql_secure_installation

# Veritabanı kurulumu
mysql -u root -p < scripts/ubuntu-mysql-setup.sql
\`\`\`

### 4. Web Server Kurulumu
\`\`\`bash
# Nginx kurulumu
sudo apt install -y nginx

# PM2 (Process Manager)
sudo npm install -g pm2

# Git
sudo apt install -y git
\`\`\`

### 5. Firewall Ayarları
\`\`\`bash
# UFW kurulumu
sudo apt install -y ufw

# Firewall kuralları
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000

# Durum kontrolü
sudo ufw status
\`\`\`

## 🔧 Proje Deployment

### 1. Proje Klonlama
\`\`\`bash
# Proje dizini
sudo mkdir -p /var/www/library-system
sudo chown -R $USER:$USER /var/www/library-system

# Git clone
git clone https://github.com/yourusername/library-system.git /var/www/library-system
cd /var/www/library-system
\`\`\`

### 2. Dependencies
\`\`\`bash
# NPM packages
npm install

# Build
npm run build
\`\`\`

### 3. Environment Variables
\`\`\`bash
# .env.local oluştur
cp .env.example .env.local

# Düzenle
nano .env.local
\`\`\`

\`\`\`env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=library_user
MYSQL_PASSWORD=LibraryPass2024!
MYSQL_DATABASE=library_system

NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=production
\`\`\`

### 4. PM2 ile Başlatma
\`\`\`bash
# Uygulama başlatma
pm2 start npm --name "library-system" -- start

# Otomatik başlatma
pm2 startup
pm2 save

# Durum kontrolü
pm2 status
pm2 logs library-system
\`\`\`

### 5. Nginx Konfigürasyonu
\`\`\`bash
# Site konfigürasyonu
sudo cp configs/nginx.conf /etc/nginx/sites-available/library-system

# Site aktifleştirme
sudo ln -s /etc/nginx/sites-available/library-system /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test ve restart
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

### 6. Systemd Service (Opsiyonel)
\`\`\`bash
# Service dosyası
sudo cp configs/library-system.service /etc/systemd/system/

# Service aktifleştirme
sudo systemctl daemon-reload
sudo systemctl enable library-system
sudo systemctl start library-system

# Durum kontrolü
sudo systemctl status library-system
\`\`\`

## 🔒 SSL Sertifikası (Let's Encrypt)

\`\`\`bash
# SSL kurulumu
sudo bash scripts/ssl-setup.sh your-domain.com

# Otomatik yenileme kontrolü
sudo certbot renew --dry-run
\`\`\`

## 📊 Monitoring ve Yönetim

### PM2 Komutları
\`\`\`bash
pm2 status                    # Durum
pm2 restart library-system    # Yeniden başlat
pm2 stop library-system       # Durdur
pm2 logs library-system       # Loglar
pm2 monit                     # Monitoring
pm2 delete library-system     # Sil
\`\`\`

### Sistem Monitoring
\`\`\`bash
# Sistem kaynakları
htop
df -h
free -h

# Servis durumları
sudo systemctl status nginx
sudo systemctl status mysql
sudo systemctl status library-system

# Log analizi
sudo journalctl -u nginx -f
sudo journalctl -u library-system -f
pm2 logs library-system --err
\`\`\`

### MySQL Yönetimi
\`\`\`bash
# Bağlantı testi
mysql -u library_user -p library_system

# Durum kontrolü
mysqladmin -u library_user -p status

# Backup
mysqldump -u library_user -p library_system > backup.sql

# Restore
mysql -u library_user -p library_system < backup.sql
\`\`\`

## 🔄 Otomatik Backup

### Backup Script Kurulumu
\`\`\`bash
# Executable yap
chmod +x scripts/backup.sh

# Crontab ekle (her gece 02:00)
echo "0 2 * * * /var/www/library-system/scripts/backup.sh" | sudo crontab -

# Manuel backup
sudo bash scripts/backup.sh
\`\`\`

### Backup Lokasyonu
\`\`\`
/var/backups/library-system/
├── mysql-20240101-020000.sql.gz
├── files-20240101-020000.tar.gz
└── ...
\`\`\`

## 🚨 Sorun Giderme

### Yaygın Sorunlar

#### Port 3000 kullanımda
\`\`\`bash
sudo lsof -i :3000
sudo kill -9 <PID>
pm2 restart library-system
\`\`\`

#### MySQL bağlantı hatası
\`\`\`bash
# Servis kontrolü
sudo systemctl status mysql
sudo systemctl restart mysql

# Bağlantı testi
mysql -u library_user -p -e "SELECT 1"

# Log kontrolü
sudo tail -f /var/log/mysql/error.log
\`\`\`

#### Nginx 502 Bad Gateway
\`\`\`bash
# Nginx test
sudo nginx -t

# Servis durumu
sudo systemctl status nginx
pm2 status

# Log kontrolü
sudo tail -f /var/log/nginx/error.log
pm2 logs library-system --err
\`\`\`

#### Disk alanı doldu
\`\`\`bash
# Disk kullanımı
df -h

# Temizlik
sudo apt autoremove
sudo apt autoclean
pm2 flush
sudo journalctl --vacuum-time=7d
\`\`\`

### Log Dosyaları
\`\`\`
/var/log/nginx/access.log      # Nginx access
/var/log/nginx/error.log       # Nginx error
/var/log/mysql/error.log       # MySQL error
/var/log/library-backup.log    # Backup log
journalctl -u library-system   # Systemd log
pm2 logs library-system        # PM2 log
\`\`\`

## 📈 Performans Optimizasyonu

### MySQL Tuning
\`\`\`bash
# MySQL konfigürasyonu
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Önerilen ayarlar:
innodb_buffer_pool_size = 256M
max_connections = 100
query_cache_size = 32M
\`\`\`

### Nginx Tuning
\`\`\`bash
# Nginx konfigürasyonu
sudo nano /etc/nginx/nginx.conf

# Worker processes
worker_processes auto;
worker_connections 1024;

# Gzip compression
gzip on;
gzip_types text/plain application/json;
\`\`\`

### Node.js Memory
\`\`\`bash
# Memory limit artırma
export NODE_OPTIONS="--max-old-space-size=2048"

# PM2 ile
pm2 start npm --name "library-system" --node-args="--max-old-space-size=2048" -- start
\`\`\`

## 🔐 Güvenlik

### Firewall Kuralları
\`\`\`bash
# Sadece gerekli portlar
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw deny 3000   # Direct Node.js access
\`\`\`

### MySQL Güvenlik
\`\`\`bash
# Root şifre değiştirme
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';"

# Gereksiz kullanıcıları silme
sudo mysql -e "DROP USER IF EXISTS ''@'localhost';"
sudo mysql -e "DROP DATABASE IF EXISTS test;"
\`\`\`

### SSL/TLS
\`\`\`bash
# SSL sertifikası kontrolü
sudo certbot certificates

# SSL test
curl -I https://your-domain.com
\`\`\`

## 📞 Destek ve Maintenance

### Günlük Kontroller
\`\`\`bash
# Sistem durumu
sudo systemctl status nginx mysql library-system

# Disk alanı
df -h

# Memory kullanımı
free -h

# Uygulama durumu
pm2 status
curl -f http://localhost:3000/health
\`\`\`

### Haftalık Maintenance
\`\`\`bash
# Sistem güncelleme
sudo apt update && sudo apt upgrade

# Log temizleme
sudo journalctl --vacuum-time=30d
pm2 flush

# Backup kontrolü
ls -la /var/backups/library-system/
\`\`\`

### Aylık Maintenance
\`\`\`bash
# MySQL optimize
mysqlcheck -u library_user -p --optimize library_system

# Disk temizleme
sudo apt autoremove
sudo apt autoclean

# SSL sertifika kontrolü
sudo certbot certificates
\`\`\`

## 🎯 Test Hesapları

### Yönetici Hesapları
\`\`\`
Email: admin@kutuphane.com
Şifre: admin123

Email: yonetici@kutuphane.com
Şifre: yonetici2024
\`\`\`

### Üye Hesapları
\`\`\`
Email: mehmet@gmail.com
Şifre: mehmet456

Email: ayse@hotmail.com
Şifre: ayse789
\`\`\`

## 🌐 Erişim URL'leri

- **Development:** http://localhost:3000
- **Production:** http://your-server-ip
- **SSL:** https://your-domain.com
- **Health Check:** http://localhost:3000/health

## 📚 Ek Kaynaklar

- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Let's Encrypt](https://letsencrypt.org/docs/)

Bu rehber Ubuntu 22.04'te production-ready bir kütüphane yönetim sistemi kurmanız için gereken tüm adımları içerir. Herhangi bir sorun yaşarsanız log dosyalarını kontrol edin ve gerekirse sistem yöneticisi desteği alın.
