/*
  Warnings:

  - The primary key for the `Author` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Author` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `B` on the `_ArticleToAuthor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_ArticleToAuthor" DROP CONSTRAINT "_ArticleToAuthor_B_fkey";

-- AlterTable
ALTER TABLE "Author" DROP CONSTRAINT "Author_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Author_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_ArticleToAuthor" DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "articleId" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleToAuthor_AB_unique" ON "_ArticleToAuthor"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleToAuthor_B_index" ON "_ArticleToAuthor"("B");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToAuthor" ADD CONSTRAINT "_ArticleToAuthor_B_fkey" FOREIGN KEY ("B") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
