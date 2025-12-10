import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, ArrowDownIcon, PackageIcon, AlertCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatTL, formatGrams } from "@/lib/utils"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Günlük alış işlemleri ve toplam tutarı
  const dailyPurchases = await prisma.productTransaction.findMany({
    where: {
      transactionType: 'ALIS',
      createdAt: { gte: today },
    },
    include: {
      product: true,
    },
  })
  
  // Alış toplamı: Her işlem için totalAmount (Gramaj x buyMilyem x goldPrice - İskonto)
  const dailyPurchaseTotal = dailyPurchases.reduce((sum: number, t: any) => sum + t.totalAmount, 0)

  // Günlük satış işlemleri ve toplam tutarı
  const dailySales = await prisma.productTransaction.findMany({
    where: {
      transactionType: 'SATIS',
      createdAt: { gte: today },
    },
    include: {
      product: true,
    },
  })
  
  // Satış toplamı: Her işlem için totalAmount (Gramaj x sellMilyem x goldPrice - İskonto)
  const dailySaleTotal = dailySales.reduce((sum: number, t: any) => sum + t.totalAmount, 0)

  // Günlük kar/zarar: Satış tutarı - Alış tutarı
  const dailyProfit = dailySaleTotal - dailyPurchaseTotal

  // Tüm alış işlemlerini al (stokta olanlar için)
  const allPurchases = await prisma.productTransaction.findMany({
    where: {
      transactionType: 'ALIS',
    },
    include: {
      product: true,
    },
  })

  // Tüm satış işlemlerini al
  const allSales = await prisma.productTransaction.findMany({
    where: {
      transactionType: 'SATIS',
    },
  })

  // Her ürün için stok hesapla
  const productStocks = new Map<string, number>()
  
  for (const t of allPurchases) {
    const current = productStocks.get(t.productId) || 0
    productStocks.set(t.productId, current + t.quantity)
  }
  
  for (const t of allSales) {
    const current = productStocks.get(t.productId) || 0
    productStocks.set(t.productId, current - t.quantity)
  }

  // Gerçekleştirilmemiş kar hesapla
  let unrealizedProfit = 0
  
  for (const purchase of allPurchases) {
    const remainingStock = productStocks.get(purchase.productId) || 0
    if (remainingStock > 0) {
      // Bu alış işleminden kalan stok var mı?
      let purchaseStock = purchase.quantity
      
      // Bu ürünün satışlarını kontrol et
      const productSales = allSales.filter(s => s.productId === purchase.productId)
      for (const sale of productSales) {
        purchaseStock -= sale.quantity
        if (purchaseStock <= 0) break
      }
      
      if (purchaseStock > 0) {
        // Stokta kalan miktar için potansiyel kar hesapla
        let totalGrams = purchaseStock
        if (purchase.product.unitType === 'ADET' && purchase.product.gramPerPiece) {
          totalGrams = purchaseStock * purchase.product.gramPerPiece
        }
        
        // Alış maliyeti (gerçekleşen)
        const purchaseCost = (totalGrams * purchase.milyem * purchase.goldBuyPrice)
        
        // Potansiyel satış tutarı (güncel fiyatlarla)
        const potentialSale = (totalGrams * purchase.product.sellMilyem * purchase.goldSellPrice)
        
        unrealizedProfit += (potentialSale - purchaseCost)
      }
    }
  }

  // Gerçekleştirilmemiş kar oranı
  const totalPurchaseValue = allPurchases.reduce((sum: number, t: any) => sum + t.totalAmount, 0)
  const unrealizedProfitRate = totalPurchaseValue > 0 ? (unrealizedProfit / totalPurchaseValue) * 100 : 0

  // Bekleyen ödemeler
  const pendingPayments = await prisma.payment.count({
    where: {
      status: { in: ['PENDING', 'PARTIAL'] }
    }
  })

  // İşaretli müşteriler
  const favoriteCustomers = await prisma.customer.findMany({
    where: { isFavorite: true },
    orderBy: { name: 'asc' }
  })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Günlük özet ve önemli bilgiler</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Alış</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTL(dailyPurchaseTotal)}</div>
            <p className="text-xs text-muted-foreground">Türk Lirası</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Satış</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTL(dailySaleTotal)}</div>
            <p className="text-xs text-muted-foreground">Türk Lirası</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Kar/Zarar</CardTitle>
            <PackageIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatTL(Math.abs(dailyProfit))}
            </div>
            <p className="text-xs text-muted-foreground">Gerçekleşen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gerçekleştirilmemiş Kar</CardTitle>
            <PackageIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${unrealizedProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatTL(Math.abs(unrealizedProfit))}
            </div>
            <p className="text-xs text-muted-foreground">
              %{unrealizedProfitRate.toFixed(2)} Oran
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ek Bilgiler */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Ödemeler</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Toplam işlem</p>
          </CardContent>
        </Card>
      </div>

      {/* İşaretli Müşteriler */}
      <Card>
        <CardHeader>
          <CardTitle>İşaretli Müşteriler</CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteCustomers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Henüz işaretli müşteri bulunmamaktadır
            </div>
          ) : (
            <div className="space-y-2">
              {favoriteCustomers.map((customer: any) => (
                <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.customerCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {customer.balanceCurrency 
                        ? `${customer.balance.toFixed(2)} ${customer.balanceCurrency}`
                        : formatGrams(customer.balance)
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
