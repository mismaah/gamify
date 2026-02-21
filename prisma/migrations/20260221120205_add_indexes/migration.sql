-- CreateIndex
CREATE INDEX "Rate_itemId_from_to_idx" ON "Rate"("itemId", "from", "to");

-- CreateIndex
CREATE INDEX "Use_itemId_createdAt_idx" ON "Use"("itemId", "createdAt");
