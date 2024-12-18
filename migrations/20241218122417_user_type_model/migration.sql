/*
  Warnings:

  - You are about to drop the column `userType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "userType",
ADD COLUMN     "userTypeId" TEXT;

-- CreateTable
CREATE TABLE "UserType" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'fan',

    CONSTRAINT "UserType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserType_email_key" ON "UserType"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "UserType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
