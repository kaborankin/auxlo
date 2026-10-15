-- AlterTable
ALTER TABLE "Pot" ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "inviteExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Pot_inviteToken_key" ON "Pot"("inviteToken");
