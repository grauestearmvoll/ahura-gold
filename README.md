# Ahura Gold ERP

Ahura Gold ERP, altın alım-satım ve yönetim işlemlerini kolaylaştıran kapsamlı bir web tabanlı sistemdir.

## 🚀 Özellikler

### 1. Ürün Yönetimi
- **Ürün Tanımlama**: Yeni ürün kartları oluşturma (ürün kodu, ad, ayar, adet/gram bazlı)
- **Alış İşlemleri**: Ürün satın alma kayıtları
- **Satış İşlemleri**: Ürün satış kayıtları
- **Emanet İşlemleri**: Ürün, TL, Dolar, Euro emanet verme/alma kayıtları
- **Stok Takibi**: Anlık stok durumu ve geçmiş hareketler

### 2. Müşteri Yönetimi
- Müşteri kayıt sistemi (ad, TC kimlik, telefon)
- Cari hesap bakiyeleri (has altın gramı bazında)
- Müşteri arama ve filtreleme
- İşaretli müşteriler (dashboard'da görüntüleme için)

### 3. Ödeme Yönetimi
- Bekleyen ödemeler takibi
- Kısmi ödeme desteği
- Ödeme yöntemleri (Nakit, Banka, Kredi Kartı)
- Tamamlanan ödemeler geçmişi
- EFT/Havale detay kayıtları

### 4. Dashboard
- Günlük alış/satış istatistikleri
- Kar-zarar özeti
- Emanet uyarıları (1, 5, 10 gün içinde teslim edilecekler)
- İşaretli müşteri listesi

### 5. Raporlar
- Satış raporu
- Stok raporu
- Mali rapor (gelir-gider, kar-zarar)
- Müşteri raporu

## 🛠️ Teknolojiler

- **Framework**: Next.js 15 (App Router)
- **Dil**: TypeScript
- **Styling**: Tailwind CSS
- **UI Bileşenleri**: shadcn/ui
- **Veritabanı**: SQLite (Prisma ORM)
- **Form Yönetimi**: React Hook Form
- **Tarih İşlemleri**: date-fns

## 📦 Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Veritabanını oluşturun:
```bash
npx prisma generate
npx prisma db push
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📁 Proje Yapısı

```
ahurayenierp/
├── prisma/
│   └── schema.prisma          # Veritabanı şeması
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Dashboard layout ve sayfalar
│   │   │   ├── customers/     # Müşteri yönetimi
│   │   │   ├── dashboard/     # Ana dashboard
│   │   │   ├── payments/      # Ödeme yönetimi
│   │   │   ├── products/      # Ürün yönetimi
│   │   │   └── reports/       # Raporlar
│   │   ├── api/               # API route'ları
│   │   └── layout.tsx         # Ana layout
│   ├── components/
│   │   ├── layout/            # Layout bileşenleri
│   │   └── ui/                # shadcn/ui bileşenleri
│   └── lib/
│       ├── prisma.ts          # Prisma client
│       └── utils.ts           # Yardımcı fonksiyonlar
└── package.json
```

## 🔧 Komutlar

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucu
npm start

# Linting
npm run lint

# Prisma Studio (veritabanı yönetimi)
npx prisma studio
```

## 💡 Kullanım

### Yeni Ürün Tanımlama
1. "Ürün Yönetimi" > "Yeni Ürün Tanımla"
2. Ürün bilgilerini girin (ad, ayar, adet/gram)
3. Kaydedin - sistem otomatik ürün kodu oluşturur

### Alış/Satış İşlemi
1. "Ürün Yönetimi" > "Yeni İşlem"
2. İşlem türünü seçin (Alış/Satış)
3. Ürün, miktar ve fiyat bilgilerini girin
4. Kaydedin - sistem stok ve ödeme kaydı oluşturur

### Ödeme Yapma
1. "Ödeme Yönetimi" > Bekleyen ödemelerden birini seçin
2. "Ödeme Ekle" butonuna tıklayın
3. Ödeme bilgilerini girin
4. Tam veya kısmi ödeme seçeneğini belirleyin

## 📊 Veritabanı

SQLite veritabanı `prisma/dev.db` dosyasında saklanır. Veritabanını görüntülemek için:

```bash
npx prisma studio
```

## 🎨 Tema

Uygulama altın temasına uygun özel renk paleti kullanır:
- Primary: Altın sarısı (#FFB800)
- Dark mode desteği
- Responsive tasarım

## 📝 Lisans

Bu proje özel kullanım içindir.

## 👤 İletişim

Ahura Gold ERP © 2024
