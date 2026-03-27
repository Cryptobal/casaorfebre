# Casa Orfebre — Especificaciones del sistema

## Documento maestro de requerimientos

Versión 1.0 — Marzo 2026

---

## 1. Sistema de planes y membresías

### 1.1 Planes disponibles

| Parámetro | Esencial | Artesano | Maestro |
|-----------|----------|----------|---------|
| Precio mensual | Gratis | $19.990 CLP | $49.990 CLP |
| Precio anual | — | $199.990 CLP | $499.990 CLP |
| Comisión por venta | 18% | 12% | 9% |
| Productos activos | 10 | 40 | Ilimitados |
| Fotos por pieza | 3 | 6 | Ilimitadas |
| Video por pieza | No | No | Sí (1 por pieza) |
| Badge de perfil | Ninguno | "Artesano Verificado" | "Maestro Orfebre" |
| Estadísticas | No | Básicas | Avanzadas |
| Certificado autenticidad | No | Sí | Sí |
| Destaque en home | No | No | Sí (rotativo) |
| Prioridad búsqueda | Normal (peso 1x) | Alta (peso 1.5x) | Máxima (peso 2x) |
| Frecuencia de pago | Quincenal | Semanal | 48 horas |
| Posts redes sociales | 0 | 1/mes | 4/mes |
| Soporte | Email | Email + chat | Dedicado |

### 1.2 Parámetros editables por el administrador

El administrador debe poder modificar desde un panel de admin los siguientes valores para cada plan sin necesidad de tocar código.

Parámetros configurables globalmente (afectan a todos los orfebres del plan): porcentaje de comisión por venta (campo numérico decimal, ej: 0.18), límite de productos activos (campo numérico entero, 0 = ilimitado), límite de fotos por pieza (campo numérico entero, 0 = ilimitado), habilitar/deshabilitar video por pieza (booleano), precio mensual y anual del plan (campos numéricos).

Parámetros configurables por orfebre individual (override del plan): porcentaje de comisión personalizado (si se quiere dar un trato especial a un orfebre), límite de productos personalizado, límite de fotos personalizado. Cuando existe un override individual, este tiene prioridad sobre la configuración del plan.

### 1.3 Modelo de datos del plan

```
Tabla: planes
- id (PK)
- nombre (string): "esencial" | "artesano" | "maestro"
- precio_mensual (integer): en CLP, 0 para gratis
- precio_anual (integer): en CLP, 0 para gratis
- comision_pct (decimal): 0.18 | 0.12 | 0.09
- max_productos (integer): 10 | 40 | 0 (0=ilimitado)
- max_fotos_pieza (integer): 3 | 6 | 0 (0=ilimitado)
- video_habilitado (boolean): false | false | true
- badge_texto (string): null | "Artesano Verificado" | "Maestro Orfebre"
- badge_tipo (string): null | "verificado" | "maestro"
- tiene_estadisticas (string): "none" | "basic" | "advanced"
- tiene_certificado (boolean)
- destaque_home (boolean)
- peso_busqueda (decimal): 1.0 | 1.5 | 2.0
- frecuencia_pago (string): "quincenal" | "semanal" | "48h"
- posts_redes_mes (integer): 0 | 1 | 4
- nivel_soporte (string): "email" | "chat" | "dedicado"
- activo (boolean)
- created_at, updated_at (timestamps)
```

```
Tabla: orfebres
- id (PK)
- plan_id (FK -> planes)
- nombre, apellido (strings)
- nombre_artistico (string)
- email (string, unique)
- telefono (string)
- historia (text): biografía del orfebre
- foto_perfil (string): URL
- video_perfil (string): URL, solo para Maestro
- ciudad (string)
- region (string)
- mp_access_token (string): token OAuth de Mercado Pago
- mp_refresh_token (string)
- cuenta_banco (string, encriptado)
- comision_override (decimal, nullable): si existe, usa este % en vez del plan
- max_productos_override (integer, nullable)
- max_fotos_override (integer, nullable)
- estado (string): "postulando" | "en_revision" | "aprobado" | "rechazado" | "suspendido"
- fecha_aprobacion (date, nullable)
- suscripcion_estado (string): "sin_suscripcion" | "activa" | "vencida" | "cancelada"
- suscripcion_inicio (date, nullable)
- suscripcion_fin (date, nullable)
- rating_promedio (decimal): calculado automáticamente
- total_ventas (integer): contador
- total_resenas (integer): contador
- especialidades (array de strings): ej ["plata", "oro", "cobre"]
- tecnicas (array de strings): ej ["fundición", "filigrana", "engaste"]
- educacion (text): formación del orfebre
- created_at, updated_at (timestamps)
```

