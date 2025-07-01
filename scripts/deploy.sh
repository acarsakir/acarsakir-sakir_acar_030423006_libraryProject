#!/bin/bash

# Ubuntu Deployment Script
# Kullanım: bash deploy.sh

set -e

PROJECT_DIR="/var/www/library-system"
BACKUP_DIR="/var/backups/library-system"

echo "🚀 Ubuntu Deployment Başlıyor..."

# Backup oluşturma
echo "📦 Backup oluşturuluyor..."
mkdir -p $BACKUP_DIR
mysqldump -u library_user -p library_system > $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql

# Git pull (eğer git repo ise)
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "📥 Git güncellemesi..."
    cd $PROJECT_DIR
    git pull origin main
fi

# Dependencies güncelleme
echo "📦 Dependencies güncelleniyor..."
cd $PROJECT_DIR
npm install

# Build
echo "🔨 Build işlemi..."
npm run build

# PM2 restart
echo "🔄 Uygulama yeniden başlatılıyor..."
pm2 restart library-system || pm2 start npm --name "library-system" -- start

# Nginx reload
echo "🌐 Nginx yenileniyor..."
sudo nginx -t && sudo systemctl reload nginx

# Health check
echo "🏥 Health check..."
sleep 5
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Deployment başarılı!"
else
    echo "❌ Health check başarısız!"
    exit 1
fi

echo "🎉 Deployment tamamlandı!"
