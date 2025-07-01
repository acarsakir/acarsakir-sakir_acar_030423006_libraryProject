#!/bin/bash

# Let's Encrypt SSL Kurulum Scripti
# Kullanım: sudo bash ssl-setup.sh your-domain.com

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Domain adı gerekli!"
    echo "Kullanım: sudo bash ssl-setup.sh your-domain.com"
    exit 1
fi

echo "🔒 Let's Encrypt SSL kurulumu başlıyor: $DOMAIN"

# Certbot kurulumu
apt update
apt install -y certbot python3-certbot-nginx

# SSL sertifikası alma
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Otomatik yenileme
systemctl enable certbot.timer
systemctl start certbot.timer

# Test yenileme
certbot renew --dry-run

echo "✅ SSL kurulumu tamamlandı!"
echo "🌐 Site: https://$DOMAIN"
echo "🔄 Otomatik yenileme aktif"
