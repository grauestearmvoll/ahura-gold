import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transactionType, productId, quantity, goldBuyPrice, goldSellPrice, discountAmount = 0, notes } = body

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Calculate total grams
    let totalGrams = quantity
    if (product.unitType === 'ADET' && product.gramPerPiece) {
      totalGrams = quantity * product.gramPerPiece
    }

    // Get milyem based on transaction type
    const milyem = transactionType === 'ALIS' ? product.buyMilyem : product.sellMilyem
    
    // Get gold price based on transaction type
    const goldPrice = transactionType === 'ALIS' ? goldBuyPrice : goldSellPrice
    
    // Calculate total amount in TL
    // ALIS: Gramaj x Milyem x Has Fiyatı + Artış/İkram
    // SATIS: Gramaj x Milyem x Has Fiyatı - İskonto
    let totalAmountTL = totalGrams * milyem * goldPrice
    
    if (transactionType === 'ALIS') {
      totalAmountTL = totalAmountTL + discountAmount // Artış/İkram eklenir
    } else {
      totalAmountTL = totalAmountTL - discountAmount // İskonto düşülür
    }

    // Get current stock
    const stockTransactions = await prisma.productTransaction.findMany({
      where: { productId },
    })

    let currentStock = 0
    for (const t of stockTransactions) {
      if (t.transactionType === 'ALIS') {
        currentStock += t.quantity
      } else {
        currentStock -= t.quantity
      }
    }

    // Calculate new stock
    const newStock = transactionType === 'ALIS'
      ? currentStock + quantity
      : currentStock - quantity

    // Generate transaction code
    const transactionCode = `${transactionType === 'ALIS' ? 'AL' : 'ST'}-${await getNextCounter(`TRANSACTION_${transactionType}`)}`

    // Create transaction
    const transaction = await prisma.productTransaction.create({
      data: {
        transactionCode,
        transactionType,
        productId,
        quantity,
        milyem,
        goldBuyPrice,
        goldSellPrice,
        discountAmount,
        totalAmount: totalAmountTL,
        remainingStock: newStock,
        notes,
      },
    })

    // Create pending payment
    await prisma.payment.create({
      data: {
        transactionCode: transaction.transactionCode,
        productTransactionId: transaction.id,
        paymentType: transactionType === 'ALIS' ? 'ODEME' : 'TAHSILAT',
        totalAmount: totalAmountTL,
        remainingAmount: totalAmountTL,
        status: 'PENDING',
      },
    })

    // Revalidate the products page to show new transaction immediately
    revalidatePath('/products')
    revalidatePath('/dashboard')
    revalidatePath('/reports/sales')
    revalidatePath('/reports/stock')
    revalidatePath('/reports/financial')

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
