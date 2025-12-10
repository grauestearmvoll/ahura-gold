import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    // Environment variable'dan şifreyi al
    const correctPassword = process.env.ADMIN_PASSWORD || "admin123"
    
    if (password === correctPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: "Yanlış şifre!" },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
