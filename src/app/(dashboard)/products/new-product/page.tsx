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
    karat: "",
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
          karat: parseFloat(formData.karat),
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

            <div className="space-y-2">
              <Label htmlFor="karat">Ayar (Milyem) *</Label>
              <Input
                id="karat"
                type="number"
                step="0.001"
                required
                value={formData.karat}
                onChange={(e) => setFormData({ ...formData, karat: e.target.value })}
                placeholder="Örn: 0.916"
              />
            </div>

            <div className="space-y-2">
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
