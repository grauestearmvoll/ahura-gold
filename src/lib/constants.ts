// Application constants

export const TRANSACTION_TYPES = {
  ALIS: 'ALIS',
  SATIS: 'SATIS',
} as const

export const PAYMENT_TYPES = {
  ODEME: 'ODEME',
  TAHSILAT: 'TAHSILAT',
} as const

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  COMPLETED: 'COMPLETED',
} as const

export const PAYMENT_METHODS = {
  NAKIT: 'NAKIT',
  BANKA: 'BANKA',
  KREDI_KARTI: 'KREDI_KARTI',
} as const

export const UNIT_TYPES = {
  GRAM: 'GRAM',
  ADET: 'ADET',
} as const

export const CURRENCY_TYPES = {
  TL: 'TL',
  DOLAR: 'DOLAR',
  EURO: 'EURO',
} as const

export const CONSIGNMENT_TYPES = {
  VERME: 'VERME',
  ALMA: 'ALMA',
} as const

export const ITEM_TYPES = {
  URUN: 'URUN',
  TL: 'TL',
  DOLAR: 'DOLAR',
  EURO: 'EURO',
} as const

export const CONSIGNMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  RETURNED: 'RETURNED',
} as const

// Labels
export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  ALIS: 'Alış',
  SATIS: 'Satış',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  PARTIAL: 'Kısmi',
  COMPLETED: 'Tamamlandı',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  NAKIT: 'Nakit',
  BANKA: 'Banka',
  KREDI_KARTI: 'Kredi Kartı',
}

export const UNIT_TYPE_LABELS: Record<string, string> = {
  GRAM: 'Gram',
  ADET: 'Adet',
}

export const CONSIGNMENT_TYPE_LABELS: Record<string, string> = {
  VERME: 'Emanet Verme',
  ALMA: 'Emanet Alma',
}

// Validation constants
export const VALIDATION_LIMITS = {
  PRODUCT_NAME_MIN: 2,
  PRODUCT_NAME_MAX: 100,
  CUSTOMER_NAME_MIN: 2,
  CUSTOMER_NAME_MAX: 100,
  MILYEM_MIN: 0.001,
  MILYEM_MAX: 1,
  QUANTITY_MIN: 0.001,
  PRICE_MIN: 0,
  TC_NO_LENGTH: 11,
  PHONE_MIN: 10,
  PHONE_MAX: 11,
}

// Counter names
export const COUNTER_NAMES = {
  PRODUCT_CODE: 'PRODUCT_CODE',
  CUSTOMER_CODE: 'CUSTOMER_CODE',
  TRANSACTION_ALIS: 'TRANSACTION_ALIS',
  TRANSACTION_SATIS: 'TRANSACTION_SATIS',
  CONSIGNMENT: 'CONSIGNMENT',
}

// Code prefixes
export const CODE_PREFIXES = {
  PRODUCT: 'URN',
  CUSTOMER: 'MST',
  TRANSACTION_ALIS: 'AL',
  TRANSACTION_SATIS: 'ST',
  CONSIGNMENT: 'EMN',
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
}

// API Error messages
export const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Ürün bulunamadı',
  CUSTOMER_NOT_FOUND: 'Müşteri bulunamadı',
  TRANSACTION_NOT_FOUND: 'İşlem bulunamadı',
  PAYMENT_NOT_FOUND: 'Ödeme kaydı bulunamadı',
  INVALID_INPUT: 'Geçersiz giriş verileri',
  INSUFFICIENT_STOCK: 'Yetersiz stok',
  DATABASE_ERROR: 'Veritabanı hatası',
  UNAUTHORIZED: 'Yetkisiz erişim',
  SERVER_ERROR: 'Sunucu hatası',
}

// Success messages
export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Ürün başarıyla oluşturuldu',
  PRODUCT_UPDATED: 'Ürün başarıyla güncellendi',
  PRODUCT_DELETED: 'Ürün başarıyla silindi',
  TRANSACTION_CREATED: 'İşlem başarıyla kaydedildi',
  TRANSACTION_UPDATED: 'İşlem başarıyla güncellendi',
  TRANSACTION_DELETED: 'İşlem başarıyla silindi',
  CUSTOMER_CREATED: 'Müşteri başarıyla oluşturuldu',
  CUSTOMER_UPDATED: 'Müşteri başarıyla güncellendi',
  CUSTOMER_DELETED: 'Müşteri başarıyla silindi',
  PAYMENT_COMPLETED: 'Ödeme başarıyla tamamlandı',
}
