import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatGrams } from "@/lib/utils"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { DeleteButton } from "@/components/delete-button"

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      consignments: {
        include: { product: true },
        orderBy: { createdAt: 'desc' },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">Müşteri Kodu: {customer.customerCode}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/edit/${id}`}>
            <Button variant="outline">Düzenle</Button>
          </Link>
          <DeleteButton id={id} type="customer" redirectPath="/customers" />
          <Link href="/customers">
            <Button variant="outline">Geri Dön</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Telefon</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
            {customer.tcNo && (
              <div>
                <p className="text-sm text-muted-foreground">TC Kimlik No</p>
                <p className="font-medium">{customer.tcNo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bakiye</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatGrams(customer.balance)}</p>
            <p className="text-sm text-muted-foreground mt-1">Has altın gramı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Durum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={customer.isFavorite ? "default" : "outline"}>
                {customer.isFavorite ? "İşaretli" : "Normal"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{customer.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Emanet İşlemleri</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.consignments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Emanet işlem kaydı bulunmamaktadır
              </div>
            ) : (
              <div className="space-y-3">
                {customer.consignments.map((consignment: any) => (
                  <div key={consignment.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{consignment.transactionCode}</span>
                      <Badge variant={consignment.status === "ACTIVE" ? "default" : "secondary"}>
                        {consignment.status === "ACTIVE" ? "Aktif" : "İade Edildi"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tür:</span>
                        <span>{consignment.consignmentType === "VERME" ? "Emanet Verme" : "Emanet Alma"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Eşya:</span>
                        <span>
                          {consignment.itemType === "URUN" && consignment.product 
                            ? consignment.product.name 
                            : consignment.itemType}
                        </span>
                      </div>
                      {consignment.quantity && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Miktar:</span>
                          <span>{consignment.quantity.toFixed(2)}</span>
                        </div>
                      )}
                      {consignment.amount && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tutar:</span>
                          <span>{consignment.itemType} {consignment.amount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ödeme İşlemleri</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.payments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Ödeme kaydı bulunmamaktadır
              </div>
            ) : (
              <div className="space-y-3">
                {customer.payments.map((payment: any) => (
                  <div key={payment.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{payment.transactionCode}</span>
                      <Badge variant={
                        payment.status === "COMPLETED" ? "default" : 
                        payment.status === "PARTIAL" ? "secondary" : 
                        "outline"
                      }>
                        {payment.status === "COMPLETED" ? "Tamamlandı" : 
                         payment.status === "PARTIAL" ? "Kısmi" : 
                         "Bekliyor"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Toplam:</span>
                        <span>₺{payment.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ödenen:</span>
                        <span>₺{payment.paidAmount.toFixed(2)}</span>
                      </div>
                      {payment.remainingAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kalan:</span>
                          <span className="text-orange-600">₺{payment.remainingAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
