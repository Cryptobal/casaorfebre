# BLOG_PIPELINE — Automatización de blog Casa Orfebre (rutina remota)

> **Ejecutor:** rutina remota de Claude Code conectada al repo `Cryptobal/casaorfebre`.
> **Cadencia objetivo:** 3 posts/semana (mar-jue-sáb).
> **Cierre:** SIEMPRE Pull Request. NUNCA merge directo a `main`.
> **Gobernanza de contenido:** `docs/seo/estrategia-keywords.md` (léela antes de elegir tema).
> **Este documento describe la arquitectura REAL detectada, no una plantilla genérica.**

---

## 0. Arquitectura detectada (Fase A — verificada en el código, 2026-07-02)

| Aspecto | Realidad en el repo |
|---|---|
| **Framework** | Next.js **16.2.1** (App Router), React 19, TypeScript 5. Gestor: **npm**. |
| **Hosting** | **Vercel**. `vercel.json` con 28 crons. Deploy en push. |
| **Motor del blog** | **Base de datos, NO archivos.** Los posts viven en la tabla `blog_posts` (modelo `BlogPost` en `prisma/schema.prisma`). Los `.md` en `prisma/blog-content/` y los TSX en `content/blog/` están **DEPRECADOS** (ver `content/blog/DEPRECATED.md`: "migrado a DB"). Las rutas públicas leen de la tabla, no de archivos. |
| **Generación** | **YA EXISTE.** `app/api/cron/blog-auto-generate/route.ts` + `lib/ai/blog-generator.ts`. Publica 1 post/día directo a `PUBLISHED`, con autor admin, usando Anthropic (`claude-sonnet-4-20250514`). Rota keywords desde un pool dinámico derivado de la DB (materiales × categorías × ocasiones × ciudades). |
| **Cron actual** | `blog-auto-generate` corre `0 3 * * *` (diario 03:00 UTC) vía Vercel. |
| **Imágenes** | `coverImage String?` — **opcional y nullable**. El generador actual NO asigna imagen (queda `null`). Assets se sirven desde Cloudflare R2 (`assets.casaorfebre.cl`, vía `@aws-sdk/client-s3`). Existe registro de fotos reales de producto en la tabla `Product` (relación a imágenes). |
| **Indexación** | Tras publicar, el cron escribe `LAST_BLOG_URL_GENERATED` en `system_setting`; el cron `gsc-indexing` (`0 2 * * *`) la envía a Google. |
| **Semrush** | **NO integrado en código.** El pool de keywords es heurístico (combinatorio desde la DB), sin datos de volumen reales. **Este es el principal valor que agrega la rutina remota.** |
| **Slack** | **NO existe** ningún webhook en el código. La notificación es responsabilidad de la rutina remota (variable `SLACK_WEBHOOK_URL`). |
| **Auth de crons** | `Authorization: Bearer $CRON_SECRET`. Patrón fail-closed (si `CRON_SECRET` no está, 401). |
| **Enums** | `BlogCategory`: GUIAS, TENDENCIAS, ORFEBRES, CUIDADOS, MATERIALES, CULTURA. `BlogStatus`: DRAFT, PUBLISHED, ARCHIVED. |

### Consecuencia arquitectónica (decisión de diseño)

La plantilla original de este setup asumía un blog **basado en archivos** (Markdown con frontmatter,
rama `content/blog-<slug>`, PR con el archivo). **Eso no aplica a Casa Orfebre**, cuyo blog vive en
la DB. Forzar el patrón de archivos crearía un sistema paralelo muerto (los `.md` ya están
deprecados justamente por eso).

**Por tanto, la rutina remota NO escribe posts como archivos.** En su lugar:

- **Modo A (recomendado, cierra en PR como exige el setup):** la rutina genera el post *como
  cambio de código versionable* — un archivo semilla en `prisma/blog-seeds/pendientes/<slug>.md`
  con frontmatter completo (todos los campos de `BlogPost`) + un item en `blog-topic-queue.md`
  marcado como "generado, pendiente de publicar". El PR contiene ese seed + la investigación
  Semrush que lo justifica. Tras el merge, un paso de seed (o el propio `blog-auto-generate`
  leyendo la carpeta `pendientes/`) lo inserta en `blog_posts`. **Esto respeta "cierre en PR,
  nunca publicar directo" y deja trazabilidad + revisión humana antes de que el post sea público.**

- **Por qué NO Modo B (escribir directo a la DB desde la rutina):** publicaría sin revisión humana
  y sin PR, violando el guardrail central del setup ("SIEMPRE PR, NUNCA merge/publish directo").
  El cron `blog-auto-generate` existente ya hace publicación directa diaria; la rutina remota es el
  canal *revisado y con investigación Semrush*, complementario, no un segundo publicador ciego.

