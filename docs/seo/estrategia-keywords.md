# Estrategia de keywords — Blog Casa Orfebre (B2C, comprador de joyería)

> **Alcance:** gobierna la selección de temas del blog auto-generado (`/api/cron/blog-auto-generate`)
> y de la rutina remota de investigación Semrush. NO gobierna el catálogo ni las páginas de colección.
> **Fuente de verdad de la arquitectura:** ver `docs/automations/BLOG_PIPELINE.md`.
> **Datos de volumen:** Semrush DB `cl`, verificados el 2026-07-02 (ver tabla al final).

---

## 1. Principio rector

El blog existe para **capturar tráfico informacional-comercial de COMPRADORES** (regalo o compra
propia) y canalizarlo hacia colecciones y productos. No compite con las páginas de colección por
su *head term*: ataca long-tail alrededor de ellas y enlaza hacia ellas.

Audiencia objetivo = **persona que quiere comprar o regalar una joya**. No el orfebre que quiere
vender, no el estudiante de orfebrería, no el mayorista.

## 2. Intención objetivo (lo que SÍ atacamos)

Agrupado por clúster, con las semillas reales del negocio (materiales, categorías y ocasiones que
ya existen en la DB — plata 925, oro, cobre, lapislázuli, aros, anillos, colgantes, cadenas,
pulseras, matrimonio, aniversario, día de la madre, graduación):

- **Compromiso y matrimonio** — argollas de matrimonio, anillos de compromiso, significado, cómo
  elegir talla/medida, oro vs plata para argollas. *(Clúster de mayor valor comercial.)*
- **Regalo por ocasión** — regalo para mujer/hombre, aniversario, día de la madre, graduación,
  cumpleaños; guías "qué regalar" con enlace a colección afín.
- **Aros / anillos / colgantes / cadenas / pulseras de plata y oro** — guías de compra, estilos,
  cómo combinar, qué significa cada pieza.
- **Materiales nobles** — plata 925 vs 950, oro 18k, cobre chileno, piedras chilenas (lapislázuli).
  Diferencias, autenticidad, valor. *(Solo claims verificables — ver regla 4 del pipeline.)*
- **Cuidado y limpieza** — cómo limpiar plata, evitar que se oxide/opaque, mantención de joyas.
- **Cultura e identidad chilena** — platería mapuche contemporánea, orfebrería patrimonial,
  significado simbólico. *(Ángulo de marca, no de "cómo hacer".)*
- **SEO local de compra** — "joyería artesanal [ciudad]", "dónde comprar joyas [ciudad]".

## 3. Keywords negativas (tráfico que NO convierte — PROHIBIDAS en título, slug, H2 y keyword objetivo)

Estas atraen alumnos, competidores o proveedores, no compradores:

- `curso de orfebrería`, `taller de orfebrería` (como formación), `aprender orfebrería`, `clases`
- `cómo hacer` anillos/joyas/argollas, `hazlo tú mismo`, `DIY joyería`, `tutorial`
- `herramientas de orfebre`, `soplete`, `laminadora`, `insumos orfebrería`
- `proveedores de plata`, `plata al por mayor`, `mayorista`, `comprar plata para fundir`
- `trabajo orfebre`, `empleo`, `sueldo orfebre`, `aprendiz`
- **Intención de VENDEDOR** (el orfebre que quiere vender, no el que quiere comprar): `vender
  joyas`, `dónde vender mi orfebrería`, `cómo vender mis joyas`, `plataforma para orfebres`,
  `vender joyería artesanal online`.

### ⚠️ Conflicto detectado con el sistema actual (acción requerida, ver pipeline §Deuda)

El pool dinámico actual (`lib/ai/blog-generator.ts`, función `generateDynamicKeywordPool`) **incluye
7 keywords de intención vendedor** que violan esta gobernanza:

```
"vender joyas hechas por mí", "plataforma para orfebres chile", "dónde vender mi orfebrería",
"vender joyería artesanal chile", "vender joyería artesanal online chile",
"plataforma para vender joyas hechas a mano chile", "cómo vender mis joyas en chile"
```

