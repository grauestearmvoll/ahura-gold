"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Customer {
  id: string
  customerCode: string
  name: string
}

interface Product {
  id: string
  productCode: string
  name: string
  unitType: string
}

export default function NewConsignmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    customerId: "",
    consignmentType: "VERME",
    itemType: "URUN",
    productId: "",
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
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
    
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
  }, [])

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      setSelectedProduct(product)
      setFormData({ ...formData, productId })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/consignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formData.customerId,
          consignmentType: formData.consignmentType,
          itemType: formData.itemType,
          productId: formData.itemType === "URUN" ? formData.productId : null,
          quantity: formData.itemType === "URUN" ? parseFloat(formData.quantity) : null,
          karat: formData.itemType === "URUN" ? parseFloat(formData.karat) : null,
          amount: formData.itemType !== "URUN" ? parseFloat(formData.amount) : null,
          currencyBuyPrice: ["DOLAR", "EURO"].includes(formData.itemType) ? parseFloat(formData.currencyBuyPrice) : null,
          currencySellPrice: ["DOLAR", "EURO"].includes(formData.itemType) ? parseFloat(formData.currencySellPrice) : null,
          goldBuyPrice: formData.itemType === "URUN" ? parseFloat(formData.goldBuyPrice) : null,
          goldSellPrice: formData.itemType === "URUN" ? parseFloat(formData.goldSellPrice) : null,
          deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : null,
          returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : null,
          notes: formData.notes || null,
        }),
      })

      if (response.ok) {
        router.push("/consignments")
        router.refresh()
      } else {
        alert("Emanet işlemi kaydedilirken bir hata oluştu")
      }
    } catch (error) {
      alert("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yeni Emanet İşlemi</h1>
        <p className="text-muted-foreground">Ürün, TL, Dolar veya Euro emanet işlemi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emanet Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Müşteri *</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.customerCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="consignmentType">İşlem Türü *</Label>
                <Select
                  value={formData.consignmentType}
                  onValueChange={(value) => setFormData({ ...formData, consignmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERME">Emanet Verme</SelectItem>
                    <SelectItem value="ALMA">Emanet Alma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemType">Emanet Türü *</Label>
                <Select
                  value={formData.itemType}
                  onValueChange={(value) => setFormData({ ...formData, itemType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URUN">Ürün</SelectItem>
                    <SelectItem value="TL">TL</SelectItem>
                    <SelectItem value="DOLAR">Dolar</SelectItem>
                    <SelectItem value="EURO">Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.itemType === "URUN" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="product">Ürün *</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={handleProductChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ürün seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.productCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">
                        Miktar ({selectedProduct.unitType === 'ADET' ? 'Adet' : 'Gram'}) *
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
                        placeholder="Örn: 0.995 veya 0.585"
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
                )}
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">Miktar ({formData.itemType}) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                {["DOLAR", "EURO"].includes(formData.itemType) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currencyBuyPrice">Döviz Alış *</Label>
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
                      <Label htmlFor="currencySellPrice">Döviz Satış *</Label>
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
                placeholder="Emanet işlemi hakkında notlar..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading || !formData.customerId}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
