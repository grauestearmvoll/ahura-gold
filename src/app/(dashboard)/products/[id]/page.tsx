import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatGrams } from "@/lib/utils"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { DeleteTransactionButton } from "@/components/delete-transaction-button"

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const transaction = await prisma.productTransaction.findUnique({
    where: { id },
    include: {
      product: true,
      payment: true,
    },
  })

  if (!transaction) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İşlem Detayı</h1>
          <p className="text-muted-foreground">İşlem Kodu: {transaction.transactionCode}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/products/edit/${id}`}>
            <Button variant="outline">Düzenle</Button>
          </Link>
          <DeleteTransactionButton transactionId={id} />
          <Link href="/products">
            <Button variant="outline">Geri Dön</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>İşlem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">İşlem Türü</p>
              <Badge variant={transaction.transactionType === 'ALIS' ? 'destructive' : 'default'}>
                {transaction.transactionType === 'ALIS' ? 'Alış' : 'Satış'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tarih/Saat</p>
              <p className="font-medium">{formatDate(transaction.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Miktar</p>
              <p className="font-medium">
                {transaction.product.unitType === 'ADET' 
                  ? `${transaction.quantity} adet` 
                  : formatGrams(transaction.quantity)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {transaction.transactionType === 'ALIS' ? 'Alış Milyemi' : 'Satış Milyemi'}
              </p>
              <p className="font-medium">{transaction.milyem}</p>
            </div>
            {transaction.product.unitType === 'ADET' && transaction.product.gramPerPiece && (
              <div>
                <p className="text-sm text-muted-foreground">Toplam Gramaj</p>
                <p className="font-medium">{formatGrams(transaction.quantity * transaction.product.gramPerPiece)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ürün Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Ürün Kodu</p>
              <p className="font-medium">{transaction.product.productCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ürün Adı</p>
              <p className="font-medium">{transaction.product.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alış Milyemi</p>
              <p className="font-medium">{transaction.product.buyMilyem}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Satış Milyemi</p>
              <p className="font-medium">{transaction.product.sellMilyem}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kalan Stok</p>
              <p className="font-medium">
                {transaction.product.unitType === 'ADET' 
                  ? `${transaction.remainingStock} adet` 
                  : formatGrams(transaction.remainingStock)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fiyat Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Has Altın Alış Fiyatı (İşlem)</p>
              <p className="font-medium">₺{transaction.goldBuyPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Has Altın Satış Fiyatı (İşlem)</p>
              <p className="font-medium">₺{transaction.goldSellPrice.toFixed(2)}</p>
            </div>
            {transaction.discountAmount > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {transaction.transactionType === 'ALIS' ? 'Artış/İkram' : 'İskonto'}
                </p>
                <p className={`font-medium ${transaction.transactionType === 'ALIS' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.transactionType === 'ALIS' ? '+' : '-'}₺{transaction.discountAmount.toFixed(2)}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Toplam Tutar</p>
              <p className="font-medium text-lg">₺{transaction.totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {transaction.payment && (
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Durumu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Durum</p>
                <Badge variant={
                  transaction.payment.status === 'COMPLETED' ? 'default' : 
                  transaction.payment.status === 'PARTIAL' ? 'secondary' : 'outline'
                }>
                  {transaction.payment.status === 'COMPLETED' ? 'Tamamlandı' : 
                   transaction.payment.status === 'PARTIAL' ? 'Kısmi' : 'Bekliyor'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ödenen</p>
                <p className="font-medium">₺{transaction.payment.paidAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kalan</p>
                <p className="font-medium">₺{transaction.payment.remainingAmount.toFixed(2)}</p>
              </div>
              {transaction.payment.status !== 'COMPLETED' && (
                <Link href={`/payments/${transaction.payment.id}`}>
                  <Button className="w-full">Ödeme Yap</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {transaction.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{transaction.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
