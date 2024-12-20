/*
  Warnings:

  - A unique constraint covering the columns `[id,filename]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Image_filename_key";

-- CreateIndex
CREATE UNIQUE INDEX "Image_id_filename_key" ON "Image"("id", "filename");
