/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Series` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Series_title_key" ON "Series"("title");
