# Auditoría Casa Orfebre — Datos para Brochure de Orfebres

> Generado el 2026-03-31. Todos los datos extraídos directamente del código fuente.

---

## 1. Planes y Precios

### Plan Esencial (Gratuito)
| Campo | Valor |
|-------|-------|
| Precio mensual | CLP $0 (Gratis) |
| Precio anual | — |
| Comisión por venta | 18% |
| Productos activos | Hasta 10 |
| Fotos por producto | Hasta 3 |
| Video por producto | No |
| Badge de perfil | — |
| Certificado de autenticidad | No |
| Estadísticas | No |
| Destaque en home | No |
| Prioridad en búsqueda | 1.0x (base) |
| Frecuencia de pago | Quincenal (cada 14 días desde confirmación de entrega) |
| Posts en redes sociales/mes | 0 |
| Soporte | Email |

**Features mostradas al usuario:**
- 10 productos activos
- 3 fotos por pieza
- Soporte email
- Pago quincenal

### Plan Artesano
| Campo | Valor |
|-------|-------|
| Precio mensual | CLP $19.990 |
| Precio anual | CLP $199.990 (ahorro 17%) |
| Comisión por venta | 12% |
| Productos activos | Hasta 40 |
| Fotos por producto | Hasta 6 |
| Video por producto | No |
| Badge de perfil | "Artesano Verificado" (tipo: verificado) |
| Certificado de autenticidad | Sí |
| Estadísticas básicas | Sí |
| Estadísticas avanzadas | No |
| Destaque en home | No |
| Prioridad en búsqueda | 1.5x |
| Frecuencia de pago | Semanal (cada 7 días desde confirmación de entrega) |
| Posts en redes sociales/mes | 1 |
| Soporte | Email + Chat |

**Features mostradas al usuario:**
- 40 productos activos
- 6 fotos por pieza
- Badge Artesano Verificado
- Estadísticas básicas
- Certificado de autenticidad
- Prioridad en búsqueda (1.5x)
- Soporte chat
- Pago semanal
- 1 post redes sociales/mes

**Marcado como "Más popular" en la UI.**

### Plan Maestro
| Campo | Valor |
|-------|-------|
| Precio mensual | CLP $49.990 |
| Precio anual | CLP $499.990 (ahorro 17%) |
| Comisión por venta | 9% |
| Productos activos | Ilimitados |
| Fotos por producto | Ilimitadas |
| Video por producto | Sí |
| Badge de perfil | "Maestro Orfebre" (tipo: maestro) |
| Certificado de autenticidad | Sí |
| Estadísticas básicas | Sí |
| Estadísticas avanzadas | Sí |
| Destaque en home | Sí |
| Prioridad en búsqueda | 2.0x |
| Frecuencia de pago | 48 horas (desde confirmación de entrega) |
| Posts en redes sociales/mes | 4 |
| Soporte | Dedicado |

**Features mostradas al usuario:**
- Productos ilimitados
- Fotos ilimitadas por pieza
- Video por pieza
- Badge Maestro Orfebre
- Estadísticas avanzadas
- Certificado de autenticidad
- Destaque en home
- Máxima prioridad búsqueda (2x)
- Soporte dedicado
- Pago en 48h
- 4 posts redes sociales/mes

### Período de Prueba / Promoción Pioneros
- **Campaña activa:** PIONEROS_2026
- **Tipo:** FREE_TRIAL del plan Maestro
- **Duración:** 90 días (3 meses)
- **Formato del código:** `PIONERO-{NOMBRE}-2026`
- **Máximo usos por código:** 1
- **Expiración de códigos:** 30 de junio 2026
- **UI muestra:** Badge "GRATIS 3 MESES" junto al plan

### Overrides por Orfebre
El admin puede asignar valores personalizados por orfebre:
- `commissionOverride` — comisión personalizada
- `maxProductsOverride` — límite de productos personalizado
- `maxPhotosOverride` — límite de fotos personalizado

### Facturación de Suscripción
- Pago vía MercadoPago (igual que compras)
- Soporte para pago mensual o anual
- Al cambiar de plan superior a inferior: período de gracia de 7 días para seleccionar qué productos mantener activos (los demás se pausan, no se eliminan)

---

## 2. Flujo de Pagos y Retención

