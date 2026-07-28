-- CreateEnums
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'SHOP_MANAGER', 'MEDIA_MANAGER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');
CREATE TYPE "AuthType" AS ENUM ('CREDENTIALS', 'GOOGLE');
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'FAILED', 'EXPIRED', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'CANCELED');
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'ONLINE');
CREATE TYPE "DeliveryType" AS ENUM ('INSIDE_DHAKA', 'OUTSIDE_DHAKA');
CREATE TYPE "ShipmentStatus" AS ENUM ('ORDER_CONFIRMED', 'PACKAGE_SHIPPED', 'ARRIVED_AT_LOCAL_SORT_FACILITY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "password" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "needPasswordChange" BOOLEAN NOT NULL DEFAULT true,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_providers" (
    "id" TEXT NOT NULL,
    "provider" "AuthType" NOT NULL,
    "providerId" TEXT,
    "password" TEXT,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_managers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_managers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_managers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "auth_providers_provider_providerId_key" ON "auth_providers"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_userId_key" ON "customers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "shop_managers_userId_key" ON "shop_managers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_managers_email_key" ON "shop_managers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "media_managers_userId_key" ON "media_managers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "media_managers_email_key" ON "media_managers"("email");

-- AddForeignKey
ALTER TABLE "auth_providers" ADD CONSTRAINT "auth_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_managers" ADD CONSTRAINT "shop_managers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_managers" ADD CONSTRAINT "media_managers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