> **Nota para Carlos (decisión de convivencia):** hoy `blog-auto-generate` publica 1/día directo sin
> Semrush. Si la rutina remota (3/semana, revisada, con Semrush) va a ser el canal principal, conviene
> **bajar la frecuencia del cron diario** (p. ej. pausarlo o pasarlo a semanal) para no duplicar
> volumen ni canibalizar. Ver §Deuda técnica. No lo desactivo yo: es un cambio de producto.

---

## Money pages (Fase A.4 — rutas vigentes hacia las que enlazar)

Enlazar 2-4 por post, priorizando la más afín. Solo estas rutas reales del sitemap:

**Colecciones / categorías de material y tipo:**
- `/coleccion` (raíz) · `/colecciones` · `/coleccion/plata-925` · `/coleccion/oro` · `/coleccion/cobre`
- `/coleccion/lapislazuli` · `/coleccion/piedras-naturales`
- `/coleccion/aros` · `/coleccion/collares` · `/coleccion/colgantes` · `/coleccion/joyas-hombre`

**Categorías de plata (subrutas `(categorias)`):**
- `/coleccion/anillos-de-plata` · `/coleccion/aros-de-plata` · `/coleccion/cadenas-de-plata`
- `/coleccion/colgantes-dijes-plata` · `/coleccion/collares-de-plata` · `/coleccion/pulseras-de-plata`

**Por ocasión:**
- `/coleccion/compromiso` · `/coleccion/aniversario` · `/coleccion/graduacion`
- `/regalos-bajo-100000` (regalos por precio)

**Productos:** enlazar a `/coleccion/<slug-producto>` solo para productos `APPROVED` reales tomados
de la DB (el generador ya hace esto en `generateBlogArticle` con `includeProductLinks: true`).

---

## Guardrails innegociables

1. **Audiencia = COMPRADOR de joyería.** Prohibidas en título, slug, H2 y keyword objetivo todas las
   keywords negativas de `estrategia-keywords.md` §3 (cursos, "cómo hacer", herramientas, mayoristas,
   empleo, e **intención de vendedor**). Grep de verificación obligatorio (ver §Validación).
2. **Cero datos inventados.** Cifras y afirmaciones externas → con fuente enlazada. Datos de marca
   (años, taller, certificaciones) → solo los verificables en el repo/sitio. Si no hay fuente, no se
   afirma. El sistema NO conoce datos de fundación/certificación verificados → ver §Datos sin verificar.
3. **Claims de materiales (925, 950, 18k, cobre, lapislázuli) SOLO si el dato existe en las páginas de
   producto reales** (tabla `Product`, campo `materials`). No afirmar pureza/quilataje genérico como
   si fuera de Casa Orfebre salvo que un producto real lo respalde.
4. **IMAGEN — regla crítica de joyería.** PROHIBIDO generar con IA imágenes que aparenten productos de
   Casa Orfebre (induce a error al comprador). Orden de preferencia:
   - (a) **Reutilizar foto real de producto** desde la DB (`Product` → imagen en R2), citando el
     `productId`/slug del asset.
   - (b) **Imagen ambiental/abstracta claramente no-producto** (taller, texturas, materiales en bruto).
   - (c) **Fallback honesto:** `coverImage = null` + nota "IMAGEN PENDIENTE" en el PR.
   - **Jamás inventar identificadores de imagen ni rutas R2 que no existan.** `coverImage` es nullable
     justamente para permitir el fallback (c).
5. **No canibalizar.** Revisar slugs existentes (`blog_posts` + `prisma/blog-content/`) y money pages
   antes de elegir tema. Ver `estrategia-keywords.md` §4.
6. **Enlaces internos solo a rutas vigentes** (lista de Money pages arriba). 2-4 por post.

---

## Fase de investigación (Semrush — el valor agregado)

Base de datos Semrush: **`cl`** (Chile). Siempre.

1. **Descubrir demanda real** sobre semillas de comprador rotativas (nunca las negativas):
   `argollas de matrimonio`, `anillos de compromiso`, `aros de plata`, `regalos para mujer`,
   `cadenas de plata`, `regalo aniversario`, `joyería artesanal`, `lapislázuli chile`, y los
   materiales/categorías/ocasiones activos de la DB.
   - `phrase_related` (temas adyacentes) y `phrase_questions` (preguntas reales) sobre 1-2 semillas
     por corrida, rotando. Filtro: **volumen ≥ 10**, descartar cualquier resultado con intención
     negativa.
   - `phrase_these` (batch, hasta 15 keywords separadas por `;`) para validar volumen de candidatos.
2. **Gaps de competencia:** `organic_research` (report `domain_organic`) de 2 competidores chilenos
   de joyería. Si no hay lista previa, detectarlos con Semrush (SERP de las semillas top). Buscar
   términos que ellos posicionan y Casa Orfebre no.
3. **Estacionalidad:** priorizar temas cuyo peak esté a 4-6 semanas (día de la madre → mayo;
   matrimonios → primavera/verano; navidad → nov-dic; graduaciones → dic-ene). La columna de Trends
   de Semrush indica el mes de peak.

## Selección (score 0-10, umbral ≥ 6)