### Procesamiento del Pago
- **Método:** MercadoPago Checkout Pro
- **Split Payment:** Implementado para carritos de un solo orfebre con OAuth conectado
  - El pago va directo a la cuenta MP del orfebre
  - La comisión se retiene como `marketplace_fee`
  - Descriptor: "CASA ORFEBRE"
- **Marketplace Payment (fallback):** Usado cuando:
  - El carrito tiene productos de múltiples orfebres
  - El orfebre no tiene OAuth de MercadoPago conectado
  - El token OAuth del orfebre expiró y no se pudo refrescar
- **Token OAuth:** Se refresca automáticamente 7 días antes de expirar

### Comisión de la Plataforma
- **Tasa base:** 18% (Plan Esencial), 12% (Artesano), 9% (Maestro)
- **Cálculo:** `commissionAmount = Math.round(itemTotal × commissionRate)`
- **Pago al orfebre:** `artisanPayout = itemTotal - commissionAmount`
- **Según términos legales:** "La comisión cubre los costos de operación de la Plataforma, procesamiento de pagos, soporte al cliente, infraestructura tecnológica y acciones de marketing."

### Comisión de MercadoPago
- **Estimación interna:** ~4.5% del GMV (`mpCostEstimate = gmvTotal × 0.045`)
- **Absorbida por:** La plataforma (incluida dentro de la comisión cobrada al orfebre)
- **El orfebre NO paga comisión adicional de MP** — ya está incluida en el % de su plan

### Período de Retención de Fondos
1. **Pago aprobado** → Order status: `PAID`, items en `payoutStatus: HELD`
2. **Orfebre despacha** → Item status: `SHIPPED` (plazo: 3 días hábiles)
3. **Comprador confirma recepción** (o auto-confirmación a los 10 días del despacho) → Item status: `DELIVERED`
4. **Fecha de elegibilidad** se calcula según plan:
   - Maestro: `receivedAt + 2 días`
   - Artesano: `receivedAt + 7 días`
   - Esencial: `receivedAt + 14 días`
5. **Cron job diario** libera los fondos → `payoutStatus: RELEASED`
6. **Email de notificación** enviado al orfebre cuando se libera el pago

### ⚠️ Inconsistencia Detectada — Cron de Liberación
El cron job `release-payouts` tiene hardcodeado un período de 14 días para **todos** los orfebres, independiente del plan. Esto significa que Maestro y Artesano podrían esperar más de lo prometido por su plan. La fecha `payoutEligibleAt` se calcula correctamente por plan, pero el cron no la usa.

### Panel Financiero del Orfebre
El orfebre ve en `/portal/orfebre/finanzas`:
- **Total Ventas** — suma de (precio × cantidad) de todos sus items
- **Total Comisiones** — suma de comisiones cobradas
- **Pago Neto** — suma de artisanPayout
- **Tasa de comisión** mostrada: "Tu comisión es del X%. Esto incluye el procesamiento de pagos."
- **Tabla de transacciones:** Fecha, Producto, Precio venta, Comisión %, Comisión $, Pago neto $
- **Limitación:** No distingue entre pagos HELD vs RELEASED

### Panel Financiero del Admin
- GMV Total
- Comisiones Brutas
- Costo Estimado MP (~4.5%)
- Comisiones Netas
- Pagos Pendientes a Orfebres (items en HELD)

---

## 3. Despacho y Envíos

### Responsabilidad del Despacho
- **El orfebre es responsable directo** del despacho
- Casa Orfebre es intermediario tecnológico: no almacena ni despacha productos
- El orfebre debe embalar adecuadamente y contratar el courier

### Plazo de Despacho
- **3 días hábiles** desde la confirmación del pedido (según términos)
- El portal muestra alertas visuales:
  - 0-3 días: normal
  - 3-5 días: advertencia amarilla
  - 5+ días: urgente/rojo

### Carriers Configurados
Dropdown en el portal del orfebre al marcar como despachado:
1. **Chilexpress**
2. **Starken**
3. **Blue Express**
4. **Otro** (campo libre)

### Tracking
- **Obligatorio:** El orfebre debe ingresar número de tracking y carrier al despachar
- **Visible al comprador:** En su portal de pedidos con enlace al carrier
- **Notificación:** Email automático al comprador con datos de tracking