### 1.4 Lógica de validación en backend

Al crear un producto, el backend debe verificar: si el orfebre tiene un max_productos_override, usar ese valor; si no, usar el max_productos del plan asociado. Si el valor es 0, no hay límite. Si la cantidad de productos activos del orfebre es mayor o igual al límite, rechazar la creación con mensaje "Has alcanzado el límite de tu plan. Actualiza a [plan superior] para publicar más piezas."

La misma lógica aplica para fotos al subir imágenes a un producto, y para video (verificar si video_habilitado es true en el plan o si existe un override).

---

## 2. Flujo de onboarding del orfebre

### 2.1 Pasos del proceso

Paso 1 — El orfebre pincha "Postular" en la web pública. Se abre la página de planes (pricing page). El orfebre ve los tres planes con sus beneficios y precios. Elige un plan.

Paso 2 — Formulario de postulación. Campos obligatorios: nombre completo, email, teléfono, ciudad y región, nombre artístico o marca, historia/biografía (mínimo 100 caracteres), especialidades (selección múltiple: plata, oro, cobre, bronce, piedras, mixto, otro), técnicas (selección múltiple: fundición, filigrana, engaste, esmaltado, grabado, forjado, otro), educación/formación (texto libre), al menos 5 fotos de trabajos anteriores (portafolio), links a redes sociales o web (opcional). El plan elegido queda asociado al registro pero no se cobra aún.

Paso 3 — Casa Orfebre revisa la postulación. El administrador ve las postulaciones pendientes en el panel de admin. Puede aprobar, rechazar (con motivo), o pedir más información. El orfebre recibe email con el resultado. Tiempo estimado de revisión: 1-5 días hábiles.

Paso 4 — Si es aprobado y eligió plan pago, se le pide conectar Mercado Pago vía OAuth. En este momento se activa el cobro de la suscripción (si aplica). Si eligió plan Esencial, solo conecta Mercado Pago para recibir pagos.

Paso 5 — Panel activo. El orfebre puede empezar a subir productos y vender.

### 2.2 Cambio de plan

El orfebre puede subir de plan en cualquier momento desde su panel. El upgrade es inmediato: se cobra la diferencia prorrateada del mes en curso. Si baja de plan y tiene más productos/fotos del límite inferior, los productos extra quedan "pausados" (no visibles en la tienda) pero no se eliminan. El orfebre debe elegir cuáles mantener activos.

---

## 3. Ficha de producto (listing)

### 3.1 Campos del producto

La ficha del producto debe contener toda la información necesaria para que el comprador tome la decisión de compra sin dudas, similar a Etsy pero adaptada a joyería artesanal.

```
Tabla: productos
- id (PK)
- orfebre_id (FK -> orfebres)
- titulo (string, max 140 chars): nombre de la pieza
- descripcion (text): descripción detallada
- precio (integer): en CLP
- precio_comparacion (integer, nullable): precio "antes" tachado
- estado (string): "borrador" | "activo" | "pausado" | "agotado"
- destacado (boolean): solo para orfebres Maestro
- created_at, updated_at (timestamps)
```

