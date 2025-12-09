import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        consignments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            product: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if customer has active consignments
    const activeConsignments = await prisma.consignment.count({
      where: { 
        customerId: id,
        status: 'ACTIVE'
      }
    })

    if (activeConsignments > 0) {
      return NextResponse.json(
        { error: "Aktif emanet işlemleri olan müşteri silinemez" }, 
        { status: 400 }
      )
    }

    // Check if customer has pending payments
    const pendingPayments = await prisma.payment.count({
      where: { 
        customerId: id,
        status: { in: ['PENDING', 'PARTIAL'] }
      }
    })

    if (pendingPayments > 0) {
      return NextResponse.json(
        { error: "Bekleyen ödemeleri olan müşteri silinemez" }, 
        { status: 400 }
      )
    }

    // Delete all related records first
    await prisma.consignment.deleteMany({
      where: { customerId: id }
    })

    await prisma.payment.deleteMany({
      where: { customerId: id }
    })

    // Delete the customer
    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, tcNo, phone, notes } = body

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        tcNo,
        phone,
        notes,
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}