### Zonas de Envío
- **16 regiones de Chile** configuradas con precios y tiempos independientes
- **Administrable por admin:** nombre, precio, días estimados, regiones incluidas, estado activo
- **NO hay envío internacional**

### Costo de Envío
- **Envío gratis:** Habilitado por defecto sobre CLP $100.000 de compra (configurable por admin)
- **Bajo el umbral:** Se cobra el precio de la zona de envío correspondiente
- **Quién paga:** El comprador (incluido en el total del checkout)

### Plazos de Entrega (según términos y FAQ)
| Zona | Plazo |
|------|-------|
| Santiago Metropolitana | 2-4 días hábiles (FAQ) / 3-7 desde despacho (términos) |
| Regiones normales | 4-7 días hábiles |
| Zonas extremas (Arica, Punta Arenas, Aysén, islas) | Hasta 10 días hábiles |
| Pedidos a medida (MADE_TO_ORDER) | Tiempo de producción adicional indicado en cada producto |

### Auto-confirmación de Recepción
- Si el comprador no confirma recepción manualmente, se auto-confirma a los **10 días** del despacho
- Emails enviados al comprador y orfebre notificando la auto-confirmación

---

## 4. Devoluciones y Garantías

### Plazo de Devolución
- **Términos legales:** 14 días calendario desde la recepción
- **⚠️ FAQ dice:** 30 días desde la recepción — **INCONSISTENCIA**

### Condiciones para Devolver
- Producto en condición original, sin uso
- Embalaje, accesorios, certificados y etiquetas intactos
- **Piezas personalizadas/a medida (MADE_TO_ORDER): NO tienen devolución** (excepto defectos de fabricación)

### Razones de Devolución Disponibles
| Razón | Envío de devolución pagado por |
|-------|-------------------------------|
| No coincide con la descripción | Plataforma |
| Llegó dañado | Plataforma |
| Producto equivocado | Plataforma |
| Defecto de fabricación | Plataforma |
| Arrepentimiento del comprador | Comprador |
| Otro | Plataforma |

### Flujo de Devolución
1. Comprador solicita devolución (con razón, descripción y fotos)
2. Admin revisa y **aprueba** o **rechaza** (con motivo)
3. Si aprobada: comprador envía producto de vuelta con tracking
4. Orfebre confirma recepción del producto devuelto
5. Admin procesa reembolso (monto en CLP)
6. Reembolso vía método de pago original (MercadoPago)
7. **Plazo de procesamiento:** 10 días hábiles

### Estados de Devolución
`REQUESTED → APPROVED → SHIPPED_BACK → RECEIVED_BY_ARTISAN → REFUNDED → CLOSED`
Alternativa: `REQUESTED → REJECTED`

### Garantías
- **Configurada por el orfebre** al crear el producto (campo opcional `garantia`)
- **Opciones preset disponibles:**
  - 6 meses por defectos de fabricación
  - 1 año por defectos de fabricación
  - De por vida en soldaduras
  - 3 meses por defectos de fabricación
  - Garantía limitada: no cubre mal uso
  - Incluye una reparación gratuita dentro del primer año
- **FAQ indica:** 6 meses por defectos de fabricación (soldaduras, engastes sueltos, acabado)
- **Exclusiones:** Desgaste natural (pátina en plata/cobre) no cubierto

### Disputas
- **Razones:** No corresponde a descripción, No recibido, Dañado, Producto equivocado, Otro
- **Estados:** OPEN → UNDER_REVIEW → RESOLVED (con refund total, parcial, o sin refund) → CLOSED
- **Escalamiento:**
  1. Contacto directo comprador-orfebre (5 días hábiles)
  2. Mediación de Casa Orfebre (10 días hábiles, revisión de evidencia)
  3. Resolución administrativa vinculante
  4. Opciones externas: tribunales, SERNAC

---

## 5. Portal del Orfebre — Funcionalidades Completas

### Dashboard (`/portal/orfebre/`)
- Productos Activos (contador)
- Pedidos Pendientes (PENDING + PREPARING)
- Ventas del Mes (items vendidos este mes)
- Preguntas sin Responder (contador)
- Indicador de plan actual con barra de uso de productos
- Tiempo restante de suscripción
- Estado de conexión con MercadoPago
- Alertas de período de gracia

