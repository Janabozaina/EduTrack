/*
  Warnings:

  - A unique constraint covering the columns `[deviceToken]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "deviceToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_deviceToken_key" ON "Student"("deviceToken");
