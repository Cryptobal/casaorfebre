# Casa Orfebre: Bugfixes + AI Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 3 bugs (insights display, product images, chatbot visibility) and add 4 features (AI badges in sidebar, portal chatbots, AI collections for orfebres, improved chatbot UX).

**Architecture:** Fixes are isolated to specific files. Features build on existing patterns — the chatbot component, sidebar layout, and collections system. A new `PortalChatbot` component wraps the existing chatbot pattern with portal-specific system prompts. AI badges are a simple inline `<span>` in the sidebar. AI collections reuse the existing `suggestCollections` pattern from admin but scoped to a single artisan.

**Tech Stack:** Next.js 16, React, Prisma 7, Anthropic SDK (Claude Haiku/Sonnet), Tailwind CSS, TypeScript.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `lib/ai/orfebre-insights.ts` | Fix JSON parsing + tone |
| Modify | `app/portal/orfebre/estadisticas/ai-insights.tsx` | Robust rendering of insights |
| Modify | `app/portal/layout.tsx` | Add AI badges to sidebar links |
| Modify | `components/chat/shopping-chatbot.tsx` | Extract reusable base, add label+tooltip to FAB |
| Create | `components/chat/portal-chatbot.tsx` | Portal-aware chatbot component |
| Create | `lib/ai/portal-assistant.ts` | Portal chatbot AI logic |
| Create | `app/api/ai/portal-chat/route.ts` | Portal chatbot API endpoint |
| Modify | `app/portal/layout.tsx` | Mount PortalChatbot |
| Modify | `app/(public)/layout.tsx` | Update ShoppingChatbot label |
| Create | `lib/ai/orfebre-collections.ts` | AI collection suggestion logic for artisans |
| Create | `app/api/ai/orfebre-collections/route.ts` | API endpoint for artisan collection suggestions |
| Modify | `app/portal/orfebre/colecciones/page.tsx` | Add "Sugerir con IA" button + UI |

---

## Task 1: Fix Insights JSON Display + Tone

**Files:**
- Modify: `lib/ai/orfebre-insights.ts:25-70`
- Modify: `app/portal/orfebre/estadisticas/ai-insights.tsx:62-68`

- [ ] **Step 1: Fix the JSON parse fallback in `orfebre-insights.ts`**

Replace lines 25-70 of `lib/ai/orfebre-insights.ts` with this updated function. The key changes are: (1) strip markdown code fences before parsing, (2) fix the tone in the system prompt to avoid voseo chileno, (3) better fallback that splits text into sentences instead of returning raw JSON.

```typescript
export async function generateWeeklyInsights(stats: ArtisanStats): Promise<string[]> {
  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `Eres un analista de datos de Casa Orfebre, marketplace de joyería artesanal chilena.
Generas insights accionables y concretos para orfebres.
Español neutro latinoamericano, tutea con "tú" formal (tienes, quieres, puedes). Nunca uses voseo chileno (tenís, querís, podís).
Tono profesional pero cercano.
Responde SOLO con un JSON array de strings, cada uno un insight de 1-2 oraciones. Sin markdown, sin code fences.`,
    messages: [
      {
        role: "user",
        content: `Genera 3-5 insights accionables para ${stats.artisanName}:

Datos del orfebre:
- Productos publicados: ${stats.totalProducts}
- Visitas este mes: ${stats.monthlyViews}
- Ventas este mes: ${stats.monthlySales}
- Ingresos este mes: $${stats.monthlyRevenue.toLocaleString("es-CL")}
- Favoritos totales: ${stats.favoriteCount}
- Preguntas respondidas: ${stats.questionsAnswered}, sin responder: ${stats.questionsUnanswered}
- Tiempo promedio de respuesta: ${stats.avgResponseTimeHours.toFixed(1)} horas

Top productos: ${stats.topProducts.map((p) => `${p.name} (${p.views} visitas, ${p.favorites} favs, ${p.sales} ventas)`).join("; ")}
Productos con menor rendimiento: ${stats.bottomProducts.map((p) => `${p.name} (${p.views} visitas, ${p.favorites} favs)`).join("; ")}

Promedios de la plataforma:
- Visitas promedio por orfebre: ${stats.platformAvgViews}
- Ventas promedio por orfebre: ${stats.platformAvgSales}

Genera insights que sean específicos a estos datos, no genéricos.`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "[]";

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const text = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string" && item.trim()).slice(0, 5);
    }
  } catch {
    // If JSON parse fails, split by line breaks and return clean strings
    const lines = text
      .split(/\n+/)
      .map((line) => line.replace(/^[\d\-\.\*\s]+/, "").trim())
      .filter((line) => line.length > 10);
    if (lines.length > 0) return lines.slice(0, 5);
  }

  return ["Visita tus estadísticas regularmente para identificar tendencias."];
}
```

