"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"

interface FavoriteButtonProps {
  customerId: string
  isFavorite: boolean
}

export function FavoriteButton({ customerId, isFavorite }: FavoriteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleFavorite = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/customers/${customerId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Favori güncellenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className="text-gray-400 hover:text-yellow-500 transition-colors disabled:opacity-50"
    >
      <Star
        className={`h-5 w-5 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
      />
    </button>
  )
}