```
Tabla: producto_atributos (campos específicos de joyería)
- producto_id (FK)
- coleccion (string, nullable): ej "Raíces", "Luna Austral"
- categoria (string): "anillos" | "collares" | "aros" | "pulseras" | "broches" | "colgantes" | "sets" | "otro"
- subcategoria (string, nullable): ej "anillo solitario", "collar gargantilla"
- materiales (array de strings): ej ["plata 950", "cobre"]
- material_principal (string): el material predominante
- piedras (array de strings, nullable): ej ["lapislázuli", "cuarzo rosa"]
- tecnica (string): "fundición" | "filigrana" | "engaste" | "esmaltado" | "grabado" | "forjado" | "mixta"
- peso_gramos (decimal): peso de la pieza
- dimensiones_largo_mm (decimal)
- dimensiones_ancho_mm (decimal)
- dimensiones_alto_mm (decimal, nullable)
- tallas_disponibles (array de strings, nullable): ej ["5", "6", "7", "8"] para anillos
- guia_tallas (string, nullable): link o texto explicativo
- largo_cadena_cm (decimal, nullable): para collares
- diametro_mm (decimal, nullable): para aros, pulseras
- personalizable (boolean): si acepta grabado o modificación
- detalle_personalizacion (text, nullable): qué se puede personalizar
- tiempo_elaboracion_dias (integer): tiempo de fabricación
- pieza_unica (boolean): si es pieza única irrepetible
- edicion_limitada (boolean)
- cantidad_edicion (integer, nullable): ej "5 de 20"
- cuidados (text): instrucciones de cuidado
- empaque (string): descripción del empaque
- garantia (string, nullable): política de garantía
```

### 3.2 Medidas obligatorias por categoría

Según la categoría del producto, ciertas medidas son obligatorias.

Anillos: tallas disponibles (obligatorio), guía de tallas (obligatorio), peso, dimensiones ancho.
Collares y colgantes: largo de cadena en cm (obligatorio), peso, tipo de cierre.
Aros: diámetro o largo en mm (obligatorio), peso, tipo de cierre.
Pulseras: diámetro o largo en cm (obligatorio), peso, tipo de cierre.

La validación del formulario debe requerir estos campos según la categoría seleccionada. Si falta una medida obligatoria, el producto no puede publicarse.

### 3.3 Imágenes y video del producto

```
Tabla: producto_media
- id (PK)
- producto_id (FK)
- tipo (string): "foto" | "video"
- url (string): URL del archivo
- url_thumbnail (string): versión reducida
- orden (integer): posición en el carrusel
- alt_text (string, nullable): texto alternativo
- es_principal (boolean): foto principal del listing
- created_at (timestamp)
```

Restricciones: la cantidad máxima de fotos se valida según el plan del orfebre (3/6/ilimitadas). El video solo se permite si el plan lo habilita (solo Maestro). Las fotos deben tener mínimo 1000x1000 px. Formatos aceptados: JPG, PNG, WebP. Video: MP4, máximo 30 segundos, máximo 50MB. La primera foto (orden=1) es la imagen principal que se muestra en catálogos y búsquedas.

Recomendaciones de fotos para el orfebre: foto 1 — pieza completa sobre fondo neutro; foto 2 — pieza en uso (en mano, cuello, oreja); foto 3 — detalle de textura/acabado; fotos adicionales — ángulos laterales, escala con referencia, detalle del cierre, packaging.

---

## 4. Página de producto (vista del comprador)

### 4.1 Estructura de la página

La página de producto debe incluir las siguientes secciones en orden:

Carrusel de imágenes (lado izquierdo en desktop): todas las fotos del producto con thumbnails debajo, zoom al hacer hover, video integrado si existe. Al hacer clic, galería a pantalla completa.

Panel de información (lado derecho en desktop): nombre de la pieza, precio (y precio comparación tachado si existe), badge del orfebre (Verificado/Maestro) con link a su perfil, rating del orfebre (estrellas + cantidad de reseñas), colección a la que pertenece (link a la colección), indicador de disponibilidad (pieza única, edición limitada, o disponible), selector de talla (si aplica, con link a guía de tallas), opción de personalización (si aplica, campo de texto), botón "Agregar al carrito", botón "Agregar a favoritos" (corazón), tiempo estimado de elaboración, información de envío estimada.

