/*
  Warnings:

  - You are about to drop the column `goldPrice` on the `ProductTransaction` table. All the data in the column will be lost.
  - Added the required column `goldBuyPrice` to the `ProductTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goldSellPrice` to the `ProductTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionCode" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "milyem" REAL NOT NULL,
    "goldBuyPrice" REAL NOT NULL,
    "goldSellPrice" REAL NOT NULL,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "remainingStock" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductTransaction" ("createdAt", "discountAmount", "id", "milyem", "notes", "productId", "quantity", "remainingStock", "totalAmount", "transactionCode", "transactionType", "updatedAt") SELECT "createdAt", "discountAmount", "id", "milyem", "notes", "productId", "quantity", "remainingStock", "totalAmount", "transactionCode", "transactionType", "updatedAt" FROM "ProductTransaction";
DROP TABLE "ProductTransaction";
ALTER TABLE "new_ProductTransaction" RENAME TO "ProductTransaction";
CREATE UNIQUE INDEX "ProductTransaction_transactionCode_key" ON "ProductTransaction"("transactionCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
