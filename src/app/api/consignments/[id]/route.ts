import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const consignment = await prisma.consignment.findUnique({
      where: { id },
      include: {
        customer: true,
        product: true,
      },
    })

    if (!consignment) {
      return NextResponse.json({ error: "Consignment not found" }, { status: 404 })
    }

    return NextResponse.json(consignment)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch consignment" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const consignment = await prisma.consignment.findUnique({
      where: { id },
      include: { product: true },
    })

    if (!consignment) {
      return NextResponse.json({ error: "Consignment not found" }, { status: 404 })
    }

    // Reverse balance change if it was a product consignment
    if (consignment.itemType === 'URUN' && consignment.quantity && consignment.karat && consignment.product) {
      let totalGrams = consignment.quantity
      if (consignment.product.unitType === 'ADET' && consignment.product.gramPerPiece) {
        totalGrams = consignment.quantity * consignment.product.gramPerPiece
      }
      const balanceChange = totalGrams * consignment.karat

      // Reverse the balance operation
      await prisma.customer.update({
        where: { id: consignment.customerId },
        data: {
          balance: {
            increment: consignment.consignmentType === 'VERME' ? -balanceChange : balanceChange
          }
        }
      })
    }

    // Delete the consignment
    await prisma.consignment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: "Failed to delete consignment" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      quantity,
      karat,
      amount,
      currencyBuyPrice,
      currencySellPrice,
      goldBuyPrice,
      goldSellPrice,
      deliveryDate,
      returnDate,
      notes,
    } = body

    const consignment = await prisma.consignment.findUnique({
      where: { id },
      include: { product: true },
    })

    if (!consignment) {
      return NextResponse.json({ error: "Consignment not found" }, { status: 404 })
    }

    // Calculate old and new balance changes for product consignments
    let oldBalanceChange = 0
    let newBalanceChange = 0

    if (consignment.itemType === 'URUN' && consignment.product) {
      // Old balance
      if (consignment.quantity && consignment.karat) {
        let oldTotalGrams = consignment.quantity
        if (consignment.product.unitType === 'ADET' && consignment.product.gramPerPiece) {
          oldTotalGrams = consignment.quantity * consignment.product.gramPerPiece
        }
        oldBalanceChange = oldTotalGrams * consignment.karat
      }

      // New balance
      if (quantity && karat) {
        let newTotalGrams = quantity
        if (consignment.product.unitType === 'ADET' && consignment.product.gramPerPiece) {
          newTotalGrams = quantity * consignment.product.gramPerPiece
        }
        newBalanceChange = newTotalGrams * karat
      }

      // Update customer balance with the difference
      const balanceDifference = newBalanceChange - oldBalanceChange
      if (balanceDifference !== 0) {
        await prisma.customer.update({
          where: { id: consignment.customerId },
          data: {
            balance: {
              increment: consignment.consignmentType === 'VERME' ? balanceDifference : -balanceDifference
            }
          }
        })
      }
    }

    // Update consignment
    const updatedConsignment = await prisma.consignment.update({
      where: { id },
      data: {
        quantity: quantity !== undefined ? quantity : consignment.quantity,
        karat: karat !== undefined ? karat : consignment.karat,
        amount: amount !== undefined ? amount : consignment.amount,
        currencyBuyPrice: currencyBuyPrice !== undefined ? currencyBuyPrice : consignment.currencyBuyPrice,
        currencySellPrice: currencySellPrice !== undefined ? currencySellPrice : consignment.currencySellPrice,
        goldBuyPrice: goldBuyPrice !== undefined ? goldBuyPrice : consignment.goldBuyPrice,
        goldSellPrice: goldSellPrice !== undefined ? goldSellPrice : consignment.goldSellPrice,
        deliveryDate: deliveryDate !== undefined ? (deliveryDate ? new Date(deliveryDate) : null) : consignment.deliveryDate,
        returnDate: returnDate !== undefined ? (returnDate ? new Date(returnDate) : null) : consignment.returnDate,
        notes: notes !== undefined ? notes : consignment.notes,
      },
      include: {
        customer: true,
        product: true,
      },
    })

    return NextResponse.json(updatedConsignment)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: "Failed to update consignment" }, { status: 500 })
  }
}
