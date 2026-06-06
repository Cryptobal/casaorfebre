import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type SocialLinks = { instagram?: string | null; portfolio?: string | null; [key: string]: unknown };

function instagramFromPortfolio(portfolioUrl: string | null | undefined): string | null {
  if (!portfolioUrl?.includes("instagram.com")) return null;
  return portfolioUrl;
}

async function main() {
  const artisans = await prisma.artisan.findMany({
    where: {
      OR: [{ instagram: null }, { story: null }],
    },
    include: {
      user: { select: { email: true } },
    },
  });

  let updatedCount = 0;

  for (const artisan of artisans) {
    const application = await prisma.artisanApplication.findFirst({
      where: { email: artisan.user.email },
      orderBy: { createdAt: "desc" },
    });

    if (!application) continue;

    const existingSocial = (artisan.socialLinks as SocialLinks | null) ?? {};
    const recoveredInstagram =
      artisan.instagram ??
      application.instagram ??
      instagramFromPortfolio(application.portfolioUrl);

    const data: Prisma.ArtisanUpdateInput = {};
    const recovered: string[] = [];

    if (!artisan.instagram && recoveredInstagram) {
      data.instagram = recoveredInstagram;
      recovered.push("instagram");
    }

    if (!artisan.story && application.experience) {
      data.story = application.experience;
      recovered.push("historia");
    }

    if (!artisan.applicationId) {
      data.applicationId = application.id;
      recovered.push("applicationId");
    }

    if (application.portfolioUrl && !existingSocial.portfolio) {
      data.socialLinks = { ...existingSocial, portfolio: application.portfolioUrl };
      recovered.push("portfolio en socialLinks");
    }

    if (recovered.length === 0) continue;

    await prisma.artisan.update({
      where: { id: artisan.id },
      data,
    });

    console.log(`✓ ${artisan.displayName}: recuperado ${recovered.join(", ")}`);
    updatedCount++;
  }

  console.log(`\n${updatedCount} actualizados de ${artisans.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
