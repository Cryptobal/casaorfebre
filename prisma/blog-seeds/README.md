# Blog seeds — puente rutina remota → tabla `blog_posts`

La rutina remota de blog NO escribe directo a la base de datos. Escribe archivos
aquí, en un PR revisable. Flujo:

1. **`pendientes/<slug>.md`** — la rutina genera el seed (frontmatter + Markdown) y abre un PR.
2. **Revisión humana** — se revisa y mergea el PR.
3. **Publicación** — el cron `blog-publish-seeds` (o `lib/blog/seeds.ts` → `publishPendingSeeds()`)
   inserta cada seed en `blog_posts`, registra la URL para GSC, y mueve el archivo a `publicados/`.

## Formato del frontmatter (todos los campos del modelo `BlogPost`)

```markdown
---
title: Título del artículo (H1, máx 80 chars)
slug: slug-del-articulo
excerpt: Resumen de 1-2 oraciones para cards (máx 200 chars)
category: GUIAS
tags: [tag1, tag2, tag3]
seoTitle: SEO title máx 60 chars
seoDescription: Meta description 150-160 chars exactos
coverImage: null
targetKeyword: keyword objetivo validada con semrush
---

Cuerpo del artículo en Markdown (sin H1; el título va en el frontmatter).
```

### Campos
- `category` — uno de: `GUIAS`, `TENDENCIAS`, `ORFEBRES`, `CUIDADOS`, `MATERIALES`, `CULTURA`.
- `coverImage` — ruta R2 de una foto REAL de producto o imagen ambiental, o `null` (fallback honesto).
  **Nunca** inventar rutas ni generar imágenes que aparenten productos de Casa Orfebre.
- `targetKeyword` — se slugifica y se agrega a `tags`, junto con `revisado-semrush`.

Ver `docs/automations/BLOG_PIPELINE.md` y `docs/seo/estrategia-keywords.md`.