### Gestión de Productos (`/portal/orfebre/productos/`)
**Estados:** DRAFT → PENDING_REVIEW → APPROVED / REJECTED → PAUSED / SOLD_OUT

**Campos del producto:**
- Nombre, descripción, historia de la pieza
- Categoría (select único)
- Materiales (multi-select)
- Técnica
- Precio y precio comparativo (tachado)
- Tipo de producción:
  - **UNIQUE:** stock=1, retornable
  - **MADE_TO_ORDER:** stock=0, no retornable, requiere días de elaboración
  - **LIMITED:** stock configurable por talla/variante
- Variantes (talla/stock para tipo LIMITED)
- Tallas de anillo: 4 a 13 en incrementos de 0.5
- Personalizable (toggle + descripción)
- Talla única / ajuste arriba-abajo (mm)
- Guía de tallas (link)
- Largo cadena (cm), diámetro (mm)
- Cuidados (presets + personalizado)
- Empaque (presets + personalizado)
- Garantía (presets + personalizado)
- Especialidades y ocasiones
- Colecciones

**Imágenes:**
- Formatos: JPG, PNG, WebP
- Tamaño máximo: 10 MB por imagen
- Límite según plan (3 / 6 / ilimitadas)
- Almacenamiento: Cloudflare R2
- Estado de revisión por imagen

**Video:**
- Solo disponible en planes con `videoEnabled: true` (Maestro)
- Procesado vía Cloudflare Stream
- Estados: PENDING → PROCESSING → READY / FAILED

### Gestión de Pedidos (`/portal/orfebre/pedidos/`)
- Filtros: Todos, Pendientes, Preparando, Despachados, Entregados
- Flujo: PENDING → PREPARING → SHIPPED → DELIVERED
- Acciones:
  1. **Confirmar preparación** → email al comprador y admin
  2. **Marcar como despachado** → requiere tracking number + carrier → email con tracking
  3. **Marcar como entregado** → genera certificado automático + emails
- Info visible: productos, cantidades, precios, pago neto, dirección de envío
- Pedidos regalo: muestra mensaje de regalo e indicador de empaque especial
- Alertas de tiempo (3 días warning, 5+ días urgente)

### Preguntas (`/portal/orfebre/preguntas/`)
- Filtros: Sin responder, Respondidas
- Vista: nombre del comprador, producto, pregunta, fecha
- Formulario de respuesta inline
- Filtro anti-contacto aplicado a respuestas

### Mensajería (`/portal/orfebre/mensajes/`)
- Lista de conversaciones con: avatar, nombre, producto, último mensaje, tiempo, no leídos
- Tiempo promedio de respuesta calculado
- Chat en tiempo real con filtro anti-intermediación
- Conversaciones pueden ser bloqueadas por admin

### Finanzas (`/portal/orfebre/finanzas/`)
- Tarjetas resumen: Total ventas, Total comisiones, Pago neto
- Tasa de comisión mostrada
- Tabla de transacciones detallada

### Estadísticas (`/portal/orfebre/estadisticas/`)
**Básicas (Plan Artesano+):**
- Ventas mensuales (unidades y monto)
- Ingreso neto mensual
- Total de vistas de productos
- Variación mes a mes (%)
- Top 5 productos más vistos
- Gráfico de ventas (6 meses)

**Avanzadas (Plan Maestro):**
- Comparación mes anterior vs actual
- Tasa de conversión por producto (ventas ÷ vistas)
- Productos en favoritos sin comprar (últimos 90 días)
- Gráfico de ingresos netos (6 meses)
- Features bloqueadas muestran preview borroso + botón de upgrade

### Colecciones (`/portal/orfebre/colecciones/`)
- Crear, editar, eliminar colecciones
- Nombre, descripción, conteo de productos

### Perfil (`/portal/orfebre/perfil/`)
**Campos editables:**
- Nombre artístico (displayName)
- Bio y historia
- Especialidad principal
- Materiales (lista)
- Ubicación (ciudad + región)
- Video URL (YouTube/Vimeo)
- Imagen de perfil (5 MB max, JPG/PNG/WebP)
- Años de experiencia
- Premios/reconocimientos
- Slug (auto-generado, solo lectura)