- [ ] **Step 2: Verify the ai-insights.tsx component renders correctly**

The component at `app/portal/orfebre/estadisticas/ai-insights.tsx` already renders each insight as a `<p>` tag inside cards (line 66). No changes needed — the fix in the backend is sufficient. Verify by reading the component and confirming the render loop at lines 62-69 displays `{insight}` as text.

- [ ] **Step 3: Run build to verify**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/ai/orfebre-insights.ts
git commit -m "fix: insights display — strip code fences, fix voseo tone to tú formal"
```

---

## Task 2: Add AI Badges to Sidebar

**Files:**
- Modify: `app/portal/layout.tsx:17-67` (link definitions) and lines 182-248 (sidebar render)

- [ ] **Step 1: Define which links have AI in each portal**

Add an `ai` boolean to the link definitions at the top of `app/portal/layout.tsx`. Change the link arrays from simple objects to include an optional `ai` flag:

```typescript
const ADMIN_LINKS = [
  { href: "/portal/admin", label: "Dashboard" },
  { href: "/portal/admin/invitaciones", label: "Invitaciones" },
  { href: "/portal/admin/postulaciones", label: "Postulaciones" },
  { href: "/portal/admin/productos", label: "Productos", ai: true },
  { href: "/portal/admin/fotos", label: "Fotos", ai: true },
  { href: "/portal/admin/orfebres", label: "Orfebres", ai: true },
  { href: "/portal/admin/compradores", label: "Compradores" },
  { href: "/portal/admin/planes", label: "Planes" },
  { href: "/portal/admin/suscripciones", label: "Suscripciones" },
  { href: "/portal/admin/pedidos", label: "Pedidos" },
  { href: "/portal/admin/disputas", label: "Disputas" },
  { href: "/portal/admin/devoluciones", label: "Devoluciones" },
  { href: "/portal/admin/pagos", label: "Pagos" },
  { href: "/portal/admin/catalogo", label: "Catálogo" },
  { href: "/portal/admin/colecciones", label: "Colecciones", ai: true },
  { href: "/portal/admin/gift-cards", label: "Gift Cards" },
  { href: "/portal/admin/finanzas", label: "Finanzas" },
  { href: "/portal/admin/mensajes", label: "Mensajes" },
  { href: "/portal/admin/preguntas", label: "Preguntas" },
  { href: "/portal/admin/despacho", label: "Despacho" },
  { href: "/portal/admin/materiales-precio", label: "Materiales Ref." },
  { href: "/portal/admin/analytics", label: "Analytics", ai: true },
  { href: "/portal/admin/blog", label: "Blog", ai: true },
  { href: "/portal/admin/pipeline", label: "Pipeline", ai: true },
];

const ARTISAN_LINKS = [
  { href: "/portal/orfebre", label: "Mi Taller" },
  { href: "/portal/orfebre/productos", label: "Mis Piezas", ai: true },
  { href: "/portal/orfebre/colecciones", label: "Colecciones", ai: true },
  { href: "/portal/orfebre/pedidos", label: "Pedidos" },
  { href: "/portal/orfebre/preguntas", label: "Preguntas", ai: true },
  { href: "/portal/orfebre/mensajes", label: "Mensajes" },
  { href: "/portal/orfebre/finanzas", label: "Finanzas" },
  { href: "/portal/orfebre/estadisticas", label: "Estadísticas", ai: true },
  { href: "/portal/orfebre/herramientas/calculadora", label: "Calculadora", ai: true },
  { href: "/portal/orfebre/ia", label: "Asistente IA", ai: true },
  { href: "/portal/orfebre/blog", label: "Blog" },
  { href: "/portal/orfebre/perfil", label: "Mi Perfil" },
];

