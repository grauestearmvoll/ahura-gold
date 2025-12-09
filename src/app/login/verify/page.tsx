import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 text-4xl">📧</div>
          <CardTitle className="text-2xl font-bold">Email Gönderildi</CardTitle>
          <CardDescription>
            Giriş bağlantısı email adresinize gönderildi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 text-sky-800 px-4 py-3 rounded text-sm">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Email kutunuzu kontrol edin</p>
                <p>
                  Size gönderilen emaildeki bağlantıya tıklayarak sisteme giriş yapabilirsiniz.
                  Eğer emaili göremiyorsanız spam klasörünü kontrol edin.
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            Bağlantı 24 saat boyunca geçerlidir
          </div>

          <Link href="/login">
            <Button variant="outline" className="w-full">
              Giriş Sayfasına Dön
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
