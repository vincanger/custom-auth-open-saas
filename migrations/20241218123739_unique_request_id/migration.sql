/*
  Warnings:

  - A unique constraint covering the columns `[oauthUniqueRequestId]` on the table `UserType` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserType" ADD COLUMN     "oauthUniqueRequestId" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserType_oauthUniqueRequestId_key" ON "UserType"("oauthUniqueRequestId");
