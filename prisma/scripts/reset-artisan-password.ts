/**
 * Resets an artisan's password to the default ("orfebre123").
 *
 * Usage:
 *   npx tsx prisma/scripts/reset-artisan-password.ts <email>
 *
 * Example:
 *   npx tsx prisma/scripts/reset-artisan-password.ts kathia.nala@gmail.com
 *
 * If no email is passed, defaults to kathia.nala@gmail.com.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_ARTISAN_PASSWORD } from "../../lib/auth/constants";

const prisma = new PrismaClient();

async function main() {
  const rawEmail = process.argv[2] ?? "kathia.nala@gmail.com";
  const email = rawEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`No existe un usuario con email "${email}".`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ARTISAN_PASSWORD, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { hashedPassword },
  });

  console.log(
    `Contraseña reseteada a "${DEFAULT_ARTISAN_PASSWORD}" para ${email} (id=${user.id}).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
