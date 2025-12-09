"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Payment {
  id: string
  transactionCode: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  paymentType: string
  productTransaction?: {
    product: {
      name: string
    }
  }
}

export default function PaymentDialog({ payment }: { payment: Payment }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isPartial, setIsPartial] = useState(false)
  const [formData, setFormData] = useState({
    amount: payment.remainingAmount.toString(),
    paymentMethod: "NAKIT",
    bankName: "",
    accountHolder: "",
    accountHolderTcNo: "",
    eftQueryNo: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const amount = parseFloat(formData.amount)
      
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          isPartial,
          paymentMethod: formData.paymentMethod,
          bankName: formData.paymentMethod === "BANKA" ? formData.bankName : null,
          accountHolder: formData.paymentMethod === "BANKA" ? formData.accountHolder : null,
          accountHolderTcNo: formData.paymentMethod === "BANKA" ? formData.accountHolderTcNo : null,
          eftQueryNo: formData.paymentMethod === "BANKA" ? formData.eftQueryNo : null,
          notes: formData.notes || null,
        }),
      })

      if (response.ok) {
        setOpen(false)
        router.refresh()
      } else {
        alert("Ödeme eklenirken bir hata oluştu")
      }
    } catch (error) {
      alert("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Ödeme Ekle</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ödeme Ekle</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">İşlem Kodu:</span>
              <span className="font-medium">{payment.transactionCode}</span>
            </div>
            {payment.productTransaction && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ürün:</span>
                <span className="font-medium">{payment.productTransaction.product.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Toplam Tutar:</span>
              <span className="font-medium">₺{payment.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Kalan Tutar:</span>
              <span className="font-medium text-orange-600">₺{payment.remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="partial"
                checked={isPartial}
                onCheckedChange={(checked) => setIsPartial(checked as boolean)}
              />
              <Label htmlFor="partial" className="cursor-pointer">
                Kısmi ödeme
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Ödeme Tutarı (TL) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                required
                max={payment.remainingAmount}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Ödeme Yöntemi *</Label>
              <select
                id="paymentMethod"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="NAKIT">Nakit</option>
                <option value="BANKA">Banka Transferi</option>
                <option value="KREDI_KARTI">Kredi Kartı</option>
              </select>
            </div>

            {formData.paymentMethod === "BANKA" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Banka Adı</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Alıcı Adı Soyadı</Label>
                  <Input
                    id="accountHolder"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountHolderTcNo">Alıcı TC Kimlik No</Label>
                  <Input
                    id="accountHolderTcNo"
                    value={formData.accountHolderTcNo}
                    onChange={(e) => setFormData({ ...formData, accountHolderTcNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eftQueryNo">EFT Sorgu No</Label>
                  <Input
                    id="eftQueryNo"
                    value={formData.eftQueryNo}
                    onChange={(e) => setFormData({ ...formData, eftQueryNo: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Ödemeyi Kaydet"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                İptal
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
