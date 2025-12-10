import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const transaction = await prisma.productTransaction.findUnique({
      where: { id },
      include: {
        product: true,
        payment: true,
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const transaction = await prisma.productTransaction.findUnique({
      where: { id },
      include: { payment: true },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Delete associated payment and payment details if exists
    if (transaction.payment) {
      await prisma.paymentDetail.deleteMany({
        where: { paymentId: transaction.payment.id },
      })
      await prisma.payment.delete({
        where: { id: transaction.payment.id },
      })
    }

    // Delete the transaction
    await prisma.productTransaction.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { quantity, goldBuyPrice, goldSellPrice, notes } = body

    const transaction = await prisma.productTransaction.findUnique({
      where: { id },
      include: { product: true, payment: true },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Calculate new values
    const product = transaction.product
    let totalGrams = quantity
    
    if (product.unitType === "ADET" && product.gramPerPiece) {
      totalGrams = quantity * product.gramPerPiece
    }

    const totalGramsHas = totalGrams * transaction.milyem
    const priceToUse = transaction.transactionType === "ALIS" ? goldBuyPrice : goldSellPrice
    const totalAmountTL = totalGramsHas * priceToUse

    // Update stock calculation
    const previousEffect = transaction.transactionType === "ALIS" 
      ? transaction.quantity 
      : -transaction.quantity
    
    const newEffect = transaction.transactionType === "ALIS" 
      ? quantity 
      : -quantity
    
    const stockDifference = newEffect - previousEffect
    const newRemainingStock = transaction.remainingStock + stockDifference

    // Update transaction
    const updatedTransaction = await prisma.productTransaction.update({
      where: { id },
      data: {
        quantity,
        goldBuyPrice,
        goldSellPrice,
        totalAmount: totalAmountTL,
        remainingStock: newRemainingStock,
        notes,
      },
      include: {
        product: true,
        payment: true,
      },
    })

    // Update payment if exists
    if (transaction.payment) {
      const remainingAmount = transaction.payment.totalAmount - transaction.payment.paidAmount
      const newTotalAmount = totalAmountTL
      const newRemainingAmount = newTotalAmount - transaction.payment.paidAmount

      await prisma.payment.update({
        where: { id: transaction.payment.id },
        data: {
          totalAmount: newTotalAmount,
          remainingAmount: newRemainingAmount,
          status: newRemainingAmount <= 0 ? "COMPLETED" : 
                  transaction.payment.paidAmount > 0 ? "PARTIAL" : "PENDING",
        },
      })
    }

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
  }
}
