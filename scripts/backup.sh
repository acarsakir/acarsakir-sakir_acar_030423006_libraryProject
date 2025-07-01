#!/bin/bash

# Otomatik Backup Script
# Crontab: 0 2 * * * /var/www/library-system/scripts/backup.sh

BACKUP_DIR="/var/backups/library-system"
PROJECT_DIR="/var/www/library-system"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=30

echo "📦 Backup başlıyor: $DATE"

# Backup dizini oluştur
mkdir -p $BACKUP_DIR

# MySQL backup
echo "🗄️ MySQL backup..."
mysqldump -u library_user -p'LibraryPass2024!' library_system > $BACKUP_DIR/mysql-$DATE.sql
gzip $BACKUP_DIR/mysql-$DATE.sql

# Dosya backup
echo "📁 Dosya backup..."
tar -czf $BACKUP_DIR/files-$DATE.tar.gz -C $PROJECT_DIR \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    .

# Eski backup'ları temizle
echo "🧹 Eski backup'lar temizleniyor..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Backup boyutu
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo "✅ Backup tamamlandı. Toplam boyut: $BACKUP_SIZE"

# Log
echo "$(date): Backup completed - $DATE" >> /var/log/library-backup.log
