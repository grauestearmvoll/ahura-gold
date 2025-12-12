import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { validateProductTransaction, ValidationError } from "@/lib/validations"
import { 
  calculateTotalGrams, 
  calculateTransactionAmount,
  calculateProductStock,
  hasSufficientStock,
  getNextCounter,
  executeInTransaction,
  formatErrorResponse
} from "@/lib/business-logic"
import { TRANSACTION_TYPES, CODE_PREFIXES, ERROR_MESSAGES } from "@/lib/constants"
import type { CreateTransactionRequest } from "@/types"

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body: CreateTransactionRequest = await request.json()
    
    // Validate input
    const validation = validateProductTransaction(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_INPUT, errors: validation.errors },
        { status: 400 }
      )
    }

    const { 
      transactionType, 
      productId, 
      quantity, 
      goldBuyPrice, 
      goldSellPrice, 
      discountAmount = 0, 
      notes 
    } = body

    // Execute all operations in a transaction for atomicity
    const result = await executeInTransaction(async (tx) => {
      // Get product details
      const product = await tx.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND)
      }

      // For sales, check stock availability
      if (transactionType === TRANSACTION_TYPES.SATIS) {
        const hasStock = await hasSufficientStock(productId, quantity)
        if (!hasStock) {
          throw new Error(ERROR_MESSAGES.INSUFFICIENT_STOCK)
        }
      }

      // Calculate total grams
      const totalGrams = calculateTotalGrams(
        quantity,
        product.unitType,
        product.gramPerPiece
      )

      // Get milyem based on transaction type
      const milyem = transactionType === TRANSACTION_TYPES.ALIS 
        ? product.buyMilyem 
        : product.sellMilyem
      
      // Get gold price based on transaction type
      const goldPrice = transactionType === TRANSACTION_TYPES.ALIS 
        ? goldBuyPrice 
        : goldSellPrice
      
      // Calculate total amount
      const totalAmountTL = calculateTransactionAmount(
        totalGrams,
        milyem,
        goldPrice,
        transactionType,
        discountAmount
      )

      // Calculate new stock
      const currentStock = await calculateProductStock(productId)
      const newStock = transactionType === TRANSACTION_TYPES.ALIS
        ? currentStock + quantity
        : currentStock - quantity

      // Prevent negative stock
      if (newStock < 0) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_STOCK)
      }

      // Generate transaction code
      const codePrefix = transactionType === TRANSACTION_TYPES.ALIS 
        ? CODE_PREFIXES.TRANSACTION_ALIS 
        : CODE_PREFIXES.TRANSACTION_SATIS
      const counterName = `TRANSACTION_${transactionType}`
      const transactionCode = `${codePrefix}-${await getNextCounter(counterName)}`

      // Create transaction
      const transaction = await tx.productTransaction.create({
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
          notes: notes || null,
        },
      })

      // Create pending payment
      await tx.payment.create({
        data: {
          transactionCode: transaction.transactionCode,
          productTransactionId: transaction.id,
          paymentType: transactionType === TRANSACTION_TYPES.ALIS ? 'ODEME' : 'TAHSILAT',
          totalAmount: totalAmountTL,
          remainingAmount: totalAmountTL,
          status: 'PENDING',
        },
      })

      return transaction
    })

    // Revalidate pages
    revalidatePath('/products')
    revalidatePath('/dashboard')
    revalidatePath('/reports/sales')
    revalidatePath('/reports/stock')
    revalidatePath('/reports/financial')

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Transaction error:', error)
    
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
