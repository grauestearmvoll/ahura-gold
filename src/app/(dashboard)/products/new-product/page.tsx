"use client"

import { useState } from "react"
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

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    buyMilyem: "",
    sellMilyem: "",
    goldBuyPrice: "",
    goldSellPrice: "",
    unitType: "GRAM",
    gramPerPiece: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          buyMilyem: parseFloat(formData.buyMilyem),
          sellMilyem: parseFloat(formData.sellMilyem),
          goldBuyPrice: parseFloat(formData.goldBuyPrice),
          goldSellPrice: parseFloat(formData.goldSellPrice),
          unitType: formData.unitType,
          gramPerPiece: formData.unitType === "ADET" ? parseFloat(formData.gramPerPiece) : null,
        }),
      })

      if (response.ok) {
        router.push("/products")
        router.refresh()
      } else {
        alert("Ürün eklenirken bir hata oluştu")
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
        <h1 className="text-3xl font-bold">Yeni Ürün Tanımla</h1>
        <p className="text-muted-foreground">Sisteme yeni ürün ekleyin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ürün Adı *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: 22 Ayar Bilezik"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyMilyem">Alış Milyemi *</Label>
                <Input
                  id="buyMilyem"
                  type="number"
                  step="0.001"
                  required
                  value={formData.buyMilyem}
                  onChange={(e) => setFormData({ ...formData, buyMilyem: e.target.value })}
                  placeholder="Örn: 0.914"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellMilyem">Satış Milyemi *</Label>
                <Input
                  id="sellMilyem"
                  type="number"
                  step="0.001"
                  required
                  value={formData.sellMilyem}
                  onChange={(e) => setFormData({ ...formData, sellMilyem: e.target.value })}
                  placeholder="Örn: 0.937"
                />
              </div>
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
              <Label htmlFor="unitType">İşlem Türü *</Label>
              <Label htmlFor="unitType">İşlem Türü *</Label>
              <Select
                value={formData.unitType}
                onValueChange={(value) => setFormData({ ...formData, unitType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GRAM">Gram</SelectItem>
                  <SelectItem value="ADET">Adet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.unitType === "ADET" && (
              <div className="space-y-2">
                <Label htmlFor="gramPerPiece">Adet Başına Gramaj *</Label>
                <Input
                  id="gramPerPiece"
                  type="number"
                  step="0.001"
                  required
                  value={formData.gramPerPiece}
                  onChange={(e) => setFormData({ ...formData, gramPerPiece: e.target.value })}
                  placeholder="Örn: 5.25"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
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
