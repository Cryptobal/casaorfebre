-- CreateEnum
CREATE TYPE "InvitationType" AS ENUM ('PIONEER', 'ARTISAN', 'BUYER');

-- CreateEnum
CREATE TYPE "CampaignInvitationStatus" AS ENUM ('SENT', 'OPENED', 'CLICKED', 'ACCEPTED', 'BOUNCED', 'FAILED');

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" "InvitationType" NOT NULL,
    "token" TEXT NOT NULL,
    "campaignId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "status" "CampaignInvitationStatus" NOT NULL DEFAULT 'SENT',
    "createdById" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InvitationType" NOT NULL,
    "description" TEXT,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalOpened" INTEGER NOT NULL DEFAULT 0,
    "totalClicked" INTEGER NOT NULL DEFAULT 0,
    "totalAccepted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "invitation_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_type_idx" ON "invitations"("type");

-- CreateIndex
CREATE INDEX "invitations_status_idx" ON "invitations"("status");

-- CreateIndex
CREATE INDEX "invitations_campaignId_idx" ON "invitations"("campaignId");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "invitation_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
