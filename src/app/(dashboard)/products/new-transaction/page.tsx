"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Product {
  id: string
  productCode: string
  name: string
  buyMilyem: number
  sellMilyem: number
  goldBuyPrice?: number | null
  goldSellPrice?: number | null
  unitType: string
  gramPerPiece: number | null
}

export default function NewTransactionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    transactionType: "ALIS",
    productId: "",
    quantity: "",
    goldBuyPrice: "",
    goldSellPrice: "",
    discountAmount: "0",
    notes: "",
  })

  useEffect(() => {
    // Fetch products with cache busting
    fetch("/api/products", {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
      .then((res) => res.json())
      .then((data) => setProducts(data))
  }, [])

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      setSelectedProduct(product)
      
      setFormData({
        ...formData,
        productId,
        // Gold prices will be entered manually for each transaction
        goldBuyPrice: product.goldBuyPrice?.toString() || "",
        goldSellPrice: product.goldSellPrice?.toString() || "",
      })
    }
  }

  // İşlem türü değiştiğinde güncelle
  const handleTransactionTypeChange = (type: string) => {
    setFormData({
      ...formData,
      transactionType: type,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/products/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionType: formData.transactionType,
          productId: formData.productId,
          quantity: parseFloat(formData.quantity),
          goldBuyPrice: parseFloat(formData.goldBuyPrice),
          goldSellPrice: parseFloat(formData.goldSellPrice),
          discountAmount: parseFloat(formData.discountAmount),
          notes: formData.notes || null,
        }),
      })

      if (response.ok) {
        router.push("/products")
        router.refresh()
      } else {
        alert("İşlem kaydedilirken bir hata oluştu")
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
        <h1 className="text-3xl font-bold">Yeni Ürün İşlemi</h1>
        <p className="text-muted-foreground">Alış veya satış işlemi kaydedin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İşlem Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionType">İşlem Türü *</Label>
              <Select
                value={formData.transactionType}
                onValueChange={handleTransactionTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALIS">Alış</SelectItem>
                  <SelectItem value="SATIS">Satış</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Ürün Kodu</p>
                    <p className="font-medium">{selectedProduct.productCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">İşlem Türü</p>
                    <p className="font-medium">
                      {selectedProduct.unitType === 'ADET' ? 'Adet' : 'Gram'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {formData.transactionType === 'ALIS' ? 'Alış Milyemi' : 'Satış Milyemi'}
                    </p>
                    <p className="font-medium">
                      {formData.transactionType === 'ALIS' 
                        ? selectedProduct.buyMilyem 
                        : selectedProduct.sellMilyem}
                    </p>
                  </div>
                  {selectedProduct.unitType === 'ADET' && (
                    <div>
                      <p className="text-sm text-muted-foreground">Adet Başına Gramaj</p>
                      <p className="font-medium">{selectedProduct.gramPerPiece} gr</p>
                    </div>
                  )}
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goldBuyPrice">Has Altın Alış Fiyatı *</Label>
                    <Input
                      id="goldBuyPrice"
                      type="number"
                      step="0.01"
                      required
                      value={formData.goldBuyPrice}
                      onChange={(e) => setFormData({ ...formData, goldBuyPrice: e.target.value })}
                      placeholder="Örn: 5890.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goldSellPrice">Has Altın Satış Fiyatı *</Label>
                    <Input
                      id="goldSellPrice"
                      type="number"
                      step="0.01"
                      required
                      value={formData.goldSellPrice}
                      onChange={(e) => setFormData({ ...formData, goldSellPrice: e.target.value })}
                      placeholder="Örn: 5805.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountAmount">
                    {formData.transactionType === 'ALIS' ? 'Artış/İkram (TL)' : 'İskonto Miktarı (TL)'}
                  </Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    step="0.01"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.transactionType === 'ALIS' 
                      ? 'Artış/ikram tutarı toplama eklenir' 
                      : 'İskonto tutarı toplamdan düşülür'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notlar</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="İsteğe bağlı notlar..."
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading || !selectedProduct}>
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
