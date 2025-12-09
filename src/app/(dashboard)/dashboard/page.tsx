import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, ArrowDownIcon, PackageIcon, AlertCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatTL, formatGrams } from "@/lib/utils"

export const revalidate = 60 // Revalidate every 60 seconds

export default async function DashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Günlük alış toplamı
  const dailyPurchases = await prisma.productTransaction.findMany({
    where: {
      transactionType: 'ALIS',
      createdAt: { gte: today },
    },
  })
  const dailyPurchaseTotal = dailyPurchases.reduce((sum: number, t: any) => sum + t.totalAmount, 0)

  // Günlük satış toplamı
  const dailySales = await prisma.productTransaction.findMany({
    where: {
      transactionType: 'SATIS',
      createdAt: { gte: today },
    },
  })
  const dailySaleTotal = dailySales.reduce((sum: number, t: any) => sum + t.totalAmount, 0)

  // Günlük kar/zarar
  const dailyProfit = dailySaleTotal - dailyPurchaseTotal

  // Bekleyen ödemeler
  const pendingPayments = await prisma.payment.count({
    where: {
      status: { in: ['PENDING', 'PARTIAL'] }
    }
  })

  // Emanet uyarıları
  const oneDayAhead = new Date(today)
  oneDayAhead.setDate(oneDayAhead.getDate() + 1)
  
  const fiveDaysAhead = new Date(today)
  fiveDaysAhead.setDate(fiveDaysAhead.getDate() + 5)
  
  const tenDaysAhead = new Date(today)
  tenDaysAhead.setDate(tenDaysAhead.getDate() + 10)

  const consignmentsDue1Day = await prisma.consignment.count({
    where: {
      status: 'ACTIVE',
      deliveryDate: { lte: oneDayAhead, gte: today }
    }
  })

  const consignmentsDue5Days = await prisma.consignment.count({
    where: {
      status: 'ACTIVE',
      deliveryDate: { lte: fiveDaysAhead, gte: today }
    }
  })

  const consignmentsDue10Days = await prisma.consignment.count({
    where: {
      status: 'ACTIVE',
      deliveryDate: { lte: tenDaysAhead, gte: today }
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
            <p className="text-xs text-muted-foreground">Türk Lirası</p>
          </CardContent>
        </Card>

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

      {/* Emanet Uyarıları */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              1 Gün İçinde Teslim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold">{consignmentsDue1Day}</p>
              <p className="text-xs text-muted-foreground mt-1">Emanet kaydı</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              5 Gün İçinde Teslim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold">{consignmentsDue5Days}</p>
              <p className="text-xs text-muted-foreground mt-1">Emanet kaydı</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              10 Gün İçinde Teslim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold">{consignmentsDue10Days}</p>
              <p className="text-xs text-muted-foreground mt-1">Emanet kaydı</p>
            </div>
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
                    <p className="font-medium">{formatGrams(customer.balance)}</p>
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
