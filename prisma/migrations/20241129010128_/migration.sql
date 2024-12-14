/*
  Warnings:

  - You are about to drop the column `author` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "author";

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticleToAuthor" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleToAuthor_AB_unique" ON "_ArticleToAuthor"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleToAuthor_B_index" ON "_ArticleToAuthor"("B");

-- AddForeignKey
ALTER TABLE "_ArticleToAuthor" ADD CONSTRAINT "_ArticleToAuthor_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToAuthor" ADD CONSTRAINT "_ArticleToAuthor_B_fkey" FOREIGN KEY ("B") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
