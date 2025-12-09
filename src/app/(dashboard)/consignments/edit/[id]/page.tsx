"use client"

import { notFound, useRouter } from "next/navigation"
import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function EditConsignmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [consignment, setConsignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    quantity: "",
    karat: "",
    amount: "",
    currencyBuyPrice: "",
    currencySellPrice: "",
    goldBuyPrice: "",
    goldSellPrice: "",
    deliveryDate: "",
    returnDate: "",
    notes: "",
  })

  useEffect(() => {
    fetch(`/api/consignments/${id}`)
      .then(res => res.json())
      .then(data => {
        setConsignment(data)
        setFormData({
          quantity: data.quantity?.toString() || "",
          karat: data.karat?.toString() || "",
          amount: data.amount?.toString() || "",
          currencyBuyPrice: data.currencyBuyPrice?.toString() || "",
          currencySellPrice: data.currencySellPrice?.toString() || "",
          goldBuyPrice: data.goldBuyPrice?.toString() || "",
          goldSellPrice: data.goldSellPrice?.toString() || "",
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString().split('T')[0] : "",
          returnDate: data.returnDate ? new Date(data.returnDate).toISOString().split('T')[0] : "",
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
      const updateData: any = {}
      
      if (consignment.itemType === 'URUN') {
        if (formData.quantity) updateData.quantity = parseFloat(formData.quantity)
        if (formData.karat) updateData.karat = parseFloat(formData.karat)
        if (formData.goldBuyPrice) updateData.goldBuyPrice = parseFloat(formData.goldBuyPrice)
        if (formData.goldSellPrice) updateData.goldSellPrice = parseFloat(formData.goldSellPrice)
      } else {
        if (formData.amount) updateData.amount = parseFloat(formData.amount)
        if (['DOLAR', 'EURO'].includes(consignment.itemType)) {
          if (formData.currencyBuyPrice) updateData.currencyBuyPrice = parseFloat(formData.currencyBuyPrice)
          if (formData.currencySellPrice) updateData.currencySellPrice = parseFloat(formData.currencySellPrice)
        }
      }

      updateData.deliveryDate = formData.deliveryDate || null
      updateData.returnDate = formData.returnDate || null
      updateData.notes = formData.notes

      const response = await fetch(`/api/consignments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        router.push(`/consignments/${id}`)
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

  if (!consignment) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emanet Düzenle</h1>
          <p className="text-muted-foreground">İşlem Kodu: {consignment.transactionCode}</p>
        </div>
        <Link href={`/consignments/${id}`}>
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
              <Label>Müşteri</Label>
              <Input value={consignment.customer.name} disabled />
            </div>

            <div className="space-y-2">
              <Label>İşlem Türü</Label>
              <Input value={consignment.consignmentType === "VERME" ? "Emanet Verme" : "Emanet Alma"} disabled />
            </div>

            <div className="space-y-2">
              <Label>Emanet Türü</Label>
              <Input value={consignment.itemType} disabled />
            </div>

            {consignment.itemType === 'URUN' ? (
              <>
                <div className="space-y-2">
                  <Label>Ürün</Label>
                  <Input value={consignment.product?.name || '-'} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Miktar ({consignment.product?.unitType === 'ADET' ? 'Adet' : 'Gram'}) *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.001"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="karat">Milyem (Ayar) *</Label>
                  <Input
                    id="karat"
                    type="number"
                    step="0.001"
                    required
                    value={formData.karat}
                    onChange={(e) => setFormData({ ...formData, karat: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goldBuyPrice">Has Altın Alış (₺) *</Label>
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
                    <Label htmlFor="goldSellPrice">Has Altın Satış (₺) *</Label>
                    <Input
                      id="goldSellPrice"
                      type="number"
                      step="0.01"
                      required
                      value={formData.goldSellPrice}
                      onChange={(e) => setFormData({ ...formData, goldSellPrice: e.target.value })}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">Miktar ({consignment.itemType}) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                {['DOLAR', 'EURO'].includes(consignment.itemType) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currencyBuyPrice">Alış Kuru *</Label>
                      <Input
                        id="currencyBuyPrice"
                        type="number"
                        step="0.01"
                        required
                        value={formData.currencyBuyPrice}
                        onChange={(e) => setFormData({ ...formData, currencyBuyPrice: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currencySellPrice">Satış Kuru *</Label>
                      <Input
                        id="currencySellPrice"
                        type="number"
                        step="0.01"
                        required
                        value={formData.currencySellPrice}
                        onChange={(e) => setFormData({ ...formData, currencySellPrice: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Teslim Tarihi</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnDate">İade Tarihi</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                />
              </div>
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
              <Link href={`/consignments/${id}`}>
                <Button type="button" variant="outline">İptal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
