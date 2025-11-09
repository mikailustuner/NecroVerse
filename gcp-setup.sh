#!/bin/bash
# GCP Compute Engine'de NecroVerse dev server kurulum script'i

# 1. Node.js ve pnpm kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. pnpm kurulumu
npm install -g pnpm@8.12.0

# 3. Projeyi klonla (veya mevcut dizine git)
cd ~
git clone <YOUR_REPO_URL> necroverse
cd necroverse

# 4. Dependencies yükle
pnpm install

# 5. PM2 kurulumu (process manager - sürekli çalışması için)
npm install -g pm2

# 6. Dev server'ı PM2 ile başlat
pm2 start "pnpm run dev" --name necroverse-dev

# 7. PM2'yi sistem başlangıcında çalışacak şekilde ayarla
pm2 startup
pm2 save

# 8. Firewall kurallarını kontrol et (GCP Console'dan)
# - HTTP: 3001 (necrodev)
# - HTTP: 3002 (necroplay)
# - HTTP: 3003 (amiron)

echo "✅ NecroVerse dev server başlatıldı!"
echo "📊 Durum kontrolü: pm2 status"
echo "📝 Loglar: pm2 logs necroverse-dev"
echo "🔄 Yeniden başlat: pm2 restart necroverse-dev"
echo "⏹️  Durdur: pm2 stop necroverse-dev"

