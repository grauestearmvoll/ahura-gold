import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { formatGrams } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FavoriteButton } from "@/components/favorite-button"

export const revalidate = 30 // Revalidate every 30 seconds

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: [
      { isFavorite: 'desc' },
      { customerCode: 'asc' }
    ],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Müşteri Yönetimi</h1>
          <p className="text-muted-foreground">Müşteri bilgileri ve bakiye takibi</p>
        </div>
        <Link href="/customers/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Yeni Müşteri
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Müşteri Listesi ({customers.length})</CardTitle>
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
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <FavoriteButton 
                        customerId={customer.id} 
                        isFavorite={customer.isFavorite} 
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.customerCode}
                    </TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <span className={customer.balance > 0 ? "text-green-600 font-semibold" : customer.balance < 0 ? "text-red-600 font-semibold" : ""}>
                        {customer.balanceCurrency 
                          ? `${customer.balance.toFixed(2)} ${customer.balanceCurrency}`
                          : formatGrams(customer.balance)
                        }
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
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
