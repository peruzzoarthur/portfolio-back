/*
  Warnings:

  - You are about to drop the column `articleId` on the `Image` table. All the data in the column will be lost.
  - Added the required column `postId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Tag" AS ENUM ('AWS', 'GIS', 'IAC', 'NEST', 'POSTGRES', 'PRISMA', 'PYTHON', 'REACT', 'TERRAFORM', 'TEST', 'TYPEORM');

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_articleId_fkey";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "articleId",
ADD COLUMN     "postId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "tags" "Tag"[];

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
