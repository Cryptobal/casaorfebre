-- Tag applications that arrive through the /para-pionero flow so the admin
-- can identify Pioneer candidates at a glance.
ALTER TABLE "artisan_applications"
  ADD COLUMN "isPioneerCandidate" BOOLEAN NOT NULL DEFAULT false;