Y ya existen 2 posts publicados con esta intención mixta: `donde-vender-plata-chile` y
`emprender-orfebre-chile-2026-guia-completa`.

**Decisión pendiente de Carlos** (no la resuelvo unilateralmente porque cambia la estrategia):
estas keywords sirven a la **captación de orfebres** (lado de la oferta del marketplace), que es un
objetivo legítimo del negocio — pero es un *funnel distinto* al del comprador. Opciones:

1. **Segmentar** — mantenerlas, pero marcarlas con `tags: ["captacion-orfebre"]` y NO mezclarlas con
   el funnel de comprador (categoría dedicada, CTA a `/vender` en vez de a colección). *(Recomendada.)*
2. **Eliminarlas** del pool del blog y moverlas a una landing/campaña de captación separada.

Hasta que Carlos decida, el pipeline las trata como **negativas para el funnel comprador** pero NO
las borra del código (evita romper el sistema en producción sin su visto bueno).

## 4. Regla de no-canibalización

Antes de elegir un tema, contrastar contra:
- **Money pages vigentes** (ver lista en `BLOG_PIPELINE.md` §Money pages). Un post nunca debe
  competir con `/coleccion/aros`, `/coleccion/plata-925`, `/coleccion/(categorias)/aros-de-plata`,
  etc. por su término principal exacto. El post ataca la variante long-tail y enlaza a la money page.
- **Slugs de blog existentes** (`blog_posts.slug` en la DB + `prisma/blog-content/*.md`). No repetir
  tema ni ángulo. El cron ya compara los últimos 60 títulos; esta regla lo refuerza a nivel humano.

## 5. Datos de volumen verificados (Semrush `cl`, 2026-07-02)

Semillas de comprador, para priorizar el queue (volumen mensual / competencia):

| Keyword | Vol. | Notas |
|---|---:|---|
| anillos de compromiso | 40.500 | Clúster #1. Estacional (peak jun). Long-tail: talla, significado, oro vs plata. |
| regalos para mujer | 14.800 | Peak fuerte en un mes (día de la madre). Guías por ocasión. |
| cadenas de plata | 12.100 | Guía de tipos ya existe (`tipos-cadenas-de-plata`) — atacar variantes. |
| argollas de matrimonio | 8.100 | Alta intención. Peak jul. |
| aros de plata | 8.100 | Money page existe (`/coleccion/(categorias)/aros-de-plata`) — NO canibalizar. |
| joyas de plata | 6.600 | Genérico; usar como paraguas, no como target directo. |
| anillos de plata | 6.600 | Money page existe. Atacar "cómo elegir", "qué significa". |
| pulseras de plata | 5.400 | Money page existe. |
| anillo de compromiso oro | 2.900 | CPC alto (0.56) = intención comercial fuerte. |
| joyas mapuche | 1.600 | Ángulo cultura/identidad. Tendencia decreciente — cubrir una vez. |
| medalla san benito | 1.600 | Nicho devocional; post ya existe (`medalla-san-benito-plata`). |
| colgantes de plata | 1.000 | Money page existe. |
| lapislázuli chile | 880 | Diferenciador chileno. Estable todo el año. |
| regalo aniversario | 590 | Guía por ocasión. |
| joyería artesanal | 110 | Bajo volumen exacto — head term de marca, no target de blog. |

**Lectura estratégica:** el volumen vive en compromiso/matrimonio, regalos por ocasión y las
categorías de plata. El queue inicial (`blog-topic-queue.md`) prioriza estos clústeres atacando
long-tail que NO canibalice las money pages.

Preguntas reales de comprador con demanda (clúster plata 925, para FAQs y posts de cuidado):
"cuál es la diferencia entre plata 925 y 950", "es buena la plata de ley 925", "con qué limpiar la
plata 925", "qué es la plata 925 rodinada".
