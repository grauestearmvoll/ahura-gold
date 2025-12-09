import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star } from "lucide-react"
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

export default async function CustomersReportPage() {
  const customers = await prisma.customer.findMany({
    include: {
      _count: {
        select: {
          consignments: true,
          payments: true,
        }
      },
      consignments: true,
      payments: {
        where: { status: { in: ['PENDING', 'PARTIAL'] } }
      }
    },
    orderBy: { balance: 'desc' }
  })

  const totalCustomers = customers.length
  const favoriteCustomers = customers.filter(c => c.isFavorite).length
  const customersWithPositiveBalance = customers.filter(c => c.balance > 0).length
  const customersWithNegativeBalance = customers.filter(c => c.balance < 0).length
  const customersWithPendingPayments = customers.filter(c => c.payments.length > 0).length

  const totalPositiveBalance = customers
    .filter(c => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0)

  const totalNegativeBalance = customers
    .filter(c => c.balance < 0)
    .reduce((sum, c) => sum + Math.abs(c.balance), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Müşteri Raporu</h1>
          <p className="text-muted-foreground">Müşteri bakiyeleri ve işlem özeti</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {favoriteCustomers} favori
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Borçlu Müşteriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{customersWithPositiveBalance}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatGrams(totalPositiveBalance)} toplam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alacaklı Müşteriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{customersWithNegativeBalance}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatGrams(totalNegativeBalance)} toplam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Ödeme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{customersWithPendingPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Müşteri
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bakiye Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Henüz müşteri kaydı bulunmamaktadır
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Müşteri Kodu</TableHead>
                  <TableHead>Adı Soyadı</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead className="text-right">Bakiye (gr)</TableHead>
                  <TableHead className="text-center">Emanet</TableHead>
                  <TableHead className="text-center">Bekleyen Ödeme</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      {customer.isFavorite && (
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{customer.customerCode}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <span className={customer.balance > 0 ? "text-green-600 font-semibold" : customer.balance < 0 ? "text-red-600 font-semibold" : ""}>
                        {formatGrams(customer.balance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{customer._count.consignments}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {customer.payments.length > 0 ? (
                        <Badge variant="secondary">{customer.payments.length}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">
                          Detay
                        </Button>
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
