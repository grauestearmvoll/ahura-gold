import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { formatDate, formatTL } from "@/lib/utils"
import PaymentDialog from "@/components/payment-dialog"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const revalidate = 30 // Revalidate every 30 seconds

export default async function PaymentsPage() {
  const pendingPayments = await prisma.payment.findMany({
    where: {
      status: { in: ['PENDING', 'PARTIAL'] }
    },
    include: {
      productTransaction: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const completedPayments = await prisma.payment.findMany({
    where: {
      OR: [
        { status: 'COMPLETED' },
        { status: 'PARTIAL', paidAmount: { gt: 0 } }
      ]
    },
    include: {
      productTransaction: {
        include: {
          product: true,
        },
      },
      paymentDetails: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ödeme Yönetimi</h1>
        <p className="text-muted-foreground">Bekleyen ve tamamlanan ödemeler</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Bekleyen Ödemeler ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Tamamlanan Ödemeler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Ödemeler</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Bekleyen ödeme bulunmamaktadır
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İşlem Kodu</TableHead>
                      <TableHead>Tarih/Saat</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Ürün</TableHead>
                      <TableHead>Toplam Tutar</TableHead>
                      <TableHead>Kalan Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.transactionCode}
                        </TableCell>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={payment.paymentType === 'ODEME' ? 'destructive' : 'default'}>
                            {payment.paymentType === 'ODEME' ? 'Ödeme' : 'Tahsilat'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.productTransaction?.product.name || '-'}
                        </TableCell>
                        <TableCell>{formatTL(payment.totalAmount)}</TableCell>
                        <TableCell>{formatTL(payment.remainingAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'PARTIAL' ? 'secondary' : 'outline'}>
                            {payment.status === 'PARTIAL' ? 'Kısmi' : 'Bekliyor'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {payment.productTransactionId && (
                            <Link href={`/products/${payment.productTransactionId}`}>
                              <Button variant="ghost" size="sm">Detay</Button>
                            </Link>
                          )}
                          <PaymentDialog payment={payment} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Tamamlanan Ödemeler</CardTitle>
            </CardHeader>
            <CardContent>
              {completedPayments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Tamamlanan ödeme bulunmamaktadır
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İşlem Kodu</TableHead>
                      <TableHead>Tarih/Saat</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Ürün</TableHead>
                      <TableHead>Ödenen Tutar</TableHead>
                      <TableHead>Toplam Tutar</TableHead>
                      <TableHead>Ödeme Yöntemi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedPayments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.transactionCode}
                        </TableCell>
                        <TableCell>{formatDate(payment.updatedAt)}</TableCell>
                        <TableCell>
                          <Badge variant={payment.paymentType === 'ODEME' ? 'destructive' : 'default'}>
                            {payment.paymentType === 'ODEME' ? 'Ödeme' : 'Tahsilat'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.productTransaction?.product.name || '-'}
                        </TableCell>
                        <TableCell>{formatTL(payment.paidAmount)}</TableCell>
                        <TableCell>{formatTL(payment.totalAmount)}</TableCell>
                        <TableCell>{payment.paymentMethod || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {payment.status === 'COMPLETED' ? 'Tamamlandı' : 'Kısmi'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.productTransactionId && (
                            <Link href={`/products/${payment.productTransactionId}`}>
                              <Button variant="ghost" size="sm">Detay</Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