- **Intención de compra (0-3, ELIMINATORIO):** 0 = no comprador o keyword negativa → descartar.
  3 = comprador con intención transaccional clara (regalo, compromiso, "comprar").
- **Demanda / estacionalidad (0-3):** volumen real Semrush + cercanía del peak estacional.
- **Gap de competencia (0-2):** término que competidores tienen y nosotros no.
- **No-duplicación (0-2, ELIMINATORIO):** 0 = ya existe post/ángulo similar o canibaliza money page
  → descartar. 2 = ángulo nuevo, no canibaliza.

Umbral **≥ 6** o no se genera. Registrar el score en el PR.

## Redacción

- Reusar `lib/ai/blog-generator.ts` (`generateBlogArticle`) como motor — ya encapsula la voz de
  marca, el formato Markdown, el JSON de salida y la inserción de links de producto. La rutina le
  pasa el `topic` + `keyword` validados por Semrush en vez de una keyword heurística.
- 1.000-1.500 palabras, español de Chile, tono cálido-experto de taller (no catálogo frío).
- Keyword en el primer párrafo y en ≥ 2 H2.
- FAQ 3-5 pares cuando aplique (usar las preguntas reales de `phrase_questions`).
- CTA a la colección afín (money page).
- Tabla/guía comparativa cuando el tema lo pida (p. ej. "plata 925 vs 950").
- Campos a poblar del modelo `BlogPost`: `title`, `slug`, `excerpt`, `content`, `category` (enum),
  `tags` (incluir la keyword slugificada + `revisado-semrush`), `seoTitle` (≤60), `seoDescription`
  (150-160), `readingTime`, `coverImage` (según regla 4).

## Validación (antes de abrir el PR)

```bash
# 1. Cero keywords negativas en título/slug/H2s del seed generado
grep -riE "curso|cómo hacer|hazlo tú|diy|herramient|mayorista|al por mayor|empleo|aprendiz|vender (joyas|mis joyas|joyería)|plataforma para orfebres|dónde vender" prisma/blog-seeds/pendientes/<slug>.md
# Debe devolver 0 líneas. Si devuelve algo → descartar y re-seleccionar.

# 2. Sin claims de material no verificados (revisión manual del contenido vs productos reales).

# 3. Build verde
npm run build   # (corre prisma generate + ensure-production-schema + next build)

# 4. Typecheck
npx tsc --noEmit
```

## Cierre (SIEMPRE PR, NUNCA merge/publish directo)

```bash
git checkout -b content/blog-<slug>
git add prisma/blog-seeds/pendientes/<slug>.md docs/seo/blog-topic-queue.md
git commit -m "content(blog): <título> — seed revisado con investigación Semrush"
git push -u origin content/blog-<slug>
# Abrir PR hacia main. NUNCA merge.
```

El PR debe incluir: keyword objetivo + volumen Semrush, score de selección, money pages enlazadas,
estado de imagen (asset reutilizado / ambiental / PENDIENTE), y link de lectura del Preview de Vercel.

## Notificación (Slack — `$SLACK_WEBHOOK_URL`, canal #blog-casaorfebre)

Al terminar, POST al webhook con: **título del post**, **link de lectura** (Preview de Vercel o URL
final), **link del PR**, y **estado de imagen**. Si NO se generó nada (ningún tema superó el umbral),
notificar el motivo. **A nadie más.** Si el webhook no está configurado, registrar en el log del run
y continuar (no bloquear).

---

## Datos de marca SIN verificar (para que Carlos confirme antes del merge)

El descubrimiento del código NO encontró fuente verificable para: años de operación del taller,
número de orfebres onboarded, certificaciones de pureza de metal, ni datos de fundación. El
generador actual NO afirma ninguno de estos (bien). **Regla:** hasta que Carlos provea la fuente,
ningún post afirma cifras de antigüedad, tamaño de la red ni certificaciones. Los claims de material
se limitan a lo que un producto real en la DB respalde.

## Deuda técnica detectada (acciones para Carlos, fuera del alcance de esta corrida)

1. **Convivencia de publicadores:** `blog-auto-generate` publica 1/día directo SIN Semrush y SIN
   revisión. Si la rutina remota revisada es el canal principal, pausar o reducir ese cron a semanal
   para evitar duplicar volumen. Cambio en `vercel.json`.
2. **Keywords de intención vendedor en el pool:** `lib/ai/blog-generator.ts` incluye 7 keywords de
   "vender/plataforma para orfebres" que contradicen el funnel de comprador (ver
   `estrategia-keywords.md` §3). Decidir: segmentar a funnel de captación de orfebres, o eliminar.
3. **Consumo del seed:** implementar el paso que lee `prisma/blog-seeds/pendientes/` e inserta en
   `blog_posts` tras el merge (o adaptar `blog-auto-generate` para drenar esa carpeta). Recordar:
   la migración de schema en este repo es **`prisma db push`**, NO `migrate dev` (historia rota).
