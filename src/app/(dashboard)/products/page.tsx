import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatDate, formatGrams } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = 'force-dynamic'
export const revalidate = 0

const transactionTypeLabels = {
  ALIS: "Alış",
  SATIS: "Satış",
}

export default async function ProductsPage() {
  const recentTransactions = await prisma.productTransaction.findMany({
    include: {
      product: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
          <p className="text-muted-foreground">Ürün alış, satış ve stok işlemleri</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products/new-product">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Yeni Ürün Tanımla
            </Button>
          </Link>
          <Link href="/products/new-transaction">
            <Button variant="outline">
              <PlusIcon className="mr-2 h-4 w-4" />
              Yeni İşlem
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Henüz işlem kaydı bulunmamaktadır
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İşlem Kodu</TableHead>
                  <TableHead>Tarih/Saat</TableHead>
                  <TableHead>İşlem Türü</TableHead>
                  <TableHead>Ürün Kodu</TableHead>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead>Milyem</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Kalan Stok</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.transactionCode}
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.transactionType === 'ALIS' ? 'destructive' : 'default'}>
                        {transactionTypeLabels[transaction.transactionType as keyof typeof transactionTypeLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.product.productCode}</TableCell>
                    <TableCell>{transaction.product.name}</TableCell>
                    <TableCell>{transaction.karat}</TableCell>
                    <TableCell>
                      {transaction.product.unitType === 'ADET' 
                        ? `${transaction.quantity} adet` 
                        : formatGrams(transaction.quantity)
                      }
                    </TableCell>
                    <TableCell>
                      {transaction.product.unitType === 'ADET' 
                        ? `${transaction.remainingStock} adet` 
                        : formatGrams(transaction.remainingStock)
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/products/${transaction.id}`}>
                        <Button variant="ghost" size="sm">Detay</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
