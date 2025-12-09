"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteTransactionButtonProps {
  transactionId: string
}

export function DeleteTransactionButton({ transactionId }: DeleteTransactionButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/products/transactions/${transactionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/products')
        router.refresh()
      } else {
        alert('İşlem silinirken bir hata oluştu')
        setLoading(false)
      }
    } catch (error) {
      alert('Bir hata oluştu')
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="destructive" 
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? 'Siliniyor...' : 'İşlemi Sil'}
    </Button>
  )
}
