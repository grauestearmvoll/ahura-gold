# Ahura Gold ERP - cPanel Deployment Guide

## Gerekli Dosyalar

### 1. .env (Production)
```env
# Database
DATABASE_URL="file:./prod.db"

# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=P+Q+aaByTaJ6CGDXIkAXtedr5kfVdOy1ndfGoY4l028=

# Email Configuration (cPanel SMTP)
EMAIL_SERVER_HOST=mail.ahuraltd.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=simurg@ahuraltd.com
EMAIL_SERVER_PASSWORD=YOUR_EMAIL_PASSWORD_HERE
EMAIL_FROM=simurg@ahuraltd.com

# Authorized Email
AUTHORIZED_EMAIL=simurg@ahuraltd.com
```

## Deployment Adımları

### 1. Build Al
```bash
npm run build
```

### 2. Gerekli Dosyaları Hazırla
- `.next` klasörü
- `public` klasörü
- `node_modules` klasörü
- `prisma` klasörü
- `package.json`
- `.env` (production ayarlarıyla)
- `next.config.js`

### 3. cPanel'de Kurulum

#### a. Node.js Uygulaması Oluştur
1. cPanel → Setup Node.js App
2. Node.js Version: 18.x veya üzeri
3. Application Mode: Production
4. Application Root: `/home/username/ahura-erp`
5. Application URL: domain.com veya subdomain.ahuraltd.com

#### b. Dosyaları Yükle
File Manager veya FTP ile tüm dosyaları yükle

#### c. Veritabanını Hazırla
```bash
cd /home/username/ahura-erp
npx prisma generate
npx prisma db push
```

#### d. Node.js App'i Başlat
cPanel Node.js App panelinden "Start" butonuna tıkla

### 4. Email Ayarları

cPanel → Email Accounts'tan şifrenizi alın ve `.env` dosyasına ekleyin:
```
EMAIL_SERVER_PASSWORD=your-actual-password
```

### 5. SSL Sertifikası
cPanel → SSL/TLS → AutoSSL ile ücretsiz SSL aktifleştirin

## Alternatif: Vercel Deployment

```bash
# Vercel CLI yükle
npm i -g vercel

# Deploy et
vercel --prod
```

Vercel environment variables'a .env içeriğini ekleyin.

## Troubleshooting

### Email Gönderilmiyor
- cPanel email şifresini kontrol edin
- Port 465 yerine 587 deneyin
- SSL/TLS ayarlarını kontrol edin

### Database Hatası
```bash
npx prisma db push --force-reset
```

### Port Problemi
cPanel Node.js app otomatik port atar, next.config.js'de port belirtmeyin

## Önemli Notlar

- SQLite production'da sorun çıkarabilir, büyük sistemler için PostgreSQL önerilir
- Regular backup alın: `cp prod.db prod.db.backup`
- Log dosyalarını düzenli kontrol edin
