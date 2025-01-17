/*
  Warnings:

  - You are about to drop the column `thumnail` on the `Map` table. All the data in the column will be lost.
  - Added the required column `thumbnail` to the `Map` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Map" DROP COLUMN "thumnail",
ADD COLUMN     "thumbnail" TEXT NOT NULL;
