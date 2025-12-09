"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Package, DollarSign, Users } from "lucide-react"
import Link from "next/link"

const reportTypes = [
  {
    title: "Satış Raporu",
    description: "Belirli tarih aralığında yapılan satış işlemlerini görüntüleyin",
    icon: DollarSign,
    href: "/reports/sales",
  },
  {
    title: "Stok Raporu",
    description: "Mevcut ürün stok durumunu ve hareketlerini görüntüleyin",
    icon: Package,
    href: "/reports/stock",
  },
  {
    title: "Mali Rapor",
    description: "Gelir-gider ve kar-zarar durumunu görüntüleyin",
    icon: FileText,
    href: "/reports/financial",
  },
  {
    title: "Müşteri Raporu",
    description: "Müşteri bakiyeleri ve işlem geçmişlerini görüntüleyin",
    icon: Users,
    href: "/reports/customers",
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Raporlar</h1>
        <p className="text-muted-foreground">İşletme raporlarını görüntüleyin ve dışa aktarın</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.href} className="hover:bg-accent transition-colors">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <report.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{report.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {report.description}
              </p>
              <Link href={report.href}>
                <Button variant="outline" className="w-full">
                  Raporu Görüntüle
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
