// Type definitions for the application

export interface Product {
  id: string
  productCode: string
  name: string
  buyMilyem: number
  sellMilyem: number
  goldBuyPrice?: number | null
  goldSellPrice?: number | null
  unitType: 'GRAM' | 'ADET'
  gramPerPiece: number | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductTransaction {
  id: string
  transactionCode: string
  transactionType: 'ALIS' | 'SATIS'
  productId: string
  quantity: number
  milyem: number
  goldBuyPrice: number
  goldSellPrice: number
  discountAmount: number
  totalAmount: number
  remainingStock: number
  notes: string | null
  createdAt: Date
  updatedAt: Date
  product?: Product
  payment?: Payment
}

export interface Customer {
  id: string
  customerCode: string
  name: string
  tcNo: string | null
  phone: string
  balance: number
  balanceCurrency: 'TL' | 'DOLAR' | 'EURO' | null
  isFavorite: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  transactionCode: string
  productTransactionId: string | null
  customerId: string | null
  paymentType: 'ODEME' | 'TAHSILAT'
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  status: 'PENDING' | 'PARTIAL' | 'COMPLETED'
  paymentMethod: 'NAKIT' | 'BANKA' | 'KREDI_KARTI' | null
  bankName: string | null
  accountHolder: string | null
  accountHolderTcNo: string | null
  eftQueryNo: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  productTransaction?: ProductTransaction
  customer?: Customer
  paymentDetails?: PaymentDetail[]
}

export interface PaymentDetail {
  id: string
  paymentId: string
  amount: number
  paymentMethod: 'NAKIT' | 'BANKA' | 'KREDI_KARTI'
  bankName: string | null
  accountHolder: string | null
  accountHolderTcNo: string | null
  eftQueryNo: string | null
  notes: string | null
  createdAt: Date
}

export interface Consignment {
  id: string
  transactionCode: string
  customerId: string
  consignmentType: 'VERME' | 'ALMA'
  itemType: 'URUN' | 'TL' | 'DOLAR' | 'EURO'
  productId: string | null
  quantity: number | null
  karat: number | null
  amount: number | null
  currencyBuyPrice: number | null
  currencySellPrice: number | null
  goldBuyPrice: number | null
  goldSellPrice: number | null
  deliveryDate: Date | null
  returnDate: Date | null
  notes: string | null
  status: 'ACTIVE' | 'RETURNED'
  createdAt: Date
  updatedAt: Date
  customer?: Customer
  product?: Product
}

// API Request/Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  errors?: Record<string, string>
}

export interface CreateProductRequest {
  name: string
  buyMilyem: number
  sellMilyem: number
  unitType: 'GRAM' | 'ADET'
  gramPerPiece?: number | null
}

export interface CreateTransactionRequest {
  transactionType: 'ALIS' | 'SATIS'
  productId: string
  quantity: number
  goldBuyPrice: number
  goldSellPrice: number
  discountAmount?: number
  notes?: string | null
}

export interface CreateCustomerRequest {
  name: string
  tcNo?: string | null
  phone: string
  notes?: string | null
}

export interface CreatePaymentRequest {
  amount: number
  paymentMethod: 'NAKIT' | 'BANKA' | 'KREDI_KARTI'
  bankName?: string | null
  accountHolder?: string | null
  accountHolderTcNo?: string | null
  eftQueryNo?: string | null
  notes?: string | null
}

// Dashboard statistics types
export interface DashboardStats {
  dailyPurchaseTotal: number
  dailyPurchaseCount: number
  dailySalesTotal: number
  dailySalesCount: number
  realizedProfit: number
  realizedProfitRate: number
  unrealizedProfit: number
  unrealizedProfitRate: number
}

// Report types
export interface SalesReport {
  totalSales: number
  totalPurchases: number
  profit: number
  profitRate: number
  salesTransactions: ProductTransaction[]
  purchaseTransactions: ProductTransaction[]
}

export interface StockReport {
  totalProductTypes: number
  totalStockValue: number
  lowStockProducts: number
  outOfStockProducts: number
  products: (Product & { totalStock: number; transactionCount: number })[]
}

export interface FinancialReport {
  totalRevenue: number
  totalExpense: number
  netProfit: number
  pendingPayments: number
  completedPayments: number
}
