import { prisma } from "@/lib/prisma";
import { CURRENT_LEGAL_VERSIONS } from "./constants";
import type { LegalDocumentType, AcceptanceMethod } from "@prisma/client";

export async function hasAcceptedCurrentVersion(
  userId: string,
  documentType: LegalDocumentType
): Promise<boolean> {
  const version =
    CURRENT_LEGAL_VERSIONS[documentType as keyof typeof CURRENT_LEGAL_VERSIONS];
  if (!version) return false;

  const acceptance = await prisma.legalAcceptance.findFirst({
    where: { userId, documentType, documentVersion: version },
    select: { id: true },
  });

  return !!acceptance;
}

export async function recordAcceptance({
  userId,
  documentType,
  ipAddress,
  userAgent,
  method = "CHECKBOX",
}: {
  userId: string;
  documentType: LegalDocumentType;
  ipAddress?: string | null;
  userAgent?: string | null;
  method?: AcceptanceMethod;
}) {
  const version =
    CURRENT_LEGAL_VERSIONS[documentType as keyof typeof CURRENT_LEGAL_VERSIONS];

  await prisma.legalAcceptance.create({
    data: {
      userId,
      documentType,
      documentVersion: version,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      method,
    },
  });
}

export async function getAcceptanceStatus(userId: string) {
  const acceptances = await prisma.legalAcceptance.findMany({
    where: { userId },
    select: { documentType: true, documentVersion: true },
  });

  const has = (type: LegalDocumentType) =>
    acceptances.some(
      (a) =>
        a.documentType === type &&
        a.documentVersion ===
          CURRENT_LEGAL_VERSIONS[type as keyof typeof CURRENT_LEGAL_VERSIONS]
    );

  return {
    sellerAgreement: has("SELLER_AGREEMENT"),
    terms: has("TERMS_AND_CONDITIONS"),
    privacy: has("PRIVACY_POLICY"),
  };
}