Tabs o secciones expandibles debajo del carrusel: "Descripción" — texto completo del orfebre sobre la pieza. "Detalles y medidas" — tabla con materiales, técnica, peso, dimensiones, tallas. "Cuidados" — instrucciones de cuidado de la pieza. "Envío y devoluciones" — política de envío y devolución.

Sección del orfebre: mini-card con foto del orfebre, nombre artístico, badge, rating, ciudad, cantidad de piezas en venta, botón "Ver todas las piezas de [nombre]". Breve extracto de su historia (2-3 líneas) con link "Leer más".

Productos similares: carrusel con 8-12 productos relacionados, calculados por: misma categoría + mismo material, misma categoría + mismo rango de precio, otras piezas del mismo orfebre, piezas que otros compradores también vieron.

### 4.2 Sistema de reseñas y rating

```
Tabla: resenas
- id (PK)
- producto_id (FK)
- orfebre_id (FK): para cálculo de rating general del orfebre
- comprador_id (FK -> usuarios)
- pedido_id (FK -> pedidos): solo se puede reseñar después de recibir
- rating (integer): 1-5 estrellas
- titulo (string, nullable)
- comentario (text)
- respuesta_orfebre (text, nullable): el orfebre puede responder
- fecha_respuesta (timestamp, nullable)
- estado (string): "publicada" | "moderada" | "eliminada"
- created_at (timestamp)
```

```
Tabla: resena_fotos
- id (PK)
- resena_id (FK)
- url (string)
- url_thumbnail (string)
- orden (integer)
```

Reglas de las reseñas: solo se puede reseñar un producto que se haya comprado y recibido (pedido en estado "entregado"). Se puede subir hasta 5 fotos por reseña. El orfebre puede responder cada reseña una vez. El rating del orfebre es el promedio ponderado de todas sus reseñas. Las reseñas con foto se muestran primero (como en Etsy). El comprador puede editar su reseña dentro de los 30 días posteriores a su publicación.

### 4.3 Productos similares — algoritmo

La sección de productos similares debe mostrar piezas relevantes usando la siguiente lógica de prioridad: primero, misma categoría + mismo material principal (ej: otros anillos de plata); segundo, misma categoría + rango de precio similar (+-30%); tercero, otras piezas del mismo orfebre (máximo 3 de estas); cuarto, productos populares de la misma categoría (por ventas recientes); quinto, productos que otros compradores también vieron (behavioral). Mostrar máximo 12 productos, mínimo 4. Nunca mostrar productos agotados o pausados.

---

## 5. Panel del administrador

### 5.1 Dashboard principal

El administrador debe tener un panel con las siguientes funcionalidades:

Vista general: total de orfebres por plan (Esencial/Artesano/Maestro), ventas del mes (GMV), comisiones generadas por la plataforma, ingresos por suscripciones, orfebres con postulaciones pendientes.

Gestión de planes: editar los parámetros de cada plan (comisiones, límites, precios). Todos los cambios se aplican a los orfebres del plan afectado, excepto los que tengan overrides individuales. Historial de cambios (quién cambió qué y cuándo).

Gestión de orfebres: lista de todos los orfebres con filtros por plan, estado, ciudad, rating. Para cada orfebre: ver su perfil, productos, ventas, reseñas. Poder editar su comisión personalizada (override). Poder editar sus límites personalizados (override). Poder cambiar su plan manualmente. Poder suspender o desactivar un orfebre.

Postulaciones: lista de postulaciones pendientes con detalle del formulario, portafolio del postulante, plan seleccionado. Botones de aprobar, rechazar (con campo para motivo), pedir más información.

Gestión de redes sociales: calendario editorial con los posts comprometidos por plan. Lista de orfebres Artesano (1 post pendiente) y Maestro (4 posts pendientes) del mes. Estado de cada post: pendiente, publicado, link al post.

### 5.2 Reportes

Reporte de comisiones: detalle de cada venta con monto bruto, comisión de Mercado Pago, comisión de Casa Orfebre, monto neto al orfebre. Filtrable por fecha, orfebre, plan.

Reporte de suscripciones: orfebres con suscripción activa, vencida, cancelada. Ingresos recurrentes mensuales (MRR).