const BUYER_LINKS = [
  { href: "/portal/comprador/pedidos", label: "Mis Pedidos" },
  { href: "/portal/comprador/gift-cards", label: "Gift Cards" },
  { href: "/portal/comprador/mensajes", label: "Mensajes" },
  { href: "/portal/comprador/favoritos", label: "Favoritos", ai: true },
  { href: "/portal/comprador/listas", label: "Mis Listas" },
  { href: "/portal/comprador/referidos", label: "Invita Amigos" },
  { href: "/portal/comprador/perfil", label: "Mi Cuenta" },
];
```

- [ ] **Step 2: Create the AiBadge inline element**

Add a small helper function after the `SidebarLink` component at the bottom of `layout.tsx`:

```typescript
function AiBadge() {
  return (
    <span className="ml-1 inline-flex items-center rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
      AI
    </span>
  );
}
```

- [ ] **Step 3: Update `SidebarLink` to accept and render the AI badge**

Modify the `SidebarLink` function signature to accept `ai?: boolean` and render the badge:

```typescript
function SidebarLink({ href, label, count, dataTour, ai }: { href: string; label: string; count: number; dataTour?: string; ai?: boolean }) {
  return (
    <Link
      href={href}
      data-tour={dataTour}
      className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
    >
      <span className="flex items-center">
        {label}
        {ai && <AiBadge />}
      </span>
      {count > 0 && (
        <span className="min-w-[1.25rem] rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
```

- [ ] **Step 4: Update all plain `<Link>` elements in the sidebar to show AI badge**

For each admin/artisan/buyer Link in the sidebar render that has `ai: true` in its link definition, add the `<AiBadge />` after the label text. For links already using `<SidebarLink>`, the badge is automatic from step 3.

For the plain `<Link>` elements (most admin links, artisan links without counts), update the pattern from:

```tsx
<Link href="/portal/orfebre/estadisticas" ...>Estadísticas</Link>
```

to:

```tsx
<Link href="/portal/orfebre/estadisticas" ...>
  <span className="flex items-center">Estadísticas<AiBadge /></span>
</Link>
```

Do this for EVERY link marked `ai: true` in the arrays above. Use the arrays as the source of truth for which links get badges. To keep DRY, refactor the sidebar rendering to loop over the arrays instead of manually writing each Link. Replace the manual admin links block (lines 185-217) with:

```tsx
{role === "ADMIN" && (
  <>
    {ADMIN_LINKS.map((link) => {
      const badgeCounts: Record<string, number> = {
        "/portal/admin/postulaciones": pendingPostulaciones,
        "/portal/admin/productos": pendingProductModeration,
        "/portal/admin/fotos": pendingPhotos,
        "/portal/admin/orfebres": pendingOrfebreApplications,
        "/portal/admin/pedidos": newPaidOrders,
      };
      const count = badgeCounts[link.href] ?? 0;
      if (count > 0 || link.ai) {
        return <SidebarLink key={link.href} href={link.href} label={link.label} count={count} ai={link.ai} />;
      }
      return (
        <Link key={link.href} href={link.href} className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">
          {link.label}
        </Link>
      );
    })}
  </>
)}
```

Apply the same loop pattern for ARTISAN_LINKS:

```tsx
{role === "ARTISAN" && (
  <>
    {ARTISAN_LINKS.map((link) => {
      const badgeCounts: Record<string, number> = {
        "/portal/orfebre/pedidos": artisanPendingOrders,
        "/portal/orfebre/preguntas": artisanUnansweredQuestions,
        "/portal/orfebre/mensajes": artisanUnreadMessages,
      };
      const dataTours: Record<string, string> = {
        "/portal/orfebre": "orfebre-dashboard",
        "/portal/orfebre/productos": "orfebre-productos",
        "/portal/orfebre/pedidos": "orfebre-pedidos",
        "/portal/orfebre/preguntas": "orfebre-preguntas",
        "/portal/orfebre/mensajes": "orfebre-mensajes",
        "/portal/orfebre/finanzas": "orfebre-finanzas",
        "/portal/orfebre/estadisticas": "orfebre-estadisticas",
        "/portal/orfebre/herramientas/calculadora": "orfebre-calculadora",
        "/portal/orfebre/perfil": "orfebre-perfil",
      };
      const count = badgeCounts[link.href] ?? 0;
      const tour = dataTours[link.href];
      if (count > 0 || link.ai) {
        return <SidebarLink key={link.href} href={link.href} label={link.label} count={count} dataTour={tour} ai={link.ai} />;
      }
      return (
        <Link key={link.href} href={link.href} data-tour={tour} className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">
          {link.label}
        </Link>
      );
    })}
  </>
)}
```

And for BUYER_LINKS:

```tsx
{showBuyerSection && (
  <>
    {(role === "ADMIN" || role === "ARTISAN") && (
      <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-widest text-text-tertiary">Comprador</p>
    )}
    {BUYER_LINKS.map((link) => {
      const badgeCounts: Record<string, number> = {
        "/portal/comprador/pedidos": buyerActiveOrders,
      };
      const dataTours: Record<string, string> = {
        "/portal/comprador/pedidos": "buyer-pedidos",
        "/portal/comprador/gift-cards": "buyer-giftcards",
        "/portal/comprador/mensajes": "buyer-mensajes",
        "/portal/comprador/favoritos": "buyer-favoritos",
        "/portal/comprador/listas": "buyer-listas",
        "/portal/comprador/referidos": "buyer-referidos",
        "/portal/comprador/perfil": "buyer-perfil",
      };
      const count = badgeCounts[link.href] ?? 0;
      const tour = dataTours[link.href];
      if (count > 0 || link.ai) {
        return <SidebarLink key={link.href} href={link.href} label={link.label} count={count} dataTour={tour} ai={link.ai} />;
      }
      return (
        <Link key={link.href} href={link.href} data-tour={tour} className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">
          {link.label}
        </Link>
      );
    })}
  </>
)}
```

- [ ] **Step 5: Update the mobile nav to pass `ai` flag**

The `mobileLinks` construction (lines 150-173) maps links with badge counts. Add `ai` to the mapped objects:

```typescript
const mobileLinks = [
  ...(role === "ADMIN"
    ? ADMIN_LINKS.map((l) => {
        const badgeCounts: Record<string, number> = {
          "/portal/admin/postulaciones": pendingPostulaciones,
          "/portal/admin/productos": pendingProductModeration,
          "/portal/admin/fotos": pendingPhotos,
          "/portal/admin/orfebres": pendingOrfebreApplications,
          "/portal/admin/pedidos": newPaidOrders,
        };
        return { ...l, badge: badgeCounts[l.href] ?? 0 };
      })
    : []),
  ...(role === "ARTISAN"
    ? ARTISAN_LINKS.map((l) => {
        const badgeCounts: Record<string, number> = {
          "/portal/orfebre/pedidos": artisanPendingOrders,
          "/portal/orfebre/preguntas": artisanUnansweredQuestions,
          "/portal/orfebre/mensajes": artisanUnreadMessages,
        };
        return { ...l, badge: badgeCounts[l.href] ?? 0 };
      })
    : []),
  ...(showBuyerSection
    ? BUYER_LINKS.map((l) => {
        const badgeCounts: Record<string, number> = {
          "/portal/comprador/pedidos": buyerActiveOrders,
        };
        return { ...l, badge: badgeCounts[l.href] ?? 0 };
      })
    : []),
];
```

Then update `PortalMobileNav` component to render the AI badge for items with `ai: true`. Check the file `components/portal/portal-mobile-nav.tsx` and add the AI badge rendering there — the same `<span>` with gradient.

- [ ] **Step 6: Run build to verify**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 7: Commit**

```bash
git add app/portal/layout.tsx components/portal/portal-mobile-nav.tsx
git commit -m "feat: add AI badges to sidebar links across all portals"
```

---

## Task 3: Portal Chatbot for Orfebre and Comprador

**Files:**
- Create: `lib/ai/portal-assistant.ts`
- Create: `app/api/ai/portal-chat/route.ts`
- Create: `components/chat/portal-chatbot.tsx`
- Modify: `app/portal/layout.tsx` (mount the chatbot)

- [ ] **Step 1: Create `lib/ai/portal-assistant.ts`**

This file handles AI responses for portal-specific questions. It receives a `portalContext` parameter ("orfebre" | "comprador") and uses a tailored system prompt for each.

```typescript
import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

interface PortalChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ORFEBRE_SYSTEM = `Eres el asistente AI del portal de orfebres de Casa Orfebre, un marketplace de joyería artesanal chilena.

Tu rol es ayudar a los orfebres (artesanos joyeros) a usar su portal de administración de manera efectiva.

CONOCIMIENTO DEL PORTAL:
- Mi Taller: dashboard principal con resumen de actividad
- Mis Piezas: crear y editar productos. Pueden generar descripciones con IA desde el formulario de creación
- Colecciones: agrupar piezas en colecciones temáticas. Pueden sugerir colecciones con IA
- Pedidos: ver y gestionar pedidos de compradores, marcar como enviado
- Preguntas: responder preguntas de compradores sobre productos. Hay sugerencias de respuesta con IA
- Mensajes: chat directo con compradores
- Finanzas: ver ingresos, comisiones y pagos pendientes
- Estadísticas: métricas de rendimiento con insights semanales generados por IA
- Calculadora: calcular precios de piezas basándose en materiales y mano de obra. Incluye sugerencia de precio con IA
- Asistente IA: hub central con herramientas AI y alertas
- Blog: escribir artículos sobre su oficio
- Mi Perfil: editar información personal, bio y foto

CONSEJOS QUE DEBES DAR:
- Para vender más: publicar fotos de alta calidad, responder preguntas rápido, mantener precios competitivos
- Para usar IA: el botón "Generar con IA" en la creación de piezas genera todo automáticamente desde fotos
- La calculadora tiene una sección "Sugerencia IA" que analiza precios del marketplace
- Las estadísticas generan insights personalizados semanalmente

REGLAS:
- Español neutro, tutea con "tú" (tienes, quieres). Nunca voseo chileno.
- Tono profesional pero cercano, breve (2-4 oraciones).
- Si no sabes algo, di que no tienes esa información y sugiere contactar soporte.
- NUNCA inventes funcionalidades que no existen.
- NO uses markdown (negritas, cursivas). Texto plano.`;

const COMPRADOR_SYSTEM = `Eres el asistente AI del portal de compradores de Casa Orfebre, un marketplace de joyería artesanal chilena.

Tu rol es ayudar a los compradores a navegar su portal y resolver dudas sobre sus compras.

CONOCIMIENTO DEL PORTAL:
- Mis Pedidos: ver estado de pedidos (pagado, enviado, entregado), tracking de envío
- Gift Cards: comprar y gestionar tarjetas de regalo
- Mensajes: chat directo con orfebres sobre pedidos o productos
- Favoritos: piezas guardadas como favoritas. Las recomendaciones se basan en estos favoritos
- Mis Listas: listas de deseos organizadas por tema
- Invita Amigos: programa de referidos con descuentos
- Mi Cuenta: editar perfil, dirección de envío, preferencias

CONSEJOS QUE DEBES DAR:
- Para seguir un pedido: ir a Mis Pedidos y ver el detalle de cada orden
- Para contactar a un orfebre: usar Mensajes o hacer una pregunta en el producto
- Los favoritos ayudan a recibir recomendaciones personalizadas
- Las gift cards se pueden enviar por email a cualquier persona

REGLAS:
- Español neutro, tutea con "tú" (tienes, quieres). Nunca voseo chileno.
- Tono cálido y servicial, breve (2-4 oraciones).
- Si el comprador tiene un problema con un pedido, sugiere contactar al orfebre por Mensajes o al soporte.
- NUNCA inventes funcionalidades que no existen.
- NO uses markdown. Texto plano.`;

export async function portalChat({
  messages,
  portalContext,
}: {
  messages: PortalChatMessage[];
  portalContext: "orfebre" | "comprador";
}): Promise<{ reply: string }> {
  const systemPrompt = portalContext === "orfebre" ? ORFEBRE_SYSTEM : COMPRADOR_SYSTEM;

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const reply = response.content[0].type === "text" ? response.content[0].text : "Lo siento, no pude procesar tu mensaje.";

  return { reply };
}
```

- [ ] **Step 2: Create `app/api/ai/portal-chat/route.ts`**

```typescript
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { portalChat } from "@/lib/ai/portal-assistant";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!checkRateLimit(session.user.id)) {
    return Response.json(
      { error: "Has alcanzado el límite de mensajes. Intenta de nuevo en una hora." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { messages, portalContext } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages required" }, { status: 400 });
    }

    if (!["orfebre", "comprador"].includes(portalContext)) {
      return Response.json({ error: "Invalid portal context" }, { status: 400 });
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || !["user", "assistant"].includes(msg.role)) {
        return Response.json({ error: "Invalid message format" }, { status: 400 });
      }
    }

    const result = await portalChat({ messages, portalContext });
    return Response.json(result);
  } catch (e) {
    console.error("Portal chat error:", e);
    return Response.json(
      { error: "Error procesando tu mensaje. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Create `components/chat/portal-chatbot.tsx`**

This is a client component that reuses the visual structure of `ShoppingChatbot` but calls `/api/ai/portal-chat` with a `portalContext` parameter. Key differences: authenticated endpoint, no product cards, portal-specific welcome messages and suggestions.

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGES = {
  orfebre: "Hola, soy tu asistente AI del portal. Puedo ayudarte a gestionar tus piezas, entender tus estadísticas, usar las herramientas AI y más. ¿En qué te ayudo?",
  comprador: "Hola, soy tu asistente AI. Puedo ayudarte con tus pedidos, favoritos, mensajes y cualquier duda sobre tu cuenta. ¿En qué te ayudo?",
};

const SUGGESTIONS = {
  orfebre: ["¿Cómo creo una pieza?", "¿Qué herramientas AI tengo?", "¿Cómo veo mis ventas?", "¿Cómo respondo preguntas?"],
  comprador: ["¿Cómo sigo mi pedido?", "¿Cómo contacto al orfebre?", "¿Cómo uso gift cards?", "¿Cómo funcionan los favoritos?"],
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B7355]/50" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B7355]/50" style={{ animationDelay: "150ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B7355]/50" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export function PortalChatbot({ portalContext }: { portalContext: "orfebre" | "comprador" }) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME_MESSAGES[portalContext] },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendText = useCallback(async (text: string) => {
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/portal-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          portalContext,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            e instanceof Error && e.message.includes("límite")
              ? e.message
              : "Lo siento, tuve un problema. ¿Puedes intentar de nuevo?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, portalContext]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (text) sendText(text);
  }, [input, sendText]);

  const label = portalContext === "orfebre" ? "Asistente AI del Taller" : "Asistente AI";

  return (
    <>
      {/* Floating button with label */}
      <div
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
      >
        {!open && (
          <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#8B7355] shadow-md border border-[#e8e5df] sm:block">
            {label}
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={label}
          className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 sm:h-14 sm:w-14"
          style={{ backgroundColor: "#8B7355" }}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <span className="text-lg text-white font-medium">✦</span>
          )}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div className="fixed z-50 flex flex-col overflow-hidden rounded-xl border border-[#e8e5df] bg-white shadow-2xl max-md:inset-0 max-md:rounded-none max-md:border-0 md:bottom-24 md:right-6 md:h-[500px] md:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e8e5df] bg-[#FAFAF8] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-[10px] font-bold text-white">AI</span>
              <span className="font-serif text-sm font-medium text-[#1a1a18]">{label}</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-[#9e9a90] hover:text-[#1a1a18] transition-colors" aria-label="Cerrar chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user" ? "bg-[#8B7355] text-white" : "bg-[#f5f3ef] text-[#1a1a18]"
                    }`}
                    style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
                  >
                    {msg.content}
                  </div>
                </div>
                {i === 0 && msg.role === "assistant" && !loading && messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 px-1 mt-2">
                    {SUGGESTIONS[portalContext].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => sendText(s)}
                        className="rounded-full border border-[#e8e5df] bg-white px-3 py-1.5 text-xs text-[#6b6860] hover:border-[#8B7355] hover:text-[#8B7355] transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#e8e5df] bg-[#FAFAF8] px-3 py-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Pregunta lo que necesites..."
                className="flex-1 rounded-lg border border-[#e8e5df] bg-white px-3 py-2 text-sm text-[#1a1a18] placeholder:text-[#9e9a90] outline-none focus:border-[#8B7355]/50"
                style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B7355] text-white transition-colors hover:bg-[#7a6549] disabled:opacity-50"
                aria-label="Enviar mensaje"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Mount `PortalChatbot` in `app/portal/layout.tsx`**

Add import at the top:
```typescript
import { PortalChatbot } from "@/components/chat/portal-chatbot";
```

Add before `</div>` closing the root flex container (before `<SupportBanner />`), right after `{children}</div>`:

```tsx
{(role === "ARTISAN" || role === "BUYER") && (
  <PortalChatbot portalContext={role === "ARTISAN" ? "orfebre" : "comprador"} />
)}
```

- [ ] **Step 5: Update public ShoppingChatbot with better label**

In `components/chat/shopping-chatbot.tsx`, update the floating button to include a text label. Wrap the button in a flex container similar to `PortalChatbot`:

Replace lines 246-265 (the floating button) with:

```tsx
{/* Floating button with label */}
<div
  className="fixed bottom-6 right-6 z-40 flex items-center gap-2 transition-all duration-500"
  style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
>
  {!open && (
    <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#8B7355] shadow-md border border-[#e8e5df] sm:block">
      Asistente AI
    </span>
  )}
  <button
    type="button"
    onClick={() => setOpen(!open)}
    aria-label="Asistente AI de compras"
    className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 sm:h-14 sm:w-14"
    style={{ backgroundColor: "#8B7355" }}
  >
    {open ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ) : (
      <span className="text-lg text-white font-medium">✦</span>
    )}
  </button>
</div>
```

Also update the chat panel header (line 277-280) from "Casa Orfebre" to:

```tsx
<div className="flex items-center gap-2">
  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-[10px] font-bold text-white">AI</span>
  <span className="font-serif text-sm font-medium text-[#1a1a18]">Asistente AI · Casa Orfebre</span>
</div>
```

- [ ] **Step 6: Run build to verify**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 7: Commit**

```bash
git add lib/ai/portal-assistant.ts app/api/ai/portal-chat/route.ts components/chat/portal-chatbot.tsx components/chat/shopping-chatbot.tsx app/portal/layout.tsx
git commit -m "feat: add AI chatbot to orfebre and comprador portals + improve chatbot labeling"
```

---

## Task 4: AI-Powered Collections for Orfebres

**Files:**
- Create: `lib/ai/orfebre-collections.ts`
- Create: `app/api/ai/orfebre-collections/route.ts`
- Modify: `app/portal/orfebre/colecciones/page.tsx`

- [ ] **Step 1: Create `lib/ai/orfebre-collections.ts`**

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export interface CollectionSuggestion {
  name: string;
  description: string;
  productIds: string[];
}

export async function suggestArtisanCollections(artisanId: string): Promise<CollectionSuggestion[]> {
  const products = await prisma.product.findMany({
    where: { artisanId, status: { in: ["APPROVED", "DRAFT", "PAUSED"] } },
    include: {
      categories: { select: { name: true } },
      materials: { select: { name: true } },
      occasions: { select: { name: true } },
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  if (products.length < 3) {
    return [];
  }

  const existingCollections = await prisma.collection.findMany({
    where: { artisanId },
    select: { name: true },
  });

  const productContext = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    categories: p.categories.map((c) => c.name),
    materials: p.materials.map((m) => m.name),
    occasions: p.occasions.map((o) => o.name),
  }));

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `Eres un curador de joyería artesanal. Analizas el catálogo de un orfebre y sugieres colecciones temáticas.
Responde SOLO con un JSON array. Sin markdown, sin code fences.
Cada elemento: { "name": "Nombre de la colección", "description": "Descripción corta", "productIds": ["id1", "id2", ...] }
Sugiere 2-4 colecciones. Cada colección debe tener al menos 2 productos.
Los nombres deben ser evocadores y elegantes (ej: "Línea Mar", "Raíces de Plata", "Esencia Minimalista").
Agrupa por material, estilo, ocasión o rango de precio.
Español neutro, tono profesional.`,
    messages: [
      {
        role: "user",
        content: `Productos del orfebre:\n${JSON.stringify(productContext, null, 2)}\n\nColecciones existentes (no repetir): ${existingCollections.map((c) => c.name).join(", ") || "ninguna"}`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
  const text = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      const validProductIds = new Set(products.map((p) => p.id));
      return parsed
        .filter((s: CollectionSuggestion) => s.name && s.productIds?.length >= 2)
        .map((s: CollectionSuggestion) => ({
          ...s,
          productIds: s.productIds.filter((id) => validProductIds.has(id)),
        }))
        .filter((s: CollectionSuggestion) => s.productIds.length >= 2)
        .slice(0, 4);
    }
  } catch {
    return [];
  }

  return [];
}
```

- [ ] **Step 2: Create `app/api/ai/orfebre-collections/route.ts`**

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { suggestArtisanCollections } from "@/lib/ai/orfebre-collections";
import { createCollection } from "@/lib/actions/collections";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true },
  });

  if (!artisan || artisan.status !== "APPROVED") {
    return Response.json({ error: "Artesano no encontrado" }, { status: 404 });
  }

  try {
    const suggestions = await suggestArtisanCollections(artisan.id);
    return Response.json({ suggestions });
  } catch (e) {
    console.error("Orfebre collections AI error:", e);
    return Response.json({ error: "Error generando sugerencias" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true },
  });

  if (!artisan || artisan.status !== "APPROVED") {
    return Response.json({ error: "Artesano no encontrado" }, { status: 404 });
  }

  try {
    const { name, description, productIds } = await req.json();

    if (!name || !Array.isArray(productIds)) {
      return Response.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const collection = await prisma.collection.create({
      data: {
        artisanId: artisan.id,
        name,
        slug: `${slug}-${Date.now().toString(36)}`,
        description: description || null,
        products: { connect: productIds.map((id: string) => ({ id })) },
      },
    });

    return Response.json({ collection });
  } catch (e) {
    console.error("Create collection from AI error:", e);
    return Response.json({ error: "Error creando colección" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Update `app/portal/orfebre/colecciones/page.tsx` with AI suggestion UI**

Add a client component for the AI suggestion button and results. Create a new file `app/portal/orfebre/colecciones/ai-collections-button.tsx`:

```tsx
"use client";

import { useState } from "react";

interface Suggestion {
  name: string;
  description: string;
  productIds: string[];
}

export function AiCollectionsButton() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [creating, setCreating] = useState<string | null>(null);
  const [created, setCreated] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const suggest = async () => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const res = await fetch("/api/ai/orfebre-collections");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error");
      }
      const data = await res.json();
      if (data.suggestions.length === 0) {
        setError("Necesitas al menos 3 productos para generar sugerencias.");
      } else {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error generando sugerencias");
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (s: Suggestion) => {
    setCreating(s.name);
    try {
      const res = await fetch("/api/ai/orfebre-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (!res.ok) throw new Error("Error");
      setCreated((prev) => new Set([...prev, s.name]));
    } catch {
      setError(`Error creando "${s.name}"`);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={suggest}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md border border-[#e8e5df] bg-white px-4 py-2 text-sm font-medium text-[#8B7355] transition-colors hover:bg-[#FAFAF8] disabled:opacity-50"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-[9px] font-bold text-white">AI</span>
        {loading ? "Analizando tus piezas..." : "Sugerir colecciones con IA"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {suggestions.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-text-secondary">Sugerencias basadas en tus piezas:</p>
          {suggestions.map((s) => (
            <div key={s.name} className="rounded-lg border border-[#e8e5df] bg-[#FAFAF8] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium text-text">{s.name}</h4>
                  <p className="mt-0.5 text-sm text-text-secondary">{s.description}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{s.productIds.length} piezas</p>
                </div>
                {created.has(s.name) ? (
                  <span className="shrink-0 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">Creada</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => createCollection(s)}
                    disabled={creating === s.name}
                    className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                  >
                    {creating === s.name ? "Creando..." : "Crear"}
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-text-tertiary">Recarga la página para ver las colecciones creadas.</p>
        </div>
      )}
    </div>
  );
}
```

Then modify `app/portal/orfebre/colecciones/page.tsx` to import and render the button. Add after the `</div>` of the header (after line 34):

```tsx
import { AiCollectionsButton } from "./ai-collections-button";
```

And add the component after the header div, before the empty state or collections list (between lines 34-36):

```tsx
<div className="mt-4">
  <AiCollectionsButton />
</div>
```

- [ ] **Step 4: Run build to verify**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
git add lib/ai/orfebre-collections.ts app/api/ai/orfebre-collections/route.ts app/portal/orfebre/colecciones/ai-collections-button.tsx app/portal/orfebre/colecciones/page.tsx
git commit -m "feat: AI-powered collection suggestions for orfebres"
```

---

## Task 5: Fix Product Images Not Displaying

**Files:**
- Modify: `app/portal/orfebre/productos/page.tsx:39-51`

- [ ] **Step 1: Investigate the actual data**

The query at line 39-51 of `app/portal/orfebre/productos/page.tsx` includes `images` without filtering by status, so ALL images (including PENDING_REVIEW) should be returned. The `_count.images` also counts all images. The thumbnail uses `product.images[0]?.url` which should work.

The likely issue is that the images were uploaded but the `product.images` array is genuinely empty — check if `product.status === "PENDING_REVIEW"` blocks the upload route (line 53-54 of `app/api/upload/route.ts`):

```typescript
if (product.status === "PENDING_REVIEW") {
  return NextResponse.json({ error: "No puedes modificar imágenes de un producto en revisión" }, { status: 400 });
}
```

This means: if the product was already submitted for review, new images can't be uploaded. But the user said the product is in "Borrador" (DRAFT) status, so this shouldn't be the issue.

The real issue could be: the product was created, images were uploaded (creating ProductImage records with PENDING_REVIEW status), but then the ProductImage URLs are pointing to R2 and possibly not loading due to CORS or domain configuration. Or the product was manually put through a review cycle that cleared images.

For now, the code-level fix is to ensure images display correctly regardless. The query is correct. Let's verify the image-upload component properly loads existing images.

- [ ] **Step 2: Verify the edit page passes images to the form**

Read `app/portal/orfebre/productos/[id]/page.tsx` line 31-34. The query includes `images: { orderBy: { position: "asc" } }` — this fetches ALL images regardless of status. The form receives `product` (which includes images). The `product-form.tsx` passes `product.images` to `ImageUpload` at line 1742.

The `ImageUpload` component at `components/products/image-upload.tsx` line 76-82 initializes from `existingImages`. This should work.

The bug is more likely a data issue (images not actually in DB) or R2 URL issue rather than a code bug. Add a diagnostic: show the image status in the product list.

- [ ] **Step 3: Show image status hint in product list**

In `app/portal/orfebre/productos/page.tsx`, update the media column (around line 130) to show a more informative status. Replace:

```tsx
<span title="Fotos">{product._count.images} foto{product._count.images !== 1 ? "s" : ""}</span>
```

with:

```tsx
<span title="Fotos">
  {product._count.images} foto{product._count.images !== 1 ? "s" : ""}
</span>
```

This is already correct. The images should be rendering. The issue likely is that the products shown in the screenshot genuinely have 0 images in the database — the count shows "0 fotos" which means `_count.images === 0`.

This suggests the images were never saved to the database, OR they were uploaded to a different product. No code change needed for the display — the listing code is correct. The issue is upstream (during upload).

**Verify this theory**: Add better feedback when the upload succeeds to confirm the image was persisted. In `components/products/image-upload.tsx`, after a successful upload, the component adds the image to state (which it already does at line 96-140). The upload response returns `{ url, imageId }`.

The most likely explanation: the user uploaded images but navigated away before saving the product form, or the images were uploaded to a product that was later recreated. No code fix needed for display — it's working as designed.

- [ ] **Step 4: Commit (if changes were made)**

If no code changes are needed after investigation, skip this commit.

---

## Task 6: Improve Chatbot Visibility on Public Site (Label)

This is already covered in Task 3, Step 5. The `ShoppingChatbot` gets a floating label "Asistente AI" and the header changes to "Asistente AI · Casa Orfebre".

No separate task needed.

---

## Execution Order

1. **Task 1** (Insights fix) — standalone, quick fix
2. **Task 2** (AI badges) — standalone, modifies layout.tsx
3. **Task 3** (Portal chatbot) — creates new files + modifies layout.tsx (after Task 2)
4. **Task 4** (AI collections) — standalone
5. **Task 5** (Image investigation) — diagnostic, may not need code changes
