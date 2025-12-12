import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { validateCustomer, ValidationError } from "@/lib/validations"
import { getNextCounter, formatErrorResponse } from "@/lib/business-logic"
import { CODE_PREFIXES, COUNTER_NAMES, ERROR_MESSAGES } from "@/lib/constants"
import type { CreateCustomerRequest } from "@/types"

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerCode: true,
        name: true,
        tcNo: true,
        phone: true,
        balance: true,
        balanceCurrency: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            consignments: true,
            payments: true,
          }
        }
      }
    })
    return NextResponse.json({ data: customers })
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    const errorResponse = formatErrorResponse(error, ERROR_MESSAGES.DATABASE_ERROR)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body: CreateCustomerRequest = await request.json()
    
    // Validate input
    const validation = validateCustomer(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_INPUT, errors: validation.errors },
        { status: 400 }
      )
    }

    const { name, tcNo, phone, notes } = body

    // Generate customer code
    const customerCode = `${CODE_PREFIXES.CUSTOMER}-${await getNextCounter(COUNTER_NAMES.CUSTOMER_CODE)}`

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        customerCode,
        name: name.trim(),
        tcNo: tcNo?.trim() || null,
        phone: phone.trim(),
        notes: notes?.trim() || null,
      },
    })

    // Revalidate pages
    revalidatePath('/customers')
    revalidatePath('/reports/customers')

    return NextResponse.json({ data: customer }, { status: 201 })
  } catch (error) {
    console.error('Failed to create customer:', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, errors: error.errors },
        { status: 400 }
      )
    }

    const errorResponse = formatErrorResponse(error, ERROR_MESSAGES.SERVER_ERROR)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
