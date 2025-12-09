"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteButtonProps {
  id: string
  type: 'customer' | 'consignment'
  redirectPath: string
}

export function DeleteButton({ id, type, redirectPath }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const confirmMessage = type === 'customer' 
      ? 'Bu müşteriyi silmek istediğinizden emin misiniz? İlgili tüm emanet işlemleri ve ödemeler de silinecektir.'
      : 'Bu emanet işlemini silmek istediğinizden emin misiniz?'
    
    if (!confirm(confirmMessage)) return

    setLoading(true)
    try {
      const endpoint = type === 'customer' 
        ? `/api/customers/${id}` 
        : `/api/consignments/${id}`
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push(redirectPath)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Silme işlemi başarısız')
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
      {loading ? 'Siliniyor...' : 'Sil'}
    </Button>
  )
}
