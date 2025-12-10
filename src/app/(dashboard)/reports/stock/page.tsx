import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatGrams } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const revalidate = 60

export default async function StockReportPage() {
  const products = await prisma.product.findMany({
    include: {
      _count: {
        select: { transactions: true }
      }
    },
    orderBy: { productCode: 'asc' }
  })

  const productsWithStock = await Promise.all(
    products.map(async (product) => {
      const transactions = await prisma.productTransaction.findMany({
        where: { productId: product.id },
      })

      let totalStock = 0
      transactions.forEach((t) => {
        if (t.transactionType === 'ALIS') {
          totalStock += t.remainingStock
        }
      })

      return {
        ...product,
        totalStock,
        transactionCount: transactions.length,
      }
    })
  )

  const totalProductTypes = products.length
  const totalStockValue = productsWithStock.reduce((sum, p) => {
    const grams = p.unitType === 'ADET' && p.gramPerPiece 
      ? p.totalStock * p.gramPerPiece 
      : p.totalStock
    return sum + (grams * p.buyMilyem)
  }, 0)

  const lowStockProducts = productsWithStock.filter(p => p.totalStock < 10)
  const outOfStockProducts = productsWithStock.filter(p => p.totalStock === 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Stok Raporu</h1>
          <p className="text-muted-foreground">Mevcut ürün stok durumu</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ürün Çeşidi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductTypes}</div>
            <p className="text-xs text-muted-foreground mt-1">Kayıtlı ürün</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Stok Değeri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatGrams(totalStockValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Has altın gram</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">10&apos;un altında</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stokta Yok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Tükenen ürünler</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Stok Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {productsWithStock.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Henüz ürün tanımlanmamış
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün Kodu</TableHead>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead>Birim</TableHead>
                  <TableHead>Ayar</TableHead>
                  <TableHead className="text-right">Stok Miktarı</TableHead>
                  <TableHead className="text-right">Has Altın (gr)</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsWithStock.map((product) => {
                  const grams = product.unitType === 'ADET' && product.gramPerPiece
                    ? product.totalStock * product.gramPerPiece
                    : product.totalStock
                  const hasGrams = grams * product.buyMilyem

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.productCode}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {product.unitType === 'ADET' 
                          ? `Adet (${product.gramPerPiece}gr)`
                          : 'Gram'}
                      </TableCell>
                      <TableCell>{product.buyMilyem}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {product.unitType === 'ADET'
                          ? `${product.totalStock} adet`
                          : formatGrams(product.totalStock)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatGrams(hasGrams)}
                      </TableCell>
                      <TableCell>
                        {product.totalStock === 0 ? (
                          <Badge variant="destructive">Stokta Yok</Badge>
                        ) : product.totalStock < 10 ? (
                          <Badge variant="secondary">Düşük Stok</Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
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