Reporte de productos: productos más vistos, más vendidos, con mejor rating. Productos sin ventas en los últimos 30/60/90 días.

---

## 6. Sistema de comisiones y pagos

### 6.1 Flujo de pago

El cliente compra un producto en Casa Orfebre. Mercado Pago procesa el pago. Mercado Pago descuenta su comisión de procesamiento (~3.49% + IVA). Mercado Pago aplica el marketplace_fee (la comisión de Casa Orfebre según el plan del orfebre). El resto va a la cuenta de Mercado Pago del orfebre. Según la frecuencia de pago del plan, Mercado Pago transfiere a la cuenta bancaria del orfebre.

### 6.2 Implementación técnica del split

Al crear cada pago en la API de Mercado Pago, el backend debe: obtener el plan del orfebre o su comision_override. Calcular el marketplace_fee como monto en CLP (no porcentaje). Enviarlo en el campo marketplace_fee (Checkout Pro) o application_fee (Checkout API). Usar el access_token del orfebre obtenido por OAuth.

### 6.3 Cobro de suscripciones

Las suscripciones de planes Artesano y Maestro se cobran como pagos recurrentes automáticos a través de Mercado Pago. Si el pago falla, se reintenta a los 3 y 7 días. Si no se puede cobrar después de 3 intentos, el orfebre baja automáticamente al plan Esencial (sus productos extra se pausan). Se notifica al orfebre por email en cada intento fallido.

---

## 7. Catálogo y navegación

### 7.1 Categorías del catálogo

Categorías principales: anillos, collares, aros, pulseras, broches, colgantes, sets.

Filtros de búsqueda: categoría, material (plata, oro, cobre, bronce, piedras, mixto), rango de precio (slider), técnica (fundición, filigrana, engaste, esmaltado, grabado, forjado), piedra (lapislázuli, cuarzo, turquesa, etc.), talla disponible (para anillos), pieza única (sí/no), disponibilidad (en stock / por encargo), orfebre específico, región del orfebre, rating mínimo del orfebre.

Ordenamiento: relevancia (por defecto, usa peso_busqueda del plan), precio menor a mayor, precio mayor a menor, más recientes, más vendidos, mejor rating.

### 7.2 Colecciones

Cada orfebre puede crear colecciones para agrupar sus piezas temáticamente (ej: "Raíces", "Luna Austral", "Volcanes del Sur"). Las colecciones tienen: nombre, descripción, imagen de portada, y los productos asignados. En el perfil del orfebre, sus colecciones se muestran como secciones visuales.

### 7.3 Búsqueda con prioridad por plan

El algoritmo de búsqueda y listado aplica un multiplicador al score de relevancia según el plan del orfebre: Esencial = 1.0x (base), Artesano = 1.5x, Maestro = 2.0x. Esto hace que los productos de orfebres con planes pagos aparezcan más arriba sin eliminar a los gratuitos. El multiplicador es configurable por el administrador.

---

## 8. Certificado de autenticidad

### 8.1 Generación automática

Al completarse una venta de un orfebre con plan Artesano o Maestro, el sistema genera automáticamente un PDF con: logo de Casa Orfebre, título "Certificado de autenticidad", nombre de la pieza, foto principal del producto, nombre del orfebre y su badge, materiales utilizados, técnica de elaboración, peso y dimensiones, fecha de creación/venta, código QR que lleva a una página de verificación en casaorfebre.cl/verificar/[codigo], número único del certificado.

El certificado se envía al comprador como adjunto en el email de confirmación del pedido y también está disponible para descarga desde su historial de compras.

---

## 9. Estadísticas del orfebre

### 9.1 Estadísticas básicas (plan Artesano)

Ventas del mes (cantidad y monto), ingresos netos del mes (después de comisiones), visitas totales a sus productos, productos más vistos (top 5), gráfico de ventas de los últimos 6 meses.

### 9.2 Estadísticas avanzadas (plan Maestro)

