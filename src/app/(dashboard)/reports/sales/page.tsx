import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatDate, formatTL, formatGrams } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const revalidate = 60

export default async function SalesReportPage() {
  // Son 30 günün işlemleri
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const salesTransactions = await prisma.productTransaction.findMany({
    where: {
      transactionType: 'SATIS',
      createdAt: { gte: thirtyDaysAgo },
    },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const purchaseTransactions = await prisma.productTransaction.findMany({
    where: {
      transactionType: 'ALIS',
      createdAt: { gte: thirtyDaysAgo },
    },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalSales = salesTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
  const totalPurchases = purchaseTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
  const profit = totalSales - totalPurchases

  const totalSalesGrams = salesTransactions.reduce((sum, t) => {
    const grams = t.product.unitType === 'ADET' && t.product.gramPerPiece 
      ? t.quantity * t.product.gramPerPiece 
      : t.quantity
    return sum + (grams * t.karat)
  }, 0)

  const totalPurchasesGrams = purchaseTransactions.reduce((sum, t) => {
    const grams = t.product.unitType === 'ADET' && t.product.gramPerPiece 
      ? t.quantity * t.product.gramPerPiece 
      : t.quantity
    return sum + (grams * t.karat)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Satış Raporu</h1>
          <p className="text-muted-foreground">Son 30 günün satış ve alış işlemleri</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatTL(totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatGrams(totalSalesGrams)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Alış</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatTL(totalPurchases)}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatGrams(totalPurchasesGrams)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kar/Zarar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatTL(profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profit >= 0 ? 'Kar' : 'Zarar'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam İşlem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesTransactions.length + purchaseTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {salesTransactions.length} satış, {purchaseTransactions.length} alış
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Satış İşlemleri ({salesTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {salesTransactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Son 30 günde satış işlemi bulunmamaktadır
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlem Kodu</TableHead>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Milyem</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesTransactions.map((transaction) => {
                  const grams = transaction.product.unitType === 'ADET' && transaction.product.gramPerPiece
                    ? transaction.quantity * transaction.product.gramPerPiece
                    : transaction.quantity
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell className="font-medium">{transaction.transactionCode}</TableCell>
                      <TableCell>{transaction.product.name}</TableCell>
                      <TableCell>
                        {transaction.product.unitType === 'ADET' 
                          ? `${transaction.quantity} adet`
                          : formatGrams(transaction.quantity)}
                      </TableCell>
                      <TableCell>{transaction.karat}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatTL(transaction.totalAmount)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alış İşlemleri ({purchaseTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseTransactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Son 30 günde alış işlemi bulunmamaktadır
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlem Kodu</TableHead>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Milyem</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseTransactions.map((transaction) => {
                  const grams = transaction.product.unitType === 'ADET' && transaction.product.gramPerPiece
                    ? transaction.quantity * transaction.product.gramPerPiece
                    : transaction.quantity
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell className="font-medium">{transaction.transactionCode}</TableCell>
                      <TableCell>{transaction.product.name}</TableCell>
                      <TableCell>
                        {transaction.product.unitType === 'ADET' 
                          ? `${transaction.quantity} adet`
                          : formatGrams(transaction.quantity)}
                      </TableCell>
                      <TableCell>{transaction.karat}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatTL(transaction.totalAmount)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
