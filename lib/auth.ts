import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";

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
