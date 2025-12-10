import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { amount, isPartial, paymentMethod, bankName, accountHolder, accountHolderTcNo, eftQueryNo, notes } = body

    const payment = await prisma.payment.findUnique({
      where: { id },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Create payment detail
    await prisma.paymentDetail.create({
      data: {
        paymentId: id,
        amount,
        paymentMethod,
        bankName,
        accountHolder,
        accountHolderTcNo,
        eftQueryNo,
        notes,
      },
    })

    // Update payment
    const newPaidAmount = payment.paidAmount + amount
    const newRemainingAmount = payment.totalAmount - newPaidAmount
    const newStatus = newRemainingAmount <= 0.01 ? 'COMPLETED' : 'PARTIAL'

    await prisma.payment.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, newRemainingAmount),
        status: newStatus,
        paymentMethod: paymentMethod,
        bankName,
        accountHolder,
        accountHolderTcNo,
        eftQueryNo,
      },
    })

    revalidatePath('/payments')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
