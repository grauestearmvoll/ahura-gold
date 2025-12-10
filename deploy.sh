#!/bin/bash

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Ahura Gold ERP Deployment Script ===${NC}"

# 1. Proje dizinine git
cd /var/www/ahura-erp
echo -e "${GREEN}✓ Proje dizinine geçildi${NC}"

# 2. .env dosyası oluştur
cat > .env << 'EOF'
DATABASE_URL="file:./prisma/prod.db"
NEXTAUTH_URL="http://172.104.225.246"
NEXTAUTH_SECRET="P+Q+aaByTaJ6CGDXIkAXtedr5kfVdOy1ndfGoY4l028="
EMAIL_SERVER_HOST="mail.ahuraltd.com"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="simurg@ahuraltd.com"
EMAIL_SERVER_PASSWORD="BURAYA_EMAIL_SIFRENIZI_YAZIN"
EMAIL_FROM="simurg@ahuraltd.com"
AUTHORIZED_EMAIL="simurg@ahuraltd.com"
EOF
echo -e "${GREEN}✓ .env dosyası oluşturuldu${NC}"

# 3. Node modüllerini kur
echo -e "${BLUE}Node modülleri kuruluyor...${NC}"
npm ci --omit=dev
echo -e "${GREEN}✓ Node modülleri kuruldu${NC}"

# 4. Prisma setup
echo -e "${BLUE}Database hazırlanıyor...${NC}"
npx prisma generate
npx prisma db push
echo -e "${GREEN}✓ Database hazır${NC}"

# 5. Next.js build
echo -e "${BLUE}Production build yapılıyor...${NC}"
npm run build
echo -e "${GREEN}✓ Build tamamlandı${NC}"

# 6. PM2 ile başlat
echo -e "${BLUE}Uygulama başlatılıyor...${NC}"
pm2 delete ahura-erp 2>/dev/null || true
pm2 start npm --name "ahura-erp" -- start
pm2 save
pm2 startup
echo -e "${GREEN}✓ Uygulama başlatıldı${NC}"

echo -e "${BLUE}=== Deployment tamamlandı! ===${NC}"
echo -e "Uygulama çalışıyor: http://172.104.225.246:3000"
echo -e ""
echo -e "${BLUE}ÖNEMLİ:${NC} .env dosyasını düzenleyin:"
echo -e "nano /var/www/ahura-erp/.env"
echo -e "EMAIL_SERVER_PASSWORD kısmına email şifrenizi yazın"
