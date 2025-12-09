import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { DeleteButton } from "@/components/delete-button"

export default async function ConsignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const consignment = await prisma.consignment.findUnique({
    where: { id },
    include: {
      customer: true,
      product: true,
    },
  })

  if (!consignment) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emanet Detayı</h1>
          <p className="text-muted-foreground">İşlem Kodu: {consignment.transactionCode}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/consignments/edit/${id}`}>
            <Button variant="outline">Düzenle</Button>
          </Link>
          <DeleteButton id={id} type="consignment" redirectPath="/consignments" />
          <Link href="/consignments">
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
              <Badge variant={consignment.consignmentType === 'VERME' ? 'destructive' : 'default'}>
                {consignment.consignmentType === 'VERME' ? 'Emanet Verme' : 'Emanet Alma'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tarih/Saat</p>
              <p className="font-medium">{formatDate(consignment.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durum</p>
              <Badge variant={consignment.status === 'ACTIVE' ? 'outline' : 'secondary'}>
                {consignment.status === 'ACTIVE' ? 'Aktif' : 'İade Edildi'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Müşteri Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Müşteri Kodu</p>
              <p className="font-medium">{consignment.customer.customerCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Müşteri Adı</p>
              <p className="font-medium">{consignment.customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefon</p>
              <p className="font-medium">{consignment.customer.phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emanet Detayları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Emanet Türü</p>
              <p className="font-medium">{consignment.itemType}</p>
            </div>
            {consignment.itemType === 'URUN' ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Ürün</p>
                  <p className="font-medium">{consignment.product?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Miktar</p>
                  <p className="font-medium">
                    {consignment.quantity} {consignment.product?.unitType === 'ADET' ? 'adet' : 'gram'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Has Altın Fiyatları</p>
                  <p className="font-medium">
                    Alış: ₺{consignment.goldBuyPrice?.toFixed(2)} / Satış: ₺{consignment.goldSellPrice?.toFixed(2)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Tutar</p>
                  <p className="font-medium">
                    {consignment.amount?.toFixed(2)} {consignment.itemType}
                  </p>
                </div>
                {['DOLAR', 'EURO'].includes(consignment.itemType) && (
                  <div>
                    <p className="text-sm text-muted-foreground">Döviz Kurları</p>
                    <p className="font-medium">
                      Alış: ₺{consignment.currencyBuyPrice?.toFixed(2)} / Satış: ₺{consignment.currencySellPrice?.toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarih Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Teslim Tarihi</p>
              <p className="font-medium">
                {consignment.deliveryDate ? formatDate(consignment.deliveryDate) : 'Belirtilmemiş'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">İade Tarihi</p>
              <p className="font-medium">
                {consignment.returnDate ? formatDate(consignment.returnDate) : 'Belirtilmemiş'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {consignment.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{consignment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
