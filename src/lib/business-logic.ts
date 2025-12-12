// Business logic utilities

import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

/**
 * Calculate total grams based on product unit type
 */
export function calculateTotalGrams(
  quantity: number,
  unitType: string,
  gramPerPiece: number | null
): number {
  if (unitType === 'ADET' && gramPerPiece) {
    return quantity * gramPerPiece
  }
  return quantity
}

/**
 * Calculate transaction total amount
 * ALIS: (Gramaj × Milyem × Has Fiyatı) + Artış/İkram
 * SATIS: (Gramaj × Milyem × Has Fiyatı) - İskonto
 */
export function calculateTransactionAmount(
  totalGrams: number,
  milyem: number,
  goldPrice: number,
  transactionType: 'ALIS' | 'SATIS',
  discountAmount: number = 0
): number {
  const baseAmount = totalGrams * milyem * goldPrice

  if (transactionType === 'ALIS') {
    return baseAmount + discountAmount // Artış/İkram eklenir
  } else {
    return baseAmount - discountAmount // İskonto düşülür
  }
}

/**
 * Calculate current stock for a product
 * Uses aggregation for better performance
 */
export async function calculateProductStock(productId: string): Promise<number> {
  const result = await prisma.productTransaction.aggregate({
    where: { productId },
    _sum: {
      quantity: true,
    },
  })

  // Get all transactions to calculate properly (ALIS +, SATIS -)
  const transactions = await prisma.productTransaction.findMany({
    where: { productId },
    select: {
      transactionType: true,
      quantity: true,
    },
  })

  let stock = 0
  for (const t of transactions) {
    if (t.transactionType === 'ALIS') {
      stock += t.quantity
    } else {
      stock -= t.quantity
    }
  }

  return stock
}

/**
 * Check if there's sufficient stock for a sale
 */
export async function hasSufficientStock(
  productId: string,
  requestedQuantity: number
): Promise<boolean> {
  const currentStock = await calculateProductStock(productId)
  return currentStock >= requestedQuantity
}

/**
 * Get next counter value with proper locking
 * Uses atomic upsert to prevent race conditions
 */
export async function getNextCounter(name: string): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { name },
    update: { value: { increment: 1 } },
    create: { name, value: 1 },
  })

  return counter.value.toString().padStart(6, '0')
}

/**
 * Execute operations within a transaction
 * Ensures atomicity and consistency
 */
export async function executeInTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(operations)
}

/**
 * Calculate profit for a product transaction
 */
export function calculateTransactionProfit(
  buyPrice: number,
  sellPrice: number,
  quantity: number,
  milyem: number
): number {
  const buyTotal = quantity * milyem * buyPrice
  const sellTotal = quantity * milyem * sellPrice
  return sellTotal - buyTotal
}

/**
 * Calculate unrealized profit for unsold stock
 */
export interface UnrealizedProfitData {
  totalPurchaseValue: number
  totalPotentialSalesValue: number
  unrealizedProfit: number
  unrealizedProfitRate: number
}

export async function calculateUnrealizedProfit(): Promise<UnrealizedProfitData> {
  const allPurchases = await prisma.productTransaction.findMany({
    where: { transactionType: 'ALIS' },
    include: { product: true },
  })

  let totalPurchaseValue = 0
  let totalPotentialSalesValue = 0

  for (const purchase of allPurchases) {
    const product = purchase.product
    
    // Calculate how much of this purchase is still in stock
    const currentStock = await calculateProductStock(purchase.productId)
    
    if (currentStock > 0) {
      // Calculate the cost of the remaining stock from this purchase
      const remainingFromThisPurchase = Math.min(currentStock, purchase.quantity)
      const totalGrams = calculateTotalGrams(
        remainingFromThisPurchase,
        product.unitType,
        product.gramPerPiece
      )
      
      const purchaseValue = totalGrams * purchase.milyem * purchase.goldBuyPrice
      const potentialSalesValue = totalGrams * product.sellMilyem * purchase.goldSellPrice
      
      totalPurchaseValue += purchaseValue
      totalPotentialSalesValue += potentialSalesValue
    }
  }

  const unrealizedProfit = totalPotentialSalesValue - totalPurchaseValue
  const unrealizedProfitRate = totalPurchaseValue > 0 
    ? (unrealizedProfit / totalPurchaseValue) * 100 
    : 0

  return {
    totalPurchaseValue,
    totalPotentialSalesValue,
    unrealizedProfit,
    unrealizedProfitRate,
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Format error response for API
 */
export function formatErrorResponse(
  error: any,
  defaultMessage: string = 'An error occurred'
): { error: string; details?: any } {
  if (error instanceof Error) {
    return {
      error: error.message || defaultMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }

  return { error: defaultMessage }
}
