import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1775708183211 implements MigrationInterface {
    name = 'InitialSchema1775708183211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_type" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, CONSTRAINT "UQ_8978484a9cee7a0c780cd259b88" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "productTypeId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "sub_category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "categoryId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "order" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "paymentMethod" varchar NOT NULL, "totalAmount" decimal(10,2) NOT NULL, "placedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "order_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "orderId" integer NOT NULL, "productId" integer, "productName" varchar NOT NULL, "priceAtPurchase" decimal(10,2) NOT NULL, "quantity" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text, "price" decimal(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT (0), "imagePath" varchar, "subCategoryId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "cart_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL DEFAULT (1))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "passwordHash" varchar NOT NULL, "phone" varchar, "address" text, "role" varchar NOT NULL DEFAULT ('customer'), "isLocked" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "password_reset_code" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "code" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "expiresAt" datetime NOT NULL, "used" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`CREATE TABLE "temporary_category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "productTypeId" integer NOT NULL, CONSTRAINT "FK_25f00d350a06158b67053ce61fe" FOREIGN KEY ("productTypeId") REFERENCES "product_type" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_category"("id", "name", "productTypeId") SELECT "id", "name", "productTypeId" FROM "category"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`ALTER TABLE "temporary_category" RENAME TO "category"`);
        await queryRunner.query(`CREATE TABLE "temporary_sub_category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "FK_51b8c0b349725210c4bd8b9b7a7" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_sub_category"("id", "name", "categoryId") SELECT "id", "name", "categoryId" FROM "sub_category"`);
        await queryRunner.query(`DROP TABLE "sub_category"`);
        await queryRunner.query(`ALTER TABLE "temporary_sub_category" RENAME TO "sub_category"`);
        await queryRunner.query(`CREATE TABLE "temporary_order" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "paymentMethod" varchar NOT NULL, "totalAmount" decimal(10,2) NOT NULL, "placedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order"("id", "userId", "paymentMethod", "totalAmount", "placedAt") SELECT "id", "userId", "paymentMethod", "totalAmount", "placedAt" FROM "order"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`ALTER TABLE "temporary_order" RENAME TO "order"`);
        await queryRunner.query(`CREATE TABLE "temporary_order_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "orderId" integer NOT NULL, "productId" integer, "productName" varchar NOT NULL, "priceAtPurchase" decimal(10,2) NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_904370c093ceea4369659a3c810" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order_item"("id", "orderId", "productId", "productName", "priceAtPurchase", "quantity") SELECT "id", "orderId", "productId", "productName", "priceAtPurchase", "quantity" FROM "order_item"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_item" RENAME TO "order_item"`);
        await queryRunner.query(`CREATE TABLE "temporary_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text, "price" decimal(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT (0), "imagePath" varchar, "subCategoryId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_463d24f6d4905c488bd509164e6" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_product"("id", "name", "description", "price", "stock", "imagePath", "subCategoryId", "createdAt") SELECT "id", "name", "description", "price", "stock", "imagePath", "subCategoryId", "createdAt" FROM "product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`ALTER TABLE "temporary_product" RENAME TO "product"`);
        await queryRunner.query(`CREATE TABLE "temporary_cart_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL DEFAULT (1), CONSTRAINT "FK_158f0325ccf7f68a5b395fa2f6a" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_75db0de134fe0f9fe9e4591b7bf" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_cart_item"("id", "userId", "productId", "quantity") SELECT "id", "userId", "productId", "quantity" FROM "cart_item"`);
        await queryRunner.query(`DROP TABLE "cart_item"`);
        await queryRunner.query(`ALTER TABLE "temporary_cart_item" RENAME TO "cart_item"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item" RENAME TO "temporary_cart_item"`);
        await queryRunner.query(`CREATE TABLE "cart_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL DEFAULT (1))`);
        await queryRunner.query(`INSERT INTO "cart_item"("id", "userId", "productId", "quantity") SELECT "id", "userId", "productId", "quantity" FROM "temporary_cart_item"`);
        await queryRunner.query(`DROP TABLE "temporary_cart_item"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME TO "temporary_product"`);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text, "price" decimal(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT (0), "imagePath" varchar, "subCategoryId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "product"("id", "name", "description", "price", "stock", "imagePath", "subCategoryId", "createdAt") SELECT "id", "name", "description", "price", "stock", "imagePath", "subCategoryId", "createdAt" FROM "temporary_product"`);
        await queryRunner.query(`DROP TABLE "temporary_product"`);
        await queryRunner.query(`ALTER TABLE "order_item" RENAME TO "temporary_order_item"`);
        await queryRunner.query(`CREATE TABLE "order_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "orderId" integer NOT NULL, "productId" integer, "productName" varchar NOT NULL, "priceAtPurchase" decimal(10,2) NOT NULL, "quantity" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "order_item"("id", "orderId", "productId", "productName", "priceAtPurchase", "quantity") SELECT "id", "orderId", "productId", "productName", "priceAtPurchase", "quantity" FROM "temporary_order_item"`);
        await queryRunner.query(`DROP TABLE "temporary_order_item"`);
        await queryRunner.query(`ALTER TABLE "order" RENAME TO "temporary_order"`);
        await queryRunner.query(`CREATE TABLE "order" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "paymentMethod" varchar NOT NULL, "totalAmount" decimal(10,2) NOT NULL, "placedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "order"("id", "userId", "paymentMethod", "totalAmount", "placedAt") SELECT "id", "userId", "paymentMethod", "totalAmount", "placedAt" FROM "temporary_order"`);
        await queryRunner.query(`DROP TABLE "temporary_order"`);
        await queryRunner.query(`ALTER TABLE "sub_category" RENAME TO "temporary_sub_category"`);
        await queryRunner.query(`CREATE TABLE "sub_category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "categoryId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "sub_category"("id", "name", "categoryId") SELECT "id", "name", "categoryId" FROM "temporary_sub_category"`);
        await queryRunner.query(`DROP TABLE "temporary_sub_category"`);
        await queryRunner.query(`ALTER TABLE "category" RENAME TO "temporary_category"`);
        await queryRunner.query(`CREATE TABLE "category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "productTypeId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "category"("id", "name", "productTypeId") SELECT "id", "name", "productTypeId" FROM "temporary_category"`);
        await queryRunner.query(`DROP TABLE "temporary_category"`);
        await queryRunner.query(`DROP TABLE "password_reset_code"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "cart_item"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "sub_category"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "product_type"`);
    }

}
