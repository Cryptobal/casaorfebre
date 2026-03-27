# DEPRECATED: migrado a DB

Los artículos de blog se migraron a la base de datos.
Ver `prisma/seed-blog.ts` para el script de migración.

Las rutas públicas ya NO leen de estos archivos TSX sino de la tabla `blog_posts`.
Mantener como backup hasta confirmar migración exitosa.
