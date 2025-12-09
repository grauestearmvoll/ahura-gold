"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const errorMessages: Record<string, string> = {
  Configuration: "Sunucu yapılandırma hatası. Lütfen sistem yöneticisi ile iletişime geçin.",
  AccessDenied: "Bu email adresi ile giriş yapmaya yetkiniz yok.",
  Verification: "Doğrulama linki geçersiz veya süresi dolmuş. Lütfen yeni bir link isteyin.",
  Default: "Bir hata oluştu. Lütfen tekrar deneyin.",
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <CardTitle className="text-2xl font-bold">Giriş Hatası</CardTitle>
          <CardDescription>
            Giriş yapılırken bir sorun oluştu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
            {message}
          </div>

          <Link href="/login">
            <Button className="w-full">
              Giriş Sayfasına Dön
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
