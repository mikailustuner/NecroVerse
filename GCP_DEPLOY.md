# GCP'de NecroVerse Dev Server Kurulumu

## Seçenek 1: Compute Engine VM (Önerilen)

### 1. VM Oluştur
```bash
# GCP Console'dan:
# - Compute Engine > VM instances > Create
# - Machine type: e2-medium veya daha yüksek (2+ CPU, 4GB+ RAM)
# - Boot disk: Ubuntu 22.04 LTS
# - Firewall: HTTP ve HTTPS trafiğine izin ver
```

### 2. VM'e Bağlan
```bash
gcloud compute ssh <VM_NAME> --zone=<ZONE>
```

### 3. Kurulum Script'ini Çalıştır
```bash
# Script'i VM'e kopyala
gcloud compute scp gcp-setup.sh <VM_NAME>:~ --zone=<ZONE>

# VM'de çalıştır
chmod +x gcp-setup.sh
./gcp-setup.sh
```

### 4. Firewall Kuralları
GCP Console > VPC Network > Firewall Rules:
- **HTTP (3001)**: `tcp:3001` → `0.0.0.0/0`
- **HTTP (3002)**: `tcp:3002` → `0.0.0.0/0`
- **HTTP (3003)**: `tcp:3003` → `0.0.0.0/0`

### 5. Erişim
- NecroDev: `http://<VM_EXTERNAL_IP>:3001`
- NecroPlay: `http://<VM_EXTERNAL_IP>:3002`
- Amiron: `http://<VM_EXTERNAL_IP>:3003`

## Seçenek 2: Cloud Run (Containerized)

### 1. Dockerfile Oluştur
```dockerfile
FROM node:18
WORKDIR /app
RUN npm install -g pnpm@8.12.0
COPY . .
RUN pnpm install
EXPOSE 3001 3002 3003
CMD ["pnpm", "run", "dev"]
```

### 2. Deploy Et
```bash
gcloud run deploy necroverse-dev \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3001
```

**Not**: Cloud Run dev server için ideal değil çünkü:
- Request-based çalışır (sürekli açık değil)
- Timeout limitleri var
- Dev server sürekli çalışması gerekiyor

## Seçenek 3: App Engine (Önerilmez)

App Engine dev server için uygun değil çünkü:
- Request-based çalışır
- Dev server sürekli çalışması gerekiyor

## PM2 Komutları

```bash
# Durum kontrolü
pm2 status

# Loglar
pm2 logs necroverse-dev

# Yeniden başlat
pm2 restart necroverse-dev

# Durdur
pm2 stop necroverse-dev

# Başlat
pm2 start necroverse-dev

# Sil
pm2 delete necroverse-dev
```

## Otomatik Yeniden Başlatma

PM2 ile sistem başlangıcında otomatik başlatma:
```bash
pm2 startup
pm2 save
```

## Maliyet Tahmini

- **e2-medium VM**: ~$30-40/ay
- **e2-standard-2**: ~$60-70/ay
- **Cloud Run**: Kullanıma göre (dev server için uygun değil)

## Öneriler

1. **VM Kullan**: Dev server için en uygun
2. **PM2 Kullan**: Process management için
3. **Firewall Ayarla**: Portları aç
4. **Domain Bağla** (opsiyonel): DNS ayarları yap
5. **SSL Sertifikası** (opsiyonel): Let's Encrypt kullan

