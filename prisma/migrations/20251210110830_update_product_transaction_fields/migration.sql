/*
  Warnings:

  - You are about to drop the column `buyPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `karat` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sellPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `goldBuyPrice` on the `ProductTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `goldSellPrice` on the `ProductTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `karat` on the `ProductTransaction` table. All the data in the column will be lost.
  - Added the required column `buyMilyem` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goldBuyPrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goldSellPrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellMilyem` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goldPrice` to the `ProductTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `milyem` to the `ProductTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "buyMilyem" REAL NOT NULL,
    "sellMilyem" REAL NOT NULL,
    "goldBuyPrice" REAL NOT NULL,
    "goldSellPrice" REAL NOT NULL,
    "unitType" TEXT NOT NULL,
    "gramPerPiece" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("createdAt", "gramPerPiece", "id", "name", "productCode", "unitType", "updatedAt") SELECT "createdAt", "gramPerPiece", "id", "name", "productCode", "unitType", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_productCode_key" ON "Product"("productCode");
CREATE TABLE "new_ProductTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionCode" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "milyem" REAL NOT NULL,
    "goldPrice" REAL NOT NULL,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "remainingStock" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductTransaction" ("createdAt", "discountAmount", "id", "notes", "productId", "quantity", "remainingStock", "totalAmount", "transactionCode", "transactionType", "updatedAt") SELECT "createdAt", "discountAmount", "id", "notes", "productId", "quantity", "remainingStock", "totalAmount", "transactionCode", "transactionType", "updatedAt" FROM "ProductTransaction";
DROP TABLE "ProductTransaction";
ALTER TABLE "new_ProductTransaction" RENAME TO "ProductTransaction";
CREATE UNIQUE INDEX "ProductTransaction_transactionCode_key" ON "ProductTransaction"("transactionCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
