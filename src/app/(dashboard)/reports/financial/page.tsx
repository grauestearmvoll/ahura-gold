import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatTL, formatGrams } from "@/lib/utils"

export const revalidate = 60

export default async function FinancialReportPage() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const allTransactions = await prisma.productTransaction.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
  })

  const allPayments = await prisma.payment.findMany({
    include: {
      paymentDetails: true,
    },
  })

  const totalSales = allTransactions
    .filter(t => t.transactionType === 'SATIS')
    .reduce((sum, t) => sum + t.totalAmount, 0)

  const totalPurchases = allTransactions
    .filter(t => t.transactionType === 'ALIS')
    .reduce((sum, t) => sum + t.totalAmount, 0)

  const totalPaidAmount = allPayments.reduce((sum, p) => sum + p.paidAmount, 0)
  const totalPendingAmount = allPayments
    .filter(p => p.status !== 'COMPLETED')
    .reduce((sum, p) => sum + p.remainingAmount, 0)

  const completedPayments = allPayments.filter(p => p.status === 'COMPLETED').length
  const pendingPayments = allPayments.filter(p => p.status === 'PENDING').length
  const partialPayments = allPayments.filter(p => p.status === 'PARTIAL').length

  const profit = totalSales - totalPurchases
  const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Mali Rapor</h1>
          <p className="text-muted-foreground">Son 30 günün finansal özeti</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Gelir-Gider Özeti</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatTL(totalSales)}</div>
              <p className="text-xs text-muted-foreground mt-1">Son 30 gün</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Toplam Alış</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatTL(totalPurchases)}</div>
              <p className="text-xs text-muted-foreground mt-1">Son 30 gün</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Kar/Zarar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatTL(profit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Kar marjı: %{profitMargin.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ortalama İşlem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allTransactions.length > 0 
                  ? formatTL((totalSales + totalPurchases) / allTransactions.length)
                  : formatTL(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {allTransactions.length} işlem
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Ödeme Durumu</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tahsil Edilen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatTL(totalPaidAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">Toplam ödenen</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Tahsilat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatTL(totalPendingAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">Alınacak</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedPayments}</div>
              <p className="text-xs text-muted-foreground mt-1">Ödeme</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen/Kısmi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {pendingPayments + partialPayments}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingPayments} bekleyen, {partialPayments} kısmi
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Finansal Özet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="font-medium">Toplam Cirolar (Satış + Alış)</span>
            <span className="text-lg font-bold">{formatTL(totalSales + totalPurchases)}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="font-medium">Net Kar/Zarar</span>
            <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatTL(profit)}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="font-medium">Tahsil Oranı</span>
            <span className="text-lg font-bold">
              %{totalSales > 0 ? ((totalPaidAmount / totalSales) * 100).toFixed(1) : '0.0'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Bekleyen Tahsilat</span>
            <span className="text-lg font-bold text-orange-600">{formatTL(totalPendingAmount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
