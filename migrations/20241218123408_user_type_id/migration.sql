/*
  Warnings:

  - A unique constraint covering the columns `[userTypeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_userTypeId_key" ON "User"("userTypeId");
