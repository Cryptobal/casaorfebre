"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";
import { getResend, FROM_EMAIL } from "@/lib/resend";

function extractR2Key(url: string): string | null {
  if (!url) return null;
  if (url.startsWith("r2://")) return url.replace("r2://", "");
  try {
    const u = new URL(url);
    return u.pathname.startsWith("/") ? u.pathname.slice(1) : u.pathname;
  } catch {
    return null;
  }
}

const PENDING_ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PARTIALLY_SHIPPED",
] as const;

export async function deleteBuyerAccount(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  const userId = session.user.id;

  // Artisans must use their own flow
  const artisan = await prisma.artisan.findUnique({ where: { userId } });
  if (artisan) {
    return {
      success: false,
      error:
        "Tu cuenta es de orfebre. Usa la opción de eliminación en tu portal de orfebre.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    return { success: false, error: "No se encontró usuario" };
  }

  const userEmail = user.email;
  const userName = user.name || "Usuario";

  try {
    const pendingOrders = await prisma.order.count({
      where: {
        userId,
        status: { in: [...PENDING_ORDER_STATUSES] },
      },
    });

    if (pendingOrders > 0) {
      return {
        success: false,
        error:
          "Tienes pedidos pendientes. Espera a que se completen antes de eliminar tu cuenta.",
      };
    }

    // Delete review images from R2 (best-effort)
    const reviews = await prisma.review.findMany({
      where: { userId },
      select: { images: true },
    });

    for (const review of reviews) {
      for (const imgUrl of review.images) {
        const key = extractR2Key(imgUrl);
        if (key) {
          try {
            await deleteFromR2(key);
          } catch (err) {
            console.error(`Failed to delete review image: ${key}`, err);
          }
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId } });
      await tx.favorite.deleteMany({ where: { userId } });

      const wishlists = await tx.wishlist.findMany({
        where: { userId },
        select: { id: true },
      });
      if (wishlists.length > 0) {
        await tx.wishlistItem.deleteMany({
          where: { wishlistId: { in: wishlists.map((w) => w.id) } },
        });
        await tx.wishlist.deleteMany({ where: { userId } });
      }

      await tx.review.deleteMany({ where: { userId } });
      await tx.productQuestion.deleteMany({ where: { userId } });
      await tx.dispute.deleteMany({ where: { userId } });

      // Anonymize orders (preserve for tax records)
      await tx.order.updateMany({
        where: { userId },
        data: {
          shippingName: "Comprador eliminado",
          shippingAddress: "—",
          shippingCity: "—",
          shippingRegion: "—",
          shippingPostalCode: null,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          name: "Usuario eliminado",
          email: `deleted-${userId}@eliminado.casaorfebre.cl`,
          hashedPassword: null,
          image: null,
          shippingName: null,
          shippingAddress: null,
          shippingCity: null,
          shippingRegion: null,
          shippingPostalCode: null,
          shippingPhone: null,
          referralCode: null,
        },
      });

      await tx.session.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });
    });

    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: "Confirmación de eliminación de cuenta — Casa Orfebre",
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 300; color: #1A1A18;">
              Cuenta eliminada
            </h1>
            <p style="color: #6B6B68; font-size: 16px; line-height: 1.6;">
              Hola ${userName},
            </p>
            <p style="color: #6B6B68; font-size: 16px; line-height: 1.6;">
              Confirmamos que tu cuenta en Casa Orfebre ha sido eliminada
              conforme a tu solicitud y en cumplimiento de la Ley N° 21.719 de
              Protección de Datos Personales.
            </p>
            <p style="color: #6B6B68; font-size: 16px; line-height: 1.6;">
              Todos tus datos personales han sido eliminados de nuestros sistemas.
              Los registros de compras realizadas han sido anonimizados y se
              conservarán exclusivamente por obligación tributaria.
            </p>
            <hr style="border: none; border-top: 1px solid #E5E5E3; margin: 30px 0;" />
            <p style="color: #9B9B98; font-size: 12px;">
              Este es un correo automático de Casa Orfebre.
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error(
        "[buyer-deletion] Failed to send confirmation email:",
        emailErr
      );
    }

    return { success: true };
  } catch (err) {
    console.error("[buyer-deletion] Fatal error:", err);
    return {
      success: false,
      error:
        "Error al procesar la eliminación. Contacta a contacto@casaorfebre.cl",
    };
  }
}
