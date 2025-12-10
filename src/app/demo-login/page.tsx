"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DemoLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem("isLoggedIn", "true")
        router.push("/dashboard")
      } else {
        setError(data.error || "Yanlış şifre!")
      }
    } catch (error) {
      setError("Bağlantı hatası!")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 text-4xl">💰</div>
          <CardTitle className="text-2xl font-bold">Ahura Gold ERP</CardTitle>
          <CardDescription>
            Sisteme giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
            <Button 
              type="submit"
              className="w-full" 
              size="lg"
            >
              Giriş Yap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
