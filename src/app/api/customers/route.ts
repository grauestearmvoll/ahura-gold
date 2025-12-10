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

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, tcNo, phone, notes } = body

    // Generate customer code
    const customerCode = `MST-${await getNextCounter('CUSTOMER_CODE')}`

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        name,
        tcNo: tcNo || null,
        phone,
        notes: notes || null,
      },
    })

    revalidatePath('/customers')
    revalidatePath('/reports/customers')

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
