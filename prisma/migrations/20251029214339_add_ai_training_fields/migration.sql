-- AlterTable
ALTER TABLE "RFPSource" ADD COLUMN     "embedding" JSONB;

-- AlterTable
ALTER TABLE "TenderMatch" ADD COLUMN     "feedback" JSONB;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "embedding" JSONB;
