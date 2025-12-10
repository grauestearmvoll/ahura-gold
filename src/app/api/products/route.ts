import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Get next counter value
async function getNextCounter(name: string): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { name },
    update: { value: { increment: 1 } },
    create: { name, value: 1 },
  })
  
  return counter.value.toString().padStart(6, '0')
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, buyMilyem, sellMilyem, unitType, gramPerPiece } = body

    // Generate product code
    const productCode = `URN-${await getNextCounter('PRODUCT_CODE')}`

    const product = await prisma.product.create({
      data: {
        productCode,
        name,
        buyMilyem,
        sellMilyem,
        unitType,
        gramPerPiece: unitType === 'ADET' ? gramPerPiece : null,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