Todo lo básico más: fuentes de tráfico (Instagram, Google, directo, otro), tasa de conversión por producto (visitas vs compras), comparación mes a mes con variación porcentual, palabras de búsqueda que llevan tráfico a sus piezas, horarios de mayor actividad, productos agregados a favoritos pero no comprados (oportunidad).

---

## 10. Destaque en home (plan Maestro)

### 10.1 Carrusel de orfebres destacados

En la home de Casa Orfebre, una sección "Orfebres Maestros" muestra un carrusel rotativo con: foto del orfebre, nombre artístico, badge Maestro, ciudad, una pieza destacada, breve frase de su historia. La rotación es automática: cada semana se cambian los orfebres mostrados. Si hay pocos Maestros, se rotan todos. El administrador puede fijar manualmente un orfebre en el carrusel (override).

---

## 11. Infraestructura de media (fotos y video)

### 11.1 Fotos — Cloudflare R2

Servicio: Cloudflare R2 (object storage compatible con S3, sin costos de transferencia).

Pipeline de subida de fotos: el orfebre selecciona foto(s) desde su panel. El frontend valida en el navegador: formato (JPG, PNG, WebP), tamaño mínimo 1000x1000px, tamaño máximo 10MB. Si pasa la validación, se sube al backend. El backend genera: versión original (guardada como respaldo), versión optimizada WebP (para la web, ~80% calidad), thumbnail 400x400px WebP (para catálogo y búsquedas), thumbnail 100x100px WebP (para carrusel de miniaturas). Todas las versiones se suben a Cloudflare R2 en un bucket organizado por orfebre y producto.

Estructura de almacenamiento en R2:
```
casaorfebre-media/
  orfebres/
    {orfebre_id}/
      perfil/
        avatar.webp
        avatar-thumb.webp
      productos/
        {producto_id}/
          original/
            foto-1.jpg
          web/
            foto-1.webp
            foto-1-thumb.webp
          video/
            (no se usa R2 para video — va por Stream)
```

URL pública: las imágenes se sirven a través del CDN de Cloudflare con una URL tipo `https://media.casaorfebre.cl/orfebres/{id}/productos/{id}/web/foto-1.webp`. El dominio custom se configura en R2.

Costos estimados: los primeros 10GB de storage y 10 millones de operaciones de lectura son gratis. Sin costos de transferencia (egress). Para un marketplace con 1.000 productos y 6 fotos cada uno (~3MB promedio por foto), el storage total sería ~18GB, costando aproximadamente $0.27 USD/mes.

### 11.2 Video — Cloudflare Stream

Servicio: Cloudflare Stream (video encoding, storage, y delivery con player embebido).

Disponibilidad: solo orfebres con plan Maestro (o con override de video_habilitado = true).

Pipeline de subida de video:

Paso 1 — El orfebre Maestro pincha "Subir video" en la ficha del producto. El frontend valida en el navegador: formato MP4, duración máxima 30 segundos, tamaño máximo 50MB.

Paso 2 — El frontend solicita al backend de Casa Orfebre una URL de upload directo. El backend hace un POST a la API de Cloudflare Stream:
```
POST https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/stream/direct_upload
Headers: Authorization: Bearer {API_TOKEN}
Body: {
  "maxDurationSeconds": 30,
  "allowedOrigins": ["casaorfebre.cl"],
  "creator": "{orfebre_id}",
  "meta": {
    "name": "producto-{producto_id}.mp4",
    "orfebre_id": "{orfebre_id}",
    "producto_id": "{producto_id}"
  }
}
```
Cloudflare devuelve un `uploadURL` y un `uid`.

Paso 3 — El backend guarda el `uid` en la base de datos (tabla producto_media) y devuelve el `uploadURL` al frontend.

Paso 4 — El frontend sube el video directamente a Cloudflare Stream usando el `uploadURL`. El video NO pasa por el servidor de Casa Orfebre (esto ahorra ancho de banda y es más rápido para el orfebre). Se muestra una barra de progreso al orfebre durante la subida.

Paso 5 — Cloudflare Stream codifica el video automáticamente en múltiples calidades (adaptive bitrate HLS). El backend consulta el estado del video periódicamente o usa webhooks de Cloudflare para saber cuándo está listo (`readyToStream: true`).

