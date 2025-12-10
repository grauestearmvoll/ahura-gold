"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DemoLoginPage() {
  const router = useRouter()

  const handleLogin = () => {
    // Demo için session yokmuş gibi direkt dashboard'a yönlendir
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 text-4xl">💰</div>
          <CardTitle className="text-2xl font-bold">Ahura Gold ERP</CardTitle>
          <CardDescription>
            Demo Giriş (Email sistemi düzeltilecek)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleLogin}
          >
            Sisteme Giriş Yap
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Email sistemi aktif edilene kadar bu sayfayı kullanabilirsiniz
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
