"use server";

import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";
import { getResend, FROM_EMAIL } from "@/lib/resend";

/**
 * Extracts the R2 key from a full URL.
 * URLs are like: https://assets.casaorfebre.cl/products/xxx/uuid.jpg
 * or r2://products/xxx/uuid.jpg
 */
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

/**
 * Deletes an orfebre's account and all associated data.
 * Conforms to Ley 21.719 requirements:
 * - Eliminates all personal data, photos, and profile content
 * - Anonymizes financial records (required by tax law for 6 years)
 * - Revokes all sessions
 * - Sends confirmation email
 */
export async function deleteOrebreAccount(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  const userId = session.user.id;

  const artisan = await prisma.artisan.findUnique({
    where: { userId },
    include: {
      products: {
        include: {
          images: true,
          certificate: true,
        },
      },
    },
  });

  if (!artisan) {
    return { success: false, error: "No se encontró cuenta de orfebre" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    return { success: false, error: "No se encontró usuario" };
  }

  const userEmail = user.email;
  const userName = user.name || "Orfebre";

  try {
    // ──────────────────────────────────────────────
    // Collect all R2 keys to delete
    // ──────────────────────────────────────────────
    const r2KeysToDelete: string[] = [];

    for (const product of artisan.products) {
      for (const image of product.images) {
        const key = extractR2Key(image.url);
        if (key) r2KeysToDelete.push(key);
        if (image.originalUrl) {
          const origKey = extractR2Key(image.originalUrl);
          if (origKey) r2KeysToDelete.push(origKey);
        }
      }
    }

    if (artisan.profileImage) {
      const key = extractR2Key(artisan.profileImage);
      if (key) r2KeysToDelete.push(key);
    }

    for (const wsImg of artisan.workshopImages) {
      const key = extractR2Key(wsImg);
      if (key) r2KeysToDelete.push(key);
    }

    // Best-effort R2 deletion
    const r2Errors: string[] = [];
    for (const key of r2KeysToDelete) {
      try {
        await deleteFromR2(key);
      } catch (err) {
        r2Errors.push(key);
        console.error(`Failed to delete R2 key: ${key}`, err);
      }
    }

    if (r2Errors.length > 0) {
      console.warn(
        `[account-deletion] ${r2Errors.length} R2 assets failed to delete for artisan ${artisan.id}. Keys: ${r2Errors.join(", ")}`
      );
    }

    // ──────────────────────────────────────────────
    // Database operations in transaction
    // ──────────────────────────────────────────────
    await prisma.$transaction(async (tx) => {
      const artisanId = artisan.id;
      const productIds = artisan.products.map((p) => p.id);

      // Anonymize the Artisan record (preserve FK integrity with OrderItems)
      await tx.artisan.update({
        where: { id: artisanId },
        data: {
          displayName: "Orfebre eliminado",
          slug: `eliminado-${artisanId}`,
          bio: "Cuenta eliminada por solicitud del titular.",
          story: null,
          location: "—",
          region: null,
          specialty: "—",
          materials: [],
          profileImage: null,
          workshopImages: [],
          videoUrl: null,
          socialLinks: Prisma.JsonNull,
          rut: null,
          phone: null,
          mpAccessToken: null,
          mpUserId: null,
          mpOnboarded: false,
          status: "SUSPENDED",
          rejectedReason: "CUENTA_ELIMINADA_LEY_21719",
        },
      });

      // 4c. Delete all product images from DB
      await tx.productImage.deleteMany({
        where: { productId: { in: productIds } },
      });

      // 4d. Delete certificates
      await tx.certificate.deleteMany({
        where: { productId: { in: productIds } },
      });

      // 4e. Delete cart items referencing these products
      await tx.cartItem.deleteMany({
        where: { productId: { in: productIds } },
      });

      // 4f. Delete favorites referencing these products
      await tx.favorite.deleteMany({
        where: { productId: { in: productIds } },
      });

      // 4g. Delete wishlist items referencing these products
      await tx.wishlistItem.deleteMany({
        where: { productId: { in: productIds } },
      });

      // 4h. Delete product questions
      await tx.productQuestion.deleteMany({
        where: { artisanId },
      });

      // 4i. Anonymize reviews (keep buyer's review, remove artisan response)
      await tx.review.updateMany({
        where: { artisanId },
        data: {
          response: null,
          respondedAt: null,
        },
      });

      // 4j. Handle products — split by whether they have order items
      // Products WITH historical orders: anonymize (can't delete due to OrderItem.productId FK)
      // Products WITHOUT orders: delete entirely
      const productsWithOrders = await tx.orderItem.findMany({
        where: { productId: { in: productIds } },
        select: { productId: true },
      });
      const productIdsWithOrders = [
        ...new Set(productsWithOrders.map((oi) => oi.productId)),
      ];
      const productIdsWithoutOrders = productIds.filter(
        (id) => !productIdsWithOrders.includes(id)
      );

      // Anonymize products that have order history (one by one for unique slug)
      for (const productId of productIdsWithOrders) {
        await tx.product.update({
          where: { id: productId },
          data: {
            name: "Producto eliminado",
            description: "Este producto fue eliminado por solicitud del orfebre.",
            story: null,
            slug: `deleted-${productId}`,
            status: "SOLD_OUT",
            dimensions: null,
            weight: null,
            technique: null,
            stock: 0,
          },
        });
      }

      // Delete products without order history
      if (productIdsWithoutOrders.length > 0) {
        // First delete reviews on these products (Review.productId FK)
        await tx.review.deleteMany({
          where: { productId: { in: productIdsWithoutOrders } },
        });
        await tx.product.deleteMany({
          where: { id: { in: productIdsWithoutOrders } },
        });
      }

      await tx.membershipSubscription.deleteMany({
        where: { artisanId },
      });

      // Anonymize the User record
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

      // Revoke all access
      await tx.session.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });
    });

    // ──────────────────────────────────────────────
    // Send confirmation email to original address
    // ──────────────────────────────────────────────
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
              Confirmamos que tu cuenta de orfebre en Casa Orfebre ha sido eliminada
              conforme a tu solicitud y en cumplimiento de la Ley N° 21.719 de
              Protección de Datos Personales.
            </p>
            <p style="color: #6B6B68; font-size: 16px; line-height: 1.6;">
              Se han eliminado todos tus datos personales, fotografías de productos
              y contenido de perfil de nuestra plataforma y sistemas de
              almacenamiento. Los registros financieros de transacciones completadas
              han sido anonimizados y se conservarán exclusivamente por obligación
              tributaria legal durante 6 años.
            </p>
            <p style="color: #6B6B68; font-size: 16px; line-height: 1.6;">
              Los datos eliminados de copias de seguridad serán purgados en un
              plazo máximo de 90 días.
            </p>
            <p style="color: #6B6B68; font-size: 16px; line-height: 1.6;">
              Si tienes alguna consulta, puedes contactarnos en
              <a href="mailto:contacto@casaorfebre.cl" style="color: #8B7355;">contacto@casaorfebre.cl</a>.
            </p>
            <hr style="border: none; border-top: 1px solid #E5E5E3; margin: 30px 0;" />
            <p style="color: #9B9B98; font-size: 12px;">
              Este es un correo automático de Casa Orfebre. No es necesario responder.
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[account-deletion] Failed to send confirmation email:", emailErr);
    }

    return { success: true };
  } catch (err) {
    console.error("[account-deletion] Fatal error:", err);
    return {
      success: false,
      error: "Error al procesar la eliminación. Contacta a contacto@casaorfebre.cl",
    };
  }
}
