import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { emailLayout } from "@/lib/emails/base-layout";

const ADMIN_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

// Wrap PrismaAdapter to handle email-based account linking automatically.
// When a user signs in with Google and a User with that email already exists
// (e.g. created via credentials registration or admin approval), we link the
// OAuth account to the existing User instead of throwing OAuthAccountNotLinked.
const baseAdapter = PrismaAdapter(prisma) as Adapter;

const linkingAdapter: Adapter = {
  ...baseAdapter,
  getUserByEmail: (email: string) => baseAdapter.getUserByEmail!(email),
  getUserByAccount: (providerAccount) =>
    baseAdapter.getUserByAccount!(providerAccount),
  linkAccount: async (account) => {
    // Skip if this provider+providerAccountId is already linked
    const existing = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
    });
    if (existing) return;

    await baseAdapter.linkAccount!(account);
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: linkingAdapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[AUTH] signIn callback:", {
        userId: user?.id,
        email: user?.email,
        provider: account?.provider,
      });

      // Update Google profile picture if user doesn't have one
      if (account?.provider === "google" && user?.email && profile?.picture) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (existing && !existing.image) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              image: profile.picture as string,
              emailVerified: existing.emailVerified ?? new Date(),
            },
          });
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // On initial sign-in, user object is available
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "BUYER";
        console.log("[AUTH] jwt callback - initial sign-in:", {
          id: user.id,
          email: user.email,
          role: user.role,
          provider: account?.provider,
        });
      }

      // Keep JWT role aligned with DB so portal access updates without re-login
      // (e.g. user promoted to ARTISAN after approval — proxy checks token.role)
      if (token.id && typeof token.id === "string") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true },
          });
          if (dbUser?.role) {
            token.role = dbUser.role;
          }
        } catch {
          /* ignore */
        }
      }

      // Admin auto-detection
      if (token.email && ADMIN_EMAILS.includes(token.email)) {
        if (token.role !== "ADMIN") {
          try {
            await prisma.user.update({
              where: { email: token.email },
              data: { role: "ADMIN" },
            });
            token.role = "ADMIN";
            console.log("[AUTH] Promoted to ADMIN:", token.email);
          } catch (e) {
            console.error("[AUTH] Failed to promote admin:", e);
          }
        }
      }

      // Track invitation acceptance when invited user registers
      if (user?.email) {
        try {
          const pendingInvitations = await prisma.invitation.findMany({
            where: {
              email: user.email,
              status: { in: ["SENT", "OPENED", "CLICKED"] },
            },
            include: { campaign: true },
          });

          if (pendingInvitations.length > 0) {
            // Mark all as ACCEPTED
            await prisma.invitation.updateMany({
              where: {
                email: user.email,
                status: { in: ["SENT", "OPENED", "CLICKED"] },
              },
              data: {
                status: "ACCEPTED",
                acceptedAt: new Date(),
              },
            });

            // Update totalAccepted per campaign
            const campaignIds = [
              ...new Set(
                pendingInvitations
                  .map((i) => i.campaignId)
                  .filter(Boolean) as string[],
              ),
            ];

            for (const campaignId of campaignIds) {
              await prisma.invitationCampaign.update({
                where: { id: campaignId },
                data: { totalAccepted: { increment: 1 } },
              });
            }

            console.log(
              `[AUTH] Marked ${pendingInvitations.length} invitation(s) as ACCEPTED for ${user.email}`,
            );

            // Notify admins
            const invType = pendingInvitations[0].type;
            const typeLabel: Record<string, string> = {
              PIONEER: "Pionero",
              ARTISAN: "Orfebre",
              BUYER: "Comprador",
            };

            try {
              const admins = await prisma.user.findMany({
                where: { role: "ADMIN" },
                select: { email: true },
              });

              for (const admin of admins) {
                await resend.emails.send({
                  from: FROM_EMAIL,
                  to: admin.email,
                  subject: `Nuevo ${typeLabel[invType] ?? invType} registrado desde invitación`,
                  html: emailLayout(`
                    <p style="margin:0 0 16px;">
                      Un usuario invitado acaba de registrarse en Casa Orfebre.
                    </p>
                    <p style="margin:0 0 8px;">
                      <strong>Email:</strong> ${user.email}
                    </p>
                    <p style="margin:0 0 8px;">
                      <strong>Tipo de invitación:</strong> ${typeLabel[invType] ?? invType}
                    </p>
                    <p style="margin:0 0 24px;">
                      <strong>Fecha:</strong> ${new Date().toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p style="margin:0;">
                      <a href="https://casaorfebre.cl/portal/admin/invitaciones"
                         style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">
                        Ver en el panel de invitaciones
                      </a>
                    </p>
                  `),
                });
              }
            } catch (e) {
              console.error("[AUTH] Failed to notify admins of invitation acceptance:", e);
            }
          }
        } catch (e) {
          // Never block login if this fails
          console.error("[AUTH] Failed to update invitation acceptance:", e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      console.log("[AUTH] session callback:", {
        userId: session.user?.id,
        email: session.user?.email,
        role: session.user?.role,
      });
      return session;
    },
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
});
