/*
  Warnings:

  - A unique constraint covering the columns `[postId,filename]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Image_id_filename_key";

-- CreateIndex
CREATE UNIQUE INDEX "Image_postId_filename_key" ON "Image"("postId", "filename");
