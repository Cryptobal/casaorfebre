/**
 * Script de diagnóstico de la API de Pinterest
 * Ejecutar: npx tsx scripts/test-pinterest-api.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const BASE_URL = "https://api.pinterest.com/v5";

async function main() {
  console.log("=== Diagnóstico Pinterest API ===\n");

  // 1. Check env vars
  const appId = process.env.PINTEREST_APP_ID;
  const appSecret = process.env.PINTEREST_APP_SECRET;
  const boardId = process.env.PINTEREST_BOARD_ID;

  console.log("1. Variables de entorno:");
  console.log(`   PINTEREST_APP_ID: ${appId ? `✅ ${appId}` : "❌ no configurado"}`);
  console.log(`   PINTEREST_APP_SECRET: ${appSecret ? "✅ configurado" : "❌ no configurado"}`);
  console.log(`   PINTEREST_BOARD_ID: ${boardId ? `✅ ${boardId}` : "❌ no configurado"}`);
  console.log(`   PINTEREST_BOARD_ANILLOS: ${process.env.PINTEREST_BOARD_ANILLOS || "❌"}`);
  console.log(`   PINTEREST_BOARD_AROS: ${process.env.PINTEREST_BOARD_AROS || "❌"}`);
  console.log(`   PINTEREST_BOARD_COLLARES: ${process.env.PINTEREST_BOARD_COLLARES || "❌"}`);
  console.log(`   PINTEREST_BOARD_PULSERAS: ${process.env.PINTEREST_BOARD_PULSERAS || "❌"}`);
  console.log(`   PINTEREST_BOARD_BLOG: ${process.env.PINTEREST_BOARD_BLOG || "❌"}`);

  // 2. Check DB tokens
  console.log("\n2. Tokens en base de datos:");
  const accessToken = await prisma.systemSetting.findUnique({
    where: { key: "PINTEREST_ACCESS_TOKEN" },
  }).catch(() => null);
  const refreshToken = await prisma.systemSetting.findUnique({
    where: { key: "PINTEREST_REFRESH_TOKEN" },
  }).catch(() => null);

  if (accessToken) {
    const age = Math.floor((Date.now() - accessToken.updatedAt.getTime()) / 86400000);
    console.log(`   Access Token: ✅ existe (actualizado hace ${age} días)`);
    console.log(`   Valor (primeros 20 chars): ${accessToken.value.slice(0, 20)}...`);
  } else {
    console.log("   Access Token: ❌ NO existe en BD");
    // Check env fallback
    const envToken = process.env.PINTEREST_ACCESS_TOKEN;
    if (envToken) {
      console.log(`   Access Token (env fallback): ✅ ${envToken.slice(0, 20)}...`);
    } else {
      console.log("   Access Token (env fallback): ❌ tampoco en env");
    }
  }

  if (refreshToken) {
    console.log(`   Refresh Token: ✅ existe`);
  } else {
    console.log("   Refresh Token: ❌ NO existe en BD");
  }

  // 3. Test API - verify token
  const token = accessToken?.value || process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) {
    console.log("\n❌ No hay token disponible. Necesitas conectar Pinterest desde el admin.");
    console.log(`\n   URL de conexión:`);
    console.log(`   https://www.pinterest.com/oauth/?client_id=${appId}&redirect_uri=${encodeURIComponent("https://casaorfebre.cl/api/auth/pinterest/callback")}&response_type=code&scope=boards:read,boards:write,pins:read,pins:write,user_accounts:read&state=casaorfebre`);
    await prisma.$disconnect();
    return;
  }

  console.log("\n3. Test API - Verificar token:");
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const userRes = await fetch(`${BASE_URL}/user_account`, { headers });
    if (userRes.ok) {
      const user = await userRes.json();
      console.log(`   ✅ Token válido`);
      console.log(`   Usuario: ${user.username || user.business_name || "N/A"}`);
      console.log(`   Tipo: ${user.account_type || "N/A"}`);
      console.log(`   Website: ${user.website_url || "N/A"}`);
    } else {
      const err = await userRes.text();
      console.log(`   ❌ Token inválido (${userRes.status}): ${err}`);

      // Try refresh
      if (refreshToken && appId && appSecret) {
        console.log("\n   Intentando refrescar token...");
        const credentials = Buffer.from(`${appId}:${appSecret}`).toString("base64");
        const refreshRes = await fetch(`${BASE_URL}/oauth/token`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken.value,
          }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          await prisma.systemSetting.upsert({
            where: { key: "PINTEREST_ACCESS_TOKEN" },
            update: { value: data.access_token },
            create: { key: "PINTEREST_ACCESS_TOKEN", value: data.access_token },
          });
          if (data.refresh_token) {
            await prisma.systemSetting.upsert({
              where: { key: "PINTEREST_REFRESH_TOKEN" },
              update: { value: data.refresh_token },
              create: { key: "PINTEREST_REFRESH_TOKEN", value: data.refresh_token },
            });
          }
          console.log("   ✅ Token refrescado exitosamente!");
          // Re-test with new token
          const newUserRes = await fetch(`${BASE_URL}/user_account`, {
            headers: { Authorization: `Bearer ${data.access_token}` },
          });
          if (newUserRes.ok) {
            const user = await newUserRes.json();
            console.log(`   Usuario: ${user.username || user.business_name}`);
          }
        } else {
          const refreshErr = await refreshRes.text();
          console.log(`   ❌ Refresh falló (${refreshRes.status}): ${refreshErr}`);
          console.log("   → Necesitas reconectar Pinterest desde el admin");
        }
      }
      await prisma.$disconnect();
      return;
    }
  } catch (e) {
    console.log(`   ❌ Error de conexión: ${e}`);
    await prisma.$disconnect();
    return;
  }

  // 4. Test boards
  console.log("\n4. Test API - Listar boards:");
  try {
    const boardsRes = await fetch(`${BASE_URL}/boards?page_size=25`, { headers });
    if (boardsRes.ok) {
      const data = await boardsRes.json();
      const boards = data.items || [];
      console.log(`   ✅ ${boards.length} boards encontrados:`);
      for (const b of boards) {
        console.log(`   - ${b.name} (id: ${b.id}) — ${b.pin_count || 0} pines`);
      }
    } else {
      const err = await boardsRes.text();
      console.log(`   ❌ Error listando boards (${boardsRes.status}): ${err}`);
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e}`);
  }

  // 5. Test write permissions by checking scopes
  console.log("\n5. Test de permisos de escritura:");
  try {
    // The /user_account/businesses endpoint or trying a dry run
    // We'll check by looking at the token info
    const scopeRes = await fetch(`${BASE_URL}/user_account`, { headers });
    if (scopeRes.ok) {
      // Pinterest v5 doesn't expose scopes directly, so we test with a board listing
      // and check if we can get write access by attempting a small operation
      console.log("   Para verificar permisos de escritura, intentaremos listar pines del board principal...");
      if (boardId) {
        const pinsRes = await fetch(`${BASE_URL}/boards/${boardId}/pins?page_size=5`, { headers });
        if (pinsRes.ok) {
          const pinsData = await pinsRes.json();
          console.log(`   ✅ Board principal accesible — ${(pinsData.items || []).length} pines recientes`);
        } else {
          console.log(`   ⚠️  No se pudo acceder al board principal: ${pinsRes.status}`);
        }
      }
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e}`);
  }

  // 6. Check products ready to publish
  console.log("\n6. Productos listos para Pinterest:");
  const totalApproved = await prisma.product.count({
    where: { status: "APPROVED", images: { some: { status: "APPROVED" } } },
  });
  const withPin = await prisma.product.count({
    where: { status: "APPROVED", pinterestPinId: { not: null } },
  });
  const withoutPin = await prisma.product.count({
    where: { status: "APPROVED", pinterestPinId: null, images: { some: { status: "APPROVED" } } },
  });
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const newLast48h = await prisma.product.count({
    where: { status: "APPROVED", pinterestPinId: null, publishedAt: { gte: cutoff }, images: { some: { status: "APPROVED" } } },
  });

  console.log(`   Total aprobados con imagen: ${totalApproved}`);
  console.log(`   Ya publicados en Pinterest: ${withPin}`);
  console.log(`   Sin publicar: ${withoutPin}`);
  console.log(`   Nuevos (últimas 48h): ${newLast48h}`);

  // 7. Rotation index
  const rotIdx = await prisma.systemSetting.findUnique({
    where: { key: "PINTEREST_ROTATION_INDEX" },
  }).catch(() => null);
  console.log(`\n7. Índice de rotación: ${rotIdx?.value || "0"} / ${totalApproved}`);

  console.log("\n=== Fin diagnóstico ===");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