### Plan (`/portal/orfebre/plan/`)
- Resumen del plan actual
- Selector de planes disponibles
- Cambio de plan con pago vía MercadoPago
- Soporte mensual y anual

### Herramientas (`/portal/orfebre/herramientas/`)
- **Calculadora de precios:** ingresa costos de materiales + tiempo de trabajo → calcula precio sugerido con comisión incluida

### Gestión de Productos en Período de Gracia (`/portal/orfebre/gestionar-productos/`)
- Aparece cuando la suscripción expira y tiene más productos que el límite del plan inferior
- Permite seleccionar qué productos mantener activos
- Los no seleccionados se pausan (no se eliminan)

---

## 6. Proceso de Onboarding

### Flujo de Invitación
1. **Admin crea invitación** en `/portal/admin/invitaciones/` (individual o CSV masivo)
2. **Se genera código promo** con formato `PIONERO-{NOMBRE}-2026`
3. **Se envía email** con `sendPioneerInvitationEmail()`:
   - Invitación exclusiva
   - Detalle del plan y beneficios
   - Código personal
   - Botón CTA → `/postular?code={código}`

### Tracking de Invitación
| Estado | Significado |
|--------|-------------|
| DRAFT | Creada, no enviada |
| SENT | Email enviado (registra `sentAt`) |
| OPENED | Link clickeado (registra `openedAt`) |
| APPLIED | Postulación enviada (registra `appliedAt`) |
| REDEEMED | Postulación aprobada (registra `redeemedAt`) |
| EXPIRED | Código expirado |

### Formulario de Postulación (`/postular`)
**Campos capturados:**
- Nombre completo
- Email
- Región y ubicación
- Especialidad
- Bio
- Materiales
- Teléfono
- Años de experiencia
- Imágenes de portfolio

### Aprobación / Rechazo
- **Aprobación** (`approveApplication()`):
  1. Crea User con role `ARTISAN`
  2. Crea perfil de Artisan con status `APPROVED`
  3. Aplica código promo si existe
  4. Envía email de bienvenida con instrucciones de login y detalles del plan
- **Rechazo** (`rejectApplication()`):
  1. Status → `REJECTED`
  2. Envía email con motivo del rechazo

### Estados del Orfebre (ArtisanStatus)
| Estado | Descripción |
|--------|-------------|
| PENDING | Inicial (raro en práctica) |
| APPROVED | Activo, puede publicar productos |
| REJECTED | Postulación rechazada |
| SUSPENDED | Bloqueado por admin |

### Métricas de Campaña (Admin)
- Total de invitaciones
- Enviadas, abiertas, aplicadas, redimidas, expiradas
- Tasas de conversión por paso del funnel

---

## 7. Anti-Intermediación

### Datos del Comprador Visibles al Orfebre
**SÍ ve:**
- Nombre del envío (shippingName)
- Dirección completa de envío (calle, ciudad, región, código postal)
- Fecha del pedido
- Si es pedido regalo (mensaje + empaque)

**NO ve (excluido explícitamente en query):**
- Email del comprador
- Teléfono del comprador
- ID de usuario del comprador

### Filtro de Mensajes en Chat
Dos capas de filtrado:

