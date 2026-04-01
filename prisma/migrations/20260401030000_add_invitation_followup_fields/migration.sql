-- Add follow-up tracking fields to invitations
ALTER TABLE "invitations" ADD COLUMN "followUpCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "invitations" ADD COLUMN "lastFollowUpAt" TIMESTAMP(3);
ALTER TABLE "invitations" ADD COLUMN "nextFollowUpAt" TIMESTAMP(3);
