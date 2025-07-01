#!/bin/bash

# Ubuntu 22.04 Kütüphane Yönetim Sistemi Kurulum Scripti
# Kullanım: sudo bash ubuntu-install.sh

set -e

echo "🐧 Ubuntu 22.04 Kütüphane Sistemi Kurulumu Başlıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hata yakalama
error_exit() {
    echo -e "${RED}❌ Hata: $1${NC}" >&2
    exit 1
}

success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

info_msg() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Root kontrolü
if [[ $EUID -ne 0 ]]; then
   error_exit "Bu script root olarak çalıştırılmalı (sudo kullanın)"
fi

# Ubuntu sürüm kontrolü
if ! grep -q "22.04" /etc/os-release; then
    warning_msg "Bu script Ubuntu 22.04 için optimize edilmiştir"
fi

info_msg "Sistem güncelleniyor..."
apt update && apt upgrade -y

# Node.js 18.x kurulumu
info_msg "Node.js 18.x kuruluyor..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Node.js sürüm kontrolü
NODE_VERSION=$(node --version)
success_msg "Node.js kuruldu: $NODE_VERSION"

# MySQL Server kurulumu
info_msg "MySQL Server kuruluyor..."
apt install -y mysql-server

# MySQL güvenlik ayarları
info_msg "MySQL güvenlik ayarları yapılandırılıyor..."
mysql_secure_installation

# Git kurulumu
info_msg "Git kuruluyor..."
apt install -y git

# Nginx kurulumu
info_msg "Nginx kuruluyor..."
apt install -y nginx

# PM2 kurulumu (global)
info_msg "PM2 kuruluyor..."
npm install -g pm2

# UFW Firewall kurulumu
info_msg "UFW Firewall yapılandırılıyor..."
apt install -y ufw
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3000

# Proje dizini oluşturma
PROJECT_DIR="/var/www/library-system"
info_msg "Proje dizini oluşturuluyor: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
chown -R www-data:www-data /var/www

# MySQL kullanıcı ve veritabanı oluşturma
info_msg "MySQL veritabanı yapılandırılıyor..."
read -p "MySQL root şifresi: " -s MYSQL_ROOT_PASSWORD
echo

mysql -u root -p$MYSQL_ROOT_PASSWORD <<EOF
CREATE DATABASE IF NOT EXISTS library_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'library_user'@'localhost' IDENTIFIED BY 'LibraryPass2024!';
GRANT ALL PRIVILEGES ON library_system.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
EOF

success_msg "MySQL veritabanı oluşturuldu"

# Environment dosyası oluşturma
info_msg "Environment dosyası oluşturuluyor..."
cat > $PROJECT_DIR/.env.local <<EOF
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=library_user
MYSQL_PASSWORD=LibraryPass2024!
MYSQL_DATABASE=library_system

# Application Configuration
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=production
EOF

success_msg "Environment dosyası oluşturuldu"

# Nginx konfigürasyonu
info_msg "Nginx yapılandırılıyor..."
cat > /etc/nginx/sites-available/library-system <<EOF
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Nginx site'ı aktifleştirme
ln -sf /etc/nginx/sites-available/library-system /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

success_msg "Nginx yapılandırıldı"

# Systemd service oluşturma
info_msg "Systemd service oluşturuluyor..."
cat > /etc/systemd/system/library-system.service <<EOF
[Unit]
Description=Library Management System
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable library-system

success_msg "Systemd service oluşturuldu"

# Kurulum tamamlandı
echo
echo "🎉 Ubuntu 22.04 Kütüphane Sistemi Kurulumu Tamamlandı!"
echo
echo "📋 Sonraki Adımlar:"
echo "1. Proje dosyalarını $PROJECT_DIR dizinine kopyalayın"
echo "2. cd $PROJECT_DIR && npm install"
echo "3. npm run build"
echo "4. MySQL tablolarını oluşturun (scripts/ubuntu-mysql-setup.sql)"
echo "5. systemctl start library-system"
echo
echo "🌐 Erişim: http://localhost"
echo "📊 Monitoring: pm2 monit"
echo "📝 Loglar: journalctl -u library-system -f"
echo
echo "🔐 MySQL Bilgileri:"
echo "   Database: library_system"
echo "   User: library_user"
echo "   Password: LibraryPass2024!"