**Capa 1 — `contact-filter.ts`:**
- Teléfonos chilenos (+569, 569, 09...)
- Emails (regex estándar)
- URLs (https://, www., .com, .cl, .net, .org, .io)
- Redes sociales (Instagram, WhatsApp, Facebook, Telegram, Twitter, TikTok, LinkedIn, YouTube)
- Palabras clave de contacto ("mi número", "escríbeme", "contáctame", "llamame", "mi whatsapp", "mi insta", etc.)

**Capa 2 — `chat-filter.ts` (más avanzado):**
- Teléfonos con espacios/guiones
- Números escritos en palabras (cuatro o más números en español seguidos)
- Email ofuscado ("arroba", "word at word dot com")
- Redes sociales con variaciones (wsp, wapp, whats app, insta, ig, fb)
- Intentos directos ("por fuera", "te doy mi número", "mi correo", "contacto directo")

### Manejo de Mensajes Bloqueados
- Mensaje guardado en BD con `isBlocked: true` y `blockedReason`
- Conversación marcada con `hasBypassAttempt: true`
- Respuesta al usuario: "No está permitido compartir datos de contacto. Toda comunicación debe realizarse a través de Casa Orfebre."
- Admin puede filtrar conversaciones con intentos de bypass
- Admin puede bloquear conversaciones completas

### Protección contra Bypass
- Sin excepciones por plan premium
- Sin API para desactivar filtros
- Filtro aplicado tanto en chat como en respuestas a preguntas
- Conversaciones bloqueables por admin (sin input de mensajes)

---

## 8. Facturación y Aspectos Tributarios

### IVA
- **Según términos:** "Los precios publicados en la Plataforma incluyen IVA cuando corresponda según la normativa tributaria vigente en Chile."
- **En la BD:** El campo `price` es un entero en CLP, sin campo separado de IVA

### Facturación Plataforma → Orfebre
- **No existe modelo de Invoice/Factura en el código**
- La comisión se deduce automáticamente del pago (en Split Payment se retiene como `marketplace_fee`)
- **No hay emisión de boleta ni factura** de Casa Orfebre al orfebre por la comisión

### Facturación Orfebre → Comprador
- **No hay mención** en el código de que el orfebre deba emitir boleta al comprador
- **MercadoPago genera sus propios comprobantes** del pago

### Responsabilidad Tributaria del Orfebre
- Según términos: el orfebre es responsable de su propio cumplimiento tributario
- La plataforma no gestiona declaraciones de impuestos del orfebre

---

## 9. Certificados de Autenticidad

### Generación
- **Automática** al marcar un pedido como `DELIVERED`
- Función `createCertificate()` ejecutada en `markAsDelivered()`

### Código del Certificado
- **Formato:** `CO-CERT-{8 caracteres alfanuméricos}`
- **Caracteres usados:** A-Z (sin I, O) + 2-9 (sin 0, 1) — para legibilidad en QR
- **Unicidad:** Enforced en base de datos

### Información Incluida
| Campo | Fuente |
|-------|--------|
| Código único | Generado (CO-CERT-XXXXXXXX) |
| Nombre de la pieza | product.name |
| Materiales | product.materials (array) |
| Técnica | product.technique |
| Nombre del artesano | artisan.displayName |
| Fecha de emisión | Timestamp de creación |

### QR Verificable
- **URL:** `{APP_URL}/verificar/{código}`
- **Generado en:** SVG (para PDF), PNG Data URI (para email), PNG Buffer (para CID inline)
- **Página pública de verificación** muestra: código, nombre pieza (con link), materiales, técnica, artesano, fecha, QR
- **Disclaimer:** "no sustituye un ensayo metalúrgico de laboratorio"

### Almacenamiento
- En base de datos (modelo `Certificate`)
- Relacionado a Product y OrderItem

### Distribución
- **Email automático** al comprador con los datos del certificado
- **PDF imprimible** vía `/api/certificates/[code]/pdf` (con marca de agua "CASA ORFEBRE")
- **QR image** vía `/api/certificates/[code]/qr` (cache inmutable, 1 año)
- **Reenvío manual** por admin vía `/api/certificates/[code]/send`

### Disponibilidad por Plan
- **Esencial:** No incluye certificado
- **Artesano:** Sí incluye certificado
- **Maestro:** Sí incluye certificado

---

## 10. Emails y Comunicaciones

### Emails que Recibe el Orfebre (17 emails)

**Onboarding:**
1. `sendPioneerInvitationEmail()` — Invitación exclusiva con código promo
2. `sendArtisanWelcomeEmail()` — Bienvenida con instrucciones de login y plan

**Pedidos:**
3. `sendNewOrderToArtisanEmail()` — Nueva venta (producto, cantidad, dirección de envío)
4. `sendReceiptConfirmedToArtisanEmail()` — Comprador confirmó recepción
5. `sendAutoConfirmToArtisanEmail()` — Recepción auto-confirmada (10 días)

**Productos:**
6. `sendProductApprovedEmail()` — Producto aprobado
7. `sendProductRejectedEmail()` — Producto rechazado (con razón del admin)

**Preguntas y Mensajes:**
8. `sendNewQuestionEmail()` — Nueva pregunta sobre un producto
9. `sendNewMessageEmail()` — Nuevo mensaje en conversación

**Devoluciones y Disputas:**
10. `sendReturnRequestedEmail()` — Solicitud de devolución recibida
11. `sendDisputeOpenedEmail()` — Disputa abierta

**Pagos:**
12. `sendPayoutReleasedEmail()` — Pago liberado a MercadoPago
13. `sendPayoutReleasedDetailedEmail()` — Detalle del pago liberado

**Suscripciones:**
14. `sendSubscriptionActivatedEmail()` — Plan activado
15. `sendSubscriptionRenewalEmail()` — Renovación del plan
16. `sendSubscriptionReminderEmail()` — Plan por expirar (7 días antes)
17. `sendSubscriptionExpiredEmail()` — Plan expirado

**Otros emails relacionados:**
- `sendPreExpirationEmail()` — Aviso de pre-expiración
- `sendGracePeriodEmail()` — Período de gracia iniciado
- `sendDowngradeCompletedEmail()` — Cambio de plan completado
- `sendShipmentAlertEmail()` — Alerta de despacho al admin

### Emails que Recibe el Comprador (15 emails)
1. Verificación de email
2. Reset de contraseña
3. Bienvenida
4. Confirmación de compra
5. Pedido en preparación
6. Pedido despachado (con tracking)
7. Pedido entregado
8. Certificado de autenticidad
9. Devolución aprobada / rechazada
10. Producto devuelto recibido
11. Reembolso procesado
12. Pregunta respondida
13. Recordatorio de reseña
14. Gift card (receptor y comprador)
15. Auto-confirmación de recepción

### Emails al Admin
- Nuevo pedido
- Cambios de estado de pedido (cada transición)
- Alertas de despacho
- Notificación de devoluciones

### Newsletter / Marketing
- **No implementado** en el código actual — no hay sistema de newsletter ni emails de marketing

---

## DATOS NO ENCONTRADOS / NO IMPLEMENTADOS

| Elemento | Estado |
|----------|--------|
| Newsletter / email marketing | No implementado |
| Facturación electrónica (boleta/factura al orfebre) | No implementado — no existe modelo Invoice |
| Integración con SII | No implementada |
| Envío internacional | No implementado (solo Chile continental) |
| Integración directa con courier (API Chilexpress, etc.) | No implementada — tracking es manual |
| Programa de referidos entre orfebres | Parcialmente implementado (hay sistema de referrals pero orientado a compradores) |
| App móvil nativa | No existe — es web responsive |
| Chat en vivo de soporte | No implementado — soporte via email |
| Sistema de reseñas del orfebre por compradores | Parcialmente visible (hay `sendReviewReminderEmail` pero el sistema de reviews no fue auditado en detalle) |

---

## INCONSISTENCIAS DETECTADAS

### 1. Plazo de Devolución
- **Términos legales (`terminos/page.tsx` línea 226):** 14 días calendario
- **FAQ (`preguntas-frecuentes/page.tsx`):** 30 días
- **Backend (`returns.ts` línea 31):** Valida 14 días
- **Veredicto:** El código enforce 14 días. El FAQ está desactualizado.

### 2. Frecuencia de Pago por Plan vs Cron Real
- **Seed data y UI:** Maestro=48h, Artesano=7 días, Esencial=14 días
- **Cron `release-payouts`:** Hardcoded a 14 días para TODOS
- **`payoutEligibleAt`:** Se calcula correctamente por plan en `confirm-receipt.ts`
- **Veredicto:** El cron no respeta la frecuencia del plan. Los orfebres Maestro y Artesano podrían esperar más de lo prometido.

### 3. Plazos de Entrega Metropolitana
- **Términos:** 3-7 días hábiles desde despacho
- **FAQ:** 2-4 días hábiles
- **Veredicto:** Ambos son rangos estimados, pero difieren.

### 4. Comisión Mencionada en Términos vs Planes
- **Términos:** Mencionan "18%" como tasa fija
- **Código:** 18% es solo Plan Esencial; Artesano=12%, Maestro=9%
- **Veredicto:** Los términos deberían mencionar que la comisión varía según el plan.

### 5. Fotos por Producto Artesano
- **Seed data (`seed.ts`):** maxPhotosPerProduct = 6
- **Plan limits fallback (`plan-limits.ts`):** Default esencial = 3
- **Veredicto:** Consistente, pero en la investigación del portal se mencionó "5" — verificar dato exacto en seed (es 6).
