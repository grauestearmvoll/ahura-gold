// Validation schemas and helper functions

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Validation failed')
    this.name = 'ValidationError'
  }
}

// Number validation
export function validateNumber(
  value: any,
  fieldName: string,
  options?: {
    min?: number
    max?: number
    required?: boolean
  }
): string | null {
  if (options?.required && (value === null || value === undefined || value === '')) {
    return `${fieldName} zorunludur`
  }

  if (value === null || value === undefined || value === '') {
    return null
  }

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return `${fieldName} geçerli bir sayı olmalıdır`
  }

  if (options?.min !== undefined && num < options.min) {
    return `${fieldName} en az ${options.min} olmalıdır`
  }

  if (options?.max !== undefined && num > options.max) {
    return `${fieldName} en fazla ${options.max} olmalıdır`
  }

  return null
}

// String validation
export function validateString(
  value: any,
  fieldName: string,
  options?: {
    minLength?: number
    maxLength?: number
    required?: boolean
    pattern?: RegExp
  }
): string | null {
  if (options?.required && !value) {
    return `${fieldName} zorunludur`
  }

  if (!value) {
    return null
  }

  const str = String(value).trim()

  if (options?.minLength && str.length < options.minLength) {
    return `${fieldName} en az ${options.minLength} karakter olmalıdır`
  }

  if (options?.maxLength && str.length > options.maxLength) {
    return `${fieldName} en fazla ${options.maxLength} karakter olmalıdır`
  }

  if (options?.pattern && !options.pattern.test(str)) {
    return `${fieldName} geçerli formatta olmalıdır`
  }

  return null
}

// TC No validation
export function validateTCNo(tcNo: string): boolean {
  if (!tcNo || tcNo.length !== 11) return false
  
  const digits = tcNo.split('').map(Number)
  if (digits.some(isNaN)) return false
  if (digits[0] === 0) return false

  const sum10 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
  if (sum10 % 10 !== digits[10]) return false

  const odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const even = digits[1] + digits[3] + digits[5] + digits[7]
  if ((odd * 7 - even) % 10 !== digits[9]) return false

  return true
}

// Phone validation (Turkish format)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+90|0)?5\d{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Product transaction validation
export function validateProductTransaction(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Transaction type
  if (!data.transactionType || !['ALIS', 'SATIS'].includes(data.transactionType)) {
    errors.transactionType = 'Geçerli bir işlem türü seçiniz (ALIS veya SATIS)'
  }

  // Product ID
  if (!data.productId) {
    errors.productId = 'Ürün seçimi zorunludur'
  }

  // Quantity
  const quantityError = validateNumber(data.quantity, 'Miktar', { min: 0.001, required: true })
  if (quantityError) errors.quantity = quantityError

  // Gold prices
  const goldBuyPriceError = validateNumber(data.goldBuyPrice, 'Has altın alış fiyatı', { min: 0, required: true })
  if (goldBuyPriceError) errors.goldBuyPrice = goldBuyPriceError

  const goldSellPriceError = validateNumber(data.goldSellPrice, 'Has altın satış fiyatı', { min: 0, required: true })
  if (goldSellPriceError) errors.goldSellPrice = goldSellPriceError

  // Discount amount
  if (data.discountAmount !== undefined) {
    const discountError = validateNumber(data.discountAmount, 'İskonto/Artış', { min: 0 })
    if (discountError) errors.discountAmount = discountError
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Product validation
export function validateProduct(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Name
  const nameError = validateString(data.name, 'Ürün adı', { minLength: 2, maxLength: 100, required: true })
  if (nameError) errors.name = nameError

  // Milyem values
  const buyMilyemError = validateNumber(data.buyMilyem, 'Alış milyemi', { min: 0.001, max: 1, required: true })
  if (buyMilyemError) errors.buyMilyem = buyMilyemError

  const sellMilyemError = validateNumber(data.sellMilyem, 'Satış milyemi', { min: 0.001, max: 1, required: true })
  if (sellMilyemError) errors.sellMilyem = sellMilyemError

  // Unit type
  if (!data.unitType || !['GRAM', 'ADET'].includes(data.unitType)) {
    errors.unitType = 'Geçerli bir birim türü seçiniz (GRAM veya ADET)'
  }

  // Gram per piece (if ADET)
  if (data.unitType === 'ADET') {
    const gramPerPieceError = validateNumber(data.gramPerPiece, 'Adet başına gramaj', { min: 0.001, required: true })
    if (gramPerPieceError) errors.gramPerPiece = gramPerPieceError
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Customer validation
export function validateCustomer(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Name
  const nameError = validateString(data.name, 'Müşteri adı', { minLength: 2, maxLength: 100, required: true })
  if (nameError) errors.name = nameError

  // Phone
  const phoneError = validateString(data.phone, 'Telefon', { required: true })
  if (phoneError) {
    errors.phone = phoneError
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Geçerli bir telefon numarası giriniz (5XXXXXXXXX)'
  }

  // TC No (optional)
  if (data.tcNo && data.tcNo.trim()) {
    if (!validateTCNo(data.tcNo)) {
      errors.tcNo = 'Geçerli bir TC Kimlik No giriniz'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Payment validation
export function validatePayment(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Amount
  const amountError = validateNumber(data.amount, 'Ödeme miktarı', { min: 0.01, required: true })
  if (amountError) errors.amount = amountError

  // Payment method
  if (!data.paymentMethod || !['NAKIT', 'BANKA', 'KREDI_KARTI'].includes(data.paymentMethod)) {
    errors.paymentMethod = 'Geçerli bir ödeme yöntemi seçiniz'
  }

  // Bank details (if BANKA)
  if (data.paymentMethod === 'BANKA') {
    const bankNameError = validateString(data.bankName, 'Banka adı', { required: true })
    if (bankNameError) errors.bankName = bankNameError

    const accountHolderError = validateString(data.accountHolder, 'Hesap sahibi', { required: true })
    if (accountHolderError) errors.accountHolder = accountHolderError

    if (data.accountHolderTcNo) {
      if (!validateTCNo(data.accountHolderTcNo)) {
        errors.accountHolderTcNo = 'Geçerli bir TC Kimlik No giriniz'
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
