-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "buyMilyem" REAL NOT NULL,
    "sellMilyem" REAL NOT NULL,
    "goldBuyPrice" REAL,
    "goldSellPrice" REAL,
    "unitType" TEXT NOT NULL,
    "gramPerPiece" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("buyMilyem", "createdAt", "goldBuyPrice", "goldSellPrice", "gramPerPiece", "id", "name", "productCode", "sellMilyem", "unitType", "updatedAt") SELECT "buyMilyem", "createdAt", "goldBuyPrice", "goldSellPrice", "gramPerPiece", "id", "name", "productCode", "sellMilyem", "unitType", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_productCode_key" ON "Product"("productCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
