/*
  Warnings:

  - You are about to drop the column `domain` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `acquisitionCost` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `authId` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `authProvider` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `industryType` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `ip` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lastActiveAt` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lifetimeValue` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `marketingConsent` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `preferredContact` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `totalBookings` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `totalSpent` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the `Analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Campaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvitationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserMembership` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referralCode]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `plan` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeCustomerId` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeSubscriptionId` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscriptionStatus` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('DATA_PROVIDER', 'CHANNEL_AFFILIATE', 'CHANNEL_WHITELABEL', 'INTEGRATION', 'GROUP_LICENSE');

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('PROPOSAL', 'LEGAL', 'FINANCIAL', 'PQQ', 'METHOD_STATEMENT', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AttributionMethod" AS ENUM ('UTM_PARAMETER', 'REFERRAL_CODE', 'SUBDOMAIN', 'API_KEY', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'DISPUTED');

-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ContactSubmission" DROP CONSTRAINT "ContactSubmission_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "InvitationToken" DROP CONSTRAINT "InvitationToken_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "InvitationToken" DROP CONSTRAINT "InvitationToken_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserMembership" DROP CONSTRAINT "UserMembership_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "UserMembership" DROP CONSTRAINT "UserMembership_userId_fkey";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "domain",
DROP COLUMN "logoUrl",
DROP COLUMN "settings",
ADD COLUMN     "apiCallsLimit" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN     "customBranding" JSONB,
ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "plan" "UserPlan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripeCustomerId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "stripeSubscriptionId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive',
ADD COLUMN     "teamMembersLimit" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "acquisitionCost",
DROP COLUMN "authId",
DROP COLUMN "authProvider",
DROP COLUMN "company",
DROP COLUMN "emailVerified",
DROP COLUMN "hashedPassword",
DROP COLUMN "image",
DROP COLUMN "industryType",
DROP COLUMN "ip",
DROP COLUMN "lastActiveAt",
DROP COLUMN "lifetimeValue",
DROP COLUMN "marketingConsent",
DROP COLUMN "notes",
DROP COLUMN "preferredContact",
DROP COLUMN "source",
DROP COLUMN "status",
DROP COLUMN "tags",
DROP COLUMN "totalBookings",
DROP COLUMN "totalSpent",
DROP COLUMN "userAgent",
ADD COLUMN     "alertFrequency" TEXT NOT NULL DEFAULT 'INSTANT',
ADD COLUMN     "apiCallsLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "apiCallsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "buyingOrgTypes" TEXT[],
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "cpvCodes" TEXT[],
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "excludeKeywords" TEXT[],
ADD COLUMN     "industries" TEXT[],
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastResetAt" TIMESTAMP(3),
ADD COLUMN     "loginCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxContractValue" DOUBLE PRECISION,
ADD COLUMN     "maxDuration" INTEGER,
ADD COLUMN     "minContractValue" DOUBLE PRECISION,
ADD COLUMN     "minDuration" INTEGER,
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "plan" "UserPlan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planInterval" TEXT NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredBy" TEXT,
ADD COLUMN     "regions" TEXT[],
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'OWNER',
ADD COLUMN     "savedSearchesLimit" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "searchesLimit" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "searchesUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slackWebhook" TEXT,
ADD COLUMN     "smsAlerts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT,
ADD COLUMN     "teamMembersLimit" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "templatesLimit" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "Analytics";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Campaign";

-- DropTable
DROP TABLE "ContactSubmission";

-- DropTable
DROP TABLE "InvitationToken";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "PasswordResetToken";

-- DropTable
DROP TABLE "UserMembership";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cpvMainCategory" TEXT NOT NULL,
    "cpvCodes" TEXT[],
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "tenderCount" INTEGER NOT NULL DEFAULT 0,
    "customerCount" INTEGER NOT NULL DEFAULT 0,
    "avgContractValue" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industries" TEXT[],
    "cpvCodes" TEXT[],
    "keywords" TEXT[],
    "excludeKeywords" TEXT[],
    "regions" TEXT[],
    "buyingOrgTypes" TEXT[],
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "maxDaysUntilDeadline" INTEGER,
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "smsAlerts" BOOLEAN NOT NULL DEFAULT false,
    "slackWebhook" TEXT,
    "lastMatched" TIMESTAMP(3),
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "lastNotified" TIMESTAMP(3),
    "newMatchesCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderMatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "matchReasons" TEXT[],
    "matchedVia" TEXT,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "savedAt" TIMESTAMP(3),
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenderMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedTender" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "notes" TEXT,
    "reminderDate" TIMESTAMP(3),
    "reminded" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedTender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "bidAmount" DOUBLE PRECISION,
    "submittedDate" TIMESTAMP(3) NOT NULL,
    "outcome" TEXT,
    "notes" TEXT,
    "teamMembers" TEXT[],
    "hoursSpent" DOUBLE PRECISION,
    "contractValue" DOUBLE PRECISION,
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "industries" TEXT[],
    "tier" "UserPlan"[],
    "description" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSizeKB" INTEGER,
    "previewImageUrl" TEXT,
    "variables" JSONB,
    "defaultContent" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadedAt" TIMESTAMP(3),
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "searchKeywords" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseTemplateId" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "format" TEXT NOT NULL DEFAULT 'MARKDOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "contactName" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "website" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "revenueShare" DOUBLE PRECISION,
    "payoutMinimum" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "apiKey" TEXT,
    "apiKeyHash" TEXT,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "attributionMethod" "AttributionMethod" NOT NULL DEFAULT 'UTM_PARAMETER',
    "logoUrl" TEXT,
    "brandColor" TEXT,
    "customDomain" TEXT,
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerAttribution" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userId" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "referralCode" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "landingPage" TEXT,
    "signupDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstPurchase" TIMESTAMP(3),
    "lifetimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerCommission" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "attributionId" TEXT,
    "userEmail" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "chargeId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerWebhook" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" TIMESTAMP(3),
    "response" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFPSource" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "cpvCodes" TEXT[],
    "cpvMainCategory" TEXT NOT NULL,
    "industries" TEXT[],
    "keywords" TEXT[],
    "contractValue" DOUBLE PRECISION,
    "estimatedValue" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "budgetMin" DOUBLE PRECISION,
    "budgetMax" DOUBLE PRECISION,
    "region" TEXT,
    "regions" TEXT[],
    "postcode" TEXT,
    "city" TEXT,
    "deliveryLocations" TEXT[],
    "publishedDate" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "contractStart" TIMESTAMP(3),
    "duration" INTEGER,
    "contractDurationMonths" INTEGER,
    "buyingOrg" TEXT,
    "buyingOrgType" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactName" TEXT,
    "minTurnover" DOUBLE PRECISION,
    "minEmployees" INTEGER,
    "insurance" TEXT,
    "accreditations" TEXT[],
    "securityClearance" TEXT,
    "documentUrls" TEXT[],
    "documentNames" TEXT[],
    "clarificationDeadline" TIMESTAMP(3),
    "sourceUrl" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "categories" TEXT[],
    "industry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "awardedTo" TEXT,
    "awardedValue" DOUBLE PRECISION,
    "awardedDate" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "applicationCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "rawData" JSONB,
    "lastScraped" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scrapedSuccessfully" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFPSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcureIQSettings" (
    "id" TEXT NOT NULL,
    "defaultCommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "minPayoutAmount" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "payoutSchedule" TEXT NOT NULL DEFAULT 'MONTHLY',
    "enablePartnerSignups" BOOLEAN NOT NULL DEFAULT true,
    "enableWebhooks" BOOLEAN NOT NULL DEFAULT true,
    "enableWhiteLabel" BOOLEAN NOT NULL DEFAULT false,
    "welcomeEmailTemplate" TEXT,
    "approvalEmailTemplate" TEXT,
    "payoutEmailTemplate" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcureIQSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerApplication" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "organizationSlug" TEXT NOT NULL,
    "organizationType" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "website" TEXT,
    "companyRegistration" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "webhookUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Industry_name_key" ON "Industry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_slug_idx" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_cpvMainCategory_idx" ON "Industry"("cpvMainCategory");

-- CreateIndex
CREATE INDEX "Industry_active_idx" ON "Industry"("active");

-- CreateIndex
CREATE INDEX "SavedSearch_userId_active_idx" ON "SavedSearch"("userId", "active");

-- CreateIndex
CREATE INDEX "SavedSearch_active_lastMatched_idx" ON "SavedSearch"("active", "lastMatched");

-- CreateIndex
CREATE INDEX "TenderMatch_userId_matchScore_idx" ON "TenderMatch"("userId", "matchScore");

-- CreateIndex
CREATE INDEX "TenderMatch_userId_viewed_idx" ON "TenderMatch"("userId", "viewed");

-- CreateIndex
CREATE INDEX "TenderMatch_tenderId_idx" ON "TenderMatch"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "TenderMatch_userId_tenderId_key" ON "TenderMatch"("userId", "tenderId");

-- CreateIndex
CREATE INDEX "SavedTender_userId_reminderDate_idx" ON "SavedTender"("userId", "reminderDate");

-- CreateIndex
CREATE UNIQUE INDEX "SavedTender_userId_tenderId_key" ON "SavedTender"("userId", "tenderId");

-- CreateIndex
CREATE INDEX "TenderApplication_userId_outcome_idx" ON "TenderApplication"("userId", "outcome");

-- CreateIndex
CREATE INDEX "TenderApplication_outcome_idx" ON "TenderApplication"("outcome");

-- CreateIndex
CREATE UNIQUE INDEX "TenderApplication_userId_tenderId_key" ON "TenderApplication"("userId", "tenderId");

-- CreateIndex
CREATE INDEX "DocumentTemplate_category_idx" ON "DocumentTemplate"("category");

-- CreateIndex
CREATE INDEX "DocumentTemplate_featured_active_idx" ON "DocumentTemplate"("featured", "active");

-- CreateIndex
CREATE INDEX "UserTemplate_userId_idx" ON "UserTemplate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_apiKey_key" ON "Partner"("apiKey");

-- CreateIndex
CREATE INDEX "Partner_status_idx" ON "Partner"("status");

-- CreateIndex
CREATE INDEX "Partner_type_idx" ON "Partner"("type");

-- CreateIndex
CREATE INDEX "Partner_slug_idx" ON "Partner"("slug");

-- CreateIndex
CREATE INDEX "PartnerAttribution_partnerId_idx" ON "PartnerAttribution"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerAttribution_userEmail_idx" ON "PartnerAttribution"("userEmail");

-- CreateIndex
CREATE INDEX "PartnerAttribution_utmSource_idx" ON "PartnerAttribution"("utmSource");

-- CreateIndex
CREATE INDEX "PartnerAttribution_referralCode_idx" ON "PartnerAttribution"("referralCode");

-- CreateIndex
CREATE INDEX "PartnerCommission_partnerId_idx" ON "PartnerCommission"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerCommission_status_idx" ON "PartnerCommission"("status");

-- CreateIndex
CREATE INDEX "PartnerCommission_periodStart_idx" ON "PartnerCommission"("periodStart");

-- CreateIndex
CREATE INDEX "PartnerCommission_userEmail_idx" ON "PartnerCommission"("userEmail");

-- CreateIndex
CREATE INDEX "PartnerWebhook_partnerId_idx" ON "PartnerWebhook"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerWebhook_event_idx" ON "PartnerWebhook"("event");

-- CreateIndex
CREATE INDEX "PartnerWebhook_delivered_idx" ON "PartnerWebhook"("delivered");

-- CreateIndex
CREATE INDEX "RFPSource_partnerId_idx" ON "RFPSource"("partnerId");

-- CreateIndex
CREATE INDEX "RFPSource_cpvMainCategory_status_deadline_idx" ON "RFPSource"("cpvMainCategory", "status", "deadline");

-- CreateIndex
CREATE INDEX "RFPSource_industries_region_idx" ON "RFPSource"("industries", "region");

-- CreateIndex
CREATE INDEX "RFPSource_estimatedValue_deadline_idx" ON "RFPSource"("estimatedValue", "deadline");

-- CreateIndex
CREATE INDEX "RFPSource_deadline_idx" ON "RFPSource"("deadline");

-- CreateIndex
CREATE INDEX "RFPSource_status_idx" ON "RFPSource"("status");

-- CreateIndex
CREATE INDEX "RFPSource_organization_idx" ON "RFPSource"("organization");

-- CreateIndex
CREATE INDEX "RFPSource_buyingOrgType_deadline_idx" ON "RFPSource"("buyingOrgType", "deadline");

-- CreateIndex
CREATE INDEX "RFPSource_region_idx" ON "RFPSource"("region");

-- CreateIndex
CREATE INDEX "RFPSource_publishedDate_idx" ON "RFPSource"("publishedDate");

-- CreateIndex
CREATE UNIQUE INDEX "RFPSource_sourceSystem_sourceId_key" ON "RFPSource"("sourceSystem", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerApplication_organizationSlug_key" ON "PartnerApplication"("organizationSlug");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerApplication_contactEmail_key" ON "PartnerApplication"("contactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeSubscriptionId_key" ON "Organization"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_stripeCustomerId_key" ON "UserProfile"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_stripeSubscriptionId_key" ON "UserProfile"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_referralCode_key" ON "UserProfile"("referralCode");

-- CreateIndex
CREATE INDEX "UserProfile_email_idx" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "UserProfile_referredBy_idx" ON "UserProfile"("referredBy");

-- CreateIndex
CREATE INDEX "UserProfile_plan_subscriptionStatus_idx" ON "UserProfile"("plan", "subscriptionStatus");

-- CreateIndex
CREATE INDEX "UserProfile_organizationId_idx" ON "UserProfile"("organizationId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderMatch" ADD CONSTRAINT "TenderMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderMatch" ADD CONSTRAINT "TenderMatch_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "RFPSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedTender" ADD CONSTRAINT "SavedTender_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedTender" ADD CONSTRAINT "SavedTender_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "RFPSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderApplication" ADD CONSTRAINT "TenderApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderApplication" ADD CONSTRAINT "TenderApplication_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "RFPSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTemplate" ADD CONSTRAINT "UserTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerAttribution" ADD CONSTRAINT "PartnerAttribution_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerWebhook" ADD CONSTRAINT "PartnerWebhook_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPSource" ADD CONSTRAINT "RFPSource_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
