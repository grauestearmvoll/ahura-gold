import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

async function getNextCounter(name: string): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { name },
    update: { value: { increment: 1 } },
    create: { name, value: 1 },
  })
  
  return counter.value.toString().padStart(6, '0')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerId,
      consignmentType,
      itemType,
      productId,
      quantity,
      karat,
      amount,
      currencyBuyPrice,
      currencySellPrice,
      goldBuyPrice,
      goldSellPrice,
      deliveryDate,
      returnDate,
      notes
    } = body

    const transactionCode = `EMN-${await getNextCounter('CONSIGNMENT_CODE')}`

    // Calculate balance change for product consignments
    let balanceChange = 0
    if (itemType === 'URUN' && productId && quantity && karat) {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })
      
      if (product) {
        let totalGrams = quantity
        if (product.unitType === 'ADET' && product.gramPerPiece) {
          totalGrams = quantity * product.gramPerPiece
        }
        balanceChange = totalGrams * karat
      }
    }

    // Update customer balance
    if (balanceChange !== 0) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          balance: {
            increment: consignmentType === 'VERME' ? balanceChange : -balanceChange
          }
        }
      })
    }

    const consignment = await prisma.consignment.create({
      data: {
        transactionCode,
        customerId,
        consignmentType,
        itemType,
        productId,
        quantity,
        karat,
        amount,
        currencyBuyPrice,
        currencySellPrice,
        goldBuyPrice,
        goldSellPrice,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        returnDate: returnDate ? new Date(returnDate) : null,
        notes,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json(consignment)
  } catch (error) {
    console.error('Consignment error:', error)
    return NextResponse.json({ error: "Failed to create consignment" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const consignments = await prisma.consignment.findMany({
      include: {
        customer: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(consignments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch consignments" }, { status: 500 })
  }
}
