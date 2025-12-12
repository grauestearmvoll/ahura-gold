import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { validateProduct, ValidationError } from "@/lib/validations"
import { getNextCounter, formatErrorResponse } from "@/lib/business-logic"
import { CODE_PREFIXES, COUNTER_NAMES, ERROR_MESSAGES } from "@/lib/constants"
import type { CreateProductRequest } from "@/types"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: products })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    const errorResponse = formatErrorResponse(error, ERROR_MESSAGES.DATABASE_ERROR)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body: CreateProductRequest = await request.json()
    
    // Validate input
    const validation = validateProduct(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_INPUT, errors: validation.errors },
        { status: 400 }
      )
    }

    const { name, buyMilyem, sellMilyem, unitType, gramPerPiece } = body

    // Generate product code
    const productCode = `${CODE_PREFIXES.PRODUCT}-${await getNextCounter(COUNTER_NAMES.PRODUCT_CODE)}`

    // Create product
    const product = await prisma.product.create({
      data: {
        productCode,
        name: name.trim(),
        buyMilyem,
        sellMilyem,
        unitType,
        gramPerPiece: unitType === 'ADET' ? gramPerPiece : null,
      },
    })

    // Revalidate pages
    revalidatePath('/products')
    revalidatePath('/products/new-transaction')

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    
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
