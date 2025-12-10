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

export default async function ConsignmentsPage() {
  const consignments = await prisma.consignment.findMany({
    include: {
      customer: true,
      product: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emanet İşlemleri</h1>
          <p className="text-muted-foreground">Ürün, TL, Dolar ve Euro emanet takibi</p>
        </div>
        <Link href="/consignments/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Yeni Emanet İşlemi
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emanet Kayıtları</CardTitle>
        </CardHeader>
        <CardContent>
          {consignments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Henüz emanet kaydı bulunmamaktadır
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İşlem Kodu</TableHead>
                  <TableHead>Tarih/Saat</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>İşlem Türü</TableHead>
                  <TableHead>Emanet Türü</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Teslim Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consignments.map((consignment: any) => (
                  <TableRow key={consignment.id}>
                    <TableCell className="font-medium">
                      {consignment.transactionCode}
                    </TableCell>
                    <TableCell>{formatDate(consignment.createdAt)}</TableCell>
                    <TableCell>{consignment.customer.name}</TableCell>
                    <TableCell>
                      <Badge variant={consignment.consignmentType === 'VERME' ? 'destructive' : 'default'}>
                        {consignment.consignmentType === 'VERME' ? 'Verme' : 'Alma'}
                      </Badge>
                    </TableCell>
                    <TableCell>{consignment.itemType}</TableCell>
                    <TableCell>
                      {consignment.itemType === 'URUN' 
                        ? `${consignment.quantity} ${consignment.product?.unitType === 'ADET' ? 'adet' : 'gr'}`
                        : `${consignment.amount?.toFixed(2)} ${consignment.itemType}`}
                    </TableCell>
                    <TableCell>
                      {consignment.deliveryDate 
                        ? formatDate(consignment.deliveryDate) 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={consignment.status === 'ACTIVE' ? 'outline' : 'secondary'}>
                        {consignment.status === 'ACTIVE' ? 'Aktif' : 'İade Edildi'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/consignments/${consignment.id}`}>
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