Paso 6 — Cuando el video está listo, se actualiza el estado en la base de datos y se muestra en la ficha del producto.

Modelo de datos para video:
```
En tabla producto_media:
- tipo: "video"
- url: "https://customer-{code}.cloudflarestream.com/{uid}/manifest/video.m3u8"
- cloudflare_stream_uid: "{uid}"  (campo adicional para videos)
- thumbnail_url: "https://customer-{code}.cloudflarestream.com/{uid}/thumbnails/thumbnail.jpg"
- estado_procesamiento: "subiendo" | "procesando" | "listo" | "error"
- duracion_segundos: (decimal, lo provee Cloudflare al terminar)
```

Player en la ficha del producto: se usa el iframe embed de Cloudflare Stream:
```html
<iframe
  src="https://customer-{code}.cloudflarestream.com/{uid}/iframe"
  style="border: none; width: 100%; aspect-ratio: 16/9;"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
  allowfullscreen
></iframe>
```
Configuración del player: autoplay muteado (el video comienza sin sonido al entrar a la ficha), el comprador puede activar sonido y pantalla completa, loop activado (el video se repite), controls visibles (play/pause, volumen, fullscreen).

Webhook de Cloudflare Stream: configurar un webhook para recibir notificaciones cuando un video termina de procesarse. Endpoint: `POST https://api.casaorfebre.cl/webhooks/cloudflare-stream`. El webhook envía el uid y el estado, el backend actualiza la tabla producto_media.

Costos estimados: $5 USD por cada 1.000 minutos de video almacenado, $1 USD por cada 1.000 minutos de video reproducido. Para 100 videos de 30 segundos (50 minutos) con 10.000 reproducciones al mes (5.000 minutos), el costo sería ~$5.25 USD/mes.

### 11.3 Validaciones de media por plan

| Validación | Esencial | Artesano | Maestro |
|------------|----------|----------|---------|
| Fotos por pieza | máx 3 | máx 6 | ilimitadas |
| Video por pieza | bloqueado | bloqueado | 1 permitido |
| Tamaño foto | máx 10MB | máx 10MB | máx 10MB |
| Resolución mínima foto | 1000x1000px | 1000x1000px | 1000x1000px |
| Duración video | — | — | máx 30 seg |
| Tamaño video | — | — | máx 50MB |
| Formato foto | JPG, PNG, WebP | JPG, PNG, WebP | JPG, PNG, WebP |
| Formato video | — | — | MP4 |

El frontend debe validar estos límites antes de intentar la subida. El backend debe re-validar como segunda capa de seguridad. Si el orfebre intenta subir un video sin tener plan Maestro, se muestra: "Los videos están disponibles en el plan Maestro. Actualiza tu plan para mostrar tus piezas en movimiento."

---

## 12. Notas técnicas

### 11.1 Stack recomendado

Frontend: Next.js o Nuxt.js con SSR para SEO. Backend: Node.js con Express o NestJS, o Python con Django/FastAPI. Base de datos: PostgreSQL. Storage de fotos: Cloudflare R2 (object storage, sin costos de transferencia). Video: Cloudflare Stream (encoding, delivery, player embebido). CDN: Cloudflare (dominio custom media.casaorfebre.cl). Pasarela de pago: Mercado Pago Split (Chile). Emails: SendGrid o AWS SES. Búsqueda: Algolia o Meilisearch (para búsqueda facetada con filtros).

### 11.2 Prioridades de desarrollo

Fase 1 (MVP): registro y postulación de orfebres, planes y comisiones con Mercado Pago, ficha de producto con fotos y atributos completos, catálogo con búsqueda y filtros, carrito y checkout, panel de admin básico (gestión de orfebres y planes).

Fase 2: reseñas con fotos, productos similares, estadísticas básicas, certificado de autenticidad, colecciones.

Fase 3: estadísticas avanzadas, destaque en home, sistema de posts en redes sociales, soporte chat para orfebres Artesano y Maestro.

---

*Documento generado para Casa Orfebre — LX3.ai — Marzo 2026*