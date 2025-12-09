"use client"

import { notFound, useRouter } from "next/navigation"
import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    quantity: "",
    goldBuyPrice: "",
    goldSellPrice: "",
    notes: "",
  })

  useEffect(() => {
    fetch(`/api/products/transactions/${id}`)
      .then(res => res.json())
      .then(data => {
        setTransaction(data)
        setFormData({
          quantity: data.quantity.toString(),
          goldBuyPrice: data.goldBuyPrice.toString(),
          goldSellPrice: data.goldSellPrice.toString(),
          notes: data.notes || "",
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/products/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseFloat(formData.quantity),
          goldBuyPrice: parseFloat(formData.goldBuyPrice),
          goldSellPrice: parseFloat(formData.goldSellPrice),
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        router.push(`/products/${id}`)
        router.refresh()
      } else {
        alert('İşlem güncellenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>
  }

  if (!transaction) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İşlem Düzenle</h1>
          <p className="text-muted-foreground">İşlem Kodu: {transaction.transactionCode}</p>
        </div>
        <Link href={`/products/${id}`}>
          <Button variant="outline">İptal</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İşlem Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ürün</Label>
              <Input value={transaction.product.name} disabled />
            </div>

            <div className="space-y-2">
              <Label>İşlem Türü</Label>
              <Input value={transaction.transactionType === "ALIS" ? "Alış" : "Satış"} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Miktar ({transaction.product.unitType === "ADET" ? "Adet" : "Gram"}) *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goldBuyPrice">Has Altın Alış Fiyatı (₺) *</Label>
              <Input
                id="goldBuyPrice"
                type="number"
                step="0.01"
                required
                value={formData.goldBuyPrice}
                onChange={(e) => setFormData({ ...formData, goldBuyPrice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goldSellPrice">Has Altın Satış Fiyatı (₺) *</Label>
              <Input
                id="goldSellPrice"
                type="number"
                step="0.01"
                required
                value={formData.goldSellPrice}
                onChange={(e) => setFormData({ ...formData, goldSellPrice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
              <Link href={`/products/${id}`}>
                <Button type="button" variant="outline">İptal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
