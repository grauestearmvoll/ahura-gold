import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isFavorite } = body

    const customer = await prisma.customer.update({
      where: { id },
      data: { isFavorite },
    })

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}
