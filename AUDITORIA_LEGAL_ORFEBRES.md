# Auditoría Legal — Casa Orfebre

## Fecha: 31 de marzo de 2026

> **Aviso**: Este documento es un análisis técnico-legal preparado como punto de partida.
> Los textos legales propuestos **deben ser revisados y validados por un abogado**
> especializado en derecho comercial digital y protección al consumidor en Chile
> antes de su implementación.

---

## 1. Estado actual

### 1.1 Documentos legales existentes

| Documento | Ruta | Última actualización | Alcance |
|-----------|------|---------------------|---------|
| Términos y Condiciones | `app/(public)/terminos/page.tsx` | 26 marzo 2026 | General (compradores y orfebres) |
| Política de Privacidad | `app/(public)/privacidad/page.tsx` | 26 marzo 2026 | General — Ley 19.628 |
| Garantía | `app/(public)/garantia/page.tsx` | Sin fecha visible | Orientado al comprador |
| FAQ | `app/(public)/preguntas-frecuentes/page.tsx` | Sin fecha visible | General |

**Documentos que NO existen:**

| Documento faltante | Criticidad |
|-------------------|-----------|
| **Acuerdo de Orfebre** (Seller Agreement) | 🔴 CRÍTICO |
| Política de Propiedad Intelectual (separada) | 🟡 IMPORTANTE |
| Política de Uso Aceptable / Estándares de Calidad | 🟡 IMPORTANTE |
| Política de Anti-intermediación (para el orfebre) | 🟢 DESEABLE |
| Aviso legal / Identificación del prestador | 🟡 IMPORTANTE |

### 1.2 Flujo de aceptación actual

**Flujo completo del orfebre auditado:**

```
Admin envía invitación → Email con código promo (sin texto legal)
     ↓
Orfebre hace clic → /postular?code=PIONERO-NOMBRE-2026
     ↓
Formulario de postulación → Campos: nombre, email, región, especialidad,
                            bio, materiales, teléfono, experiencia, fotos
                            ❌ NO hay checkbox de aceptación de términos
                            ❌ NO hay referencia a ningún documento legal
     ↓
Admin aprueba → Se crea User (role=ARTISAN) + Artisan (status=APPROVED)
                ❌ NO se registra aceptación de términos
                ❌ NO se registra versión de términos aceptados
     ↓
Email de bienvenida → Instrucciones de login + detalle del plan
                      ❌ NO adjunta términos ni acuerdo
     ↓
Primer login → Dashboard del orfebre
              ❌ NO hay paso de onboarding legal
              ❌ NO se pide aceptar acuerdo antes de operar
     ↓
Primera publicación → Formulario de producto
                      ❌ NO hay declaración de autoría/originalidad
                      ❌ NO hay aceptación de estándares de calidad
```

**Resultado: El orfebre puede operar en la plataforma sin haber aceptado NINGÚN documento legal de manera explícita y verificable.**

### 1.3 Modelo de datos actual

**Modelo `User` — Campos de consentimiento:** NINGUNO

```
- No existe campo acceptedTerms / termsAcceptedAt
- No existe campo termsVersion
- No existe campo consentIP / consentUserAgent
```

**Modelo `Artisan` — Campos de consentimiento:** NINGUNO

```
- No existe campo agreementVersion
- No existe campo agreementAcceptedAt
- No existe modelo LegalAcceptance ni similar
```

**No existe ningún modelo en Prisma** para:
- Registro de aceptación de documentos legales
- Versionamiento de términos
- Auditoría de consentimiento (IP, timestamp, user agent)

### 1.4 Cláusulas tributarias actuales

**En Términos y Condiciones (sección 5):**
- "Los precios publicados en la Plataforma incluyen IVA cuando corresponda según la normativa tributaria vigente en Chile." — Mención genérica, sin detalle.

**En el código:**
- El campo `price` en el modelo `Product` es un entero en CLP, sin campo separado de IVA.
- No existe modelo `Invoice` ni `Factura` ni `Boleta`.
- La comisión se deduce automáticamente (split payment o marketplace_fee).
- No hay emisión de documento tributario de Casa Orfebre al orfebre por la comisión cobrada.
- No hay mención de inicio de actividades, RUT, ni obligaciones tributarias del orfebre.

**Campo `rut` en Artisan:** Existe (`rut String?`), pero es opcional y no se usa en ningún flujo visible.

---

## 2. Análisis de gaps

### 2.1 Documentos faltantes

#### A. Acuerdo de Orfebre (Seller Agreement) — 🔴 CRÍTICO
El documento más importante que falta. Los Términos y Condiciones actuales son **genéricos** y tratan al orfebre como "usuario" sin distinguir sus obligaciones específicas como vendedor independiente. No existe un contrato de adhesión que regule la relación comercial plataforma-orfebre.

**Riesgos concretos sin este acuerdo:**
1. **Riesgo laboral**: Sin declaración explícita de independencia, un orfebre podría argumentar relación laboral con Casa Orfebre (especialmente si hay exclusividad de hecho).
2. **Riesgo tributario**: Sin cláusula tributaria, Casa Orfebre podría ser considerada responsable solidariamente de las obligaciones tributarias del orfebre.
3. **Riesgo de propiedad intelectual**: La licencia en los términos generales es débil — un orfebre podría reclamar uso no autorizado de sus fotos en redes sociales.
4. **Riesgo de intermediación**: Sin prohibición contractual explícita, las sanciones por bypass carecen de base legal sólida.
5. **Riesgo por comisiones**: Los términos dicen "18%" pero el código aplica 18%/12%/9% según plan — discrepancia que podría generar disputas.

#### B. Aviso Legal / Identificación del Prestador — 🟡 IMPORTANTE
La Ley 19.496 exige que el prestador de servicios digitales se identifique. No hay página con:
- Razón social del operador de casaorfebre.cl
- RUT de la empresa
- Domicilio legal
- Representante legal

#### C. Política de Uso Aceptable — 🟡 IMPORTANTE
No existe documento que defina:
- Qué constituye "joyería artesanal" (vs. industrial/importada)
- Estándares mínimos de calidad
- Fotografías reales vs. stock/renders
- Productos prohibidos
- Consecuencias escalonadas por incumplimiento

### 2.2 Checklist de cláusulas (✅/❌)

#### Relación comercial

| Cláusula | Estado | Ubicación | Observación |
|----------|--------|-----------|-------------|
| Intermediario, no vendedor | ✅ | Términos §2 | Bien redactado |
| Orfebre independiente | ❌ | — | No hay declaración explícita de independencia comercial |
| Sin relación laboral | ❌ | — | Crítico — riesgo de reclamo laboral |
| Declaración de mayoría de edad | ✅ | Términos §3 | Mayor de 18 años |
| Exclusividad | ❌ | — | No se menciona (deseable dejar claro que NO hay exclusividad) |

#### Comisiones y pagos

| Cláusula | Estado | Ubicación | Observación |
|----------|--------|-----------|-------------|
| Porcentaje de comisión | ⚠️ | Términos §5 | Dice "18%" fijo — **INCONSISTENTE** con planes (18%/12%/9%) |
| Cálculo de comisión | ✅ parcial | Términos §5 | "Descontada automáticamente del monto recibido" |
| Retención de fondos | ⚠️ | Términos §5 | Dice "14 días" para todos — **INCONSISTENTE** con planes (48h/7d/14d) |
| Frecuencia de pago | ❌ | — | No se menciona (quincenal/semanal/48h según plan) |
| Qué pasa con comisión tras devolución | ❌ | — | No especificado — ¿se devuelve la comisión al orfebre? |
| Comisión de MercadoPago incluida | ❌ | — | No se informa al orfebre que la comisión ya incluye MP |
| Cambio de tarifas/comisiones | ❌ | — | Sin procedimiento de notificación de cambios de precio |
| Override de comisión por admin | ❌ | — | Existe en código pero sin base contractual |

#### Facturación y tributación

| Cláusula | Estado | Ubicación | Observación |
|----------|--------|-----------|-------------|
| Casa Orfebre factura la comisión al orfebre | ❌ | — | No hay facturación implementada ni mencionada |
| Orfebre responsable de tributar | ❌ | — | No hay cláusula de responsabilidad tributaria |
| Boleta/factura al comprador | ❌ | — | No se menciona quién emite documento al comprador |
| IVA | ⚠️ | Términos §4 | Mención genérica "incluyen IVA cuando corresponda" |
| Inicio de actividades SII | ❌ | — | No se exige ni pregunta al orfebre |
| RUT del orfebre | ⚠️ | Schema | Campo existe (`rut String?`) pero no es obligatorio ni se usa |

#### Despacho y envíos

| Cláusula | Estado | Ubicación | Observación |
|----------|--------|-----------|-------------|
| Responsabilidad del orfebre | ✅ | Términos §6 | Claro |
| Plazo de despacho | ✅ | Términos §6 | 3 días hábiles |
| Empaque adecuado | ✅ | Términos §6 | "Embalar adecuadamente" |
| Daños en tránsito | ⚠️ | Términos §6 | Dice que orfebre y comprador gestionan con courier — pero Garantía dice reembolso completo por Casa Orfebre |
| Tracking obligatorio | ✅ | Términos §6 | Sí |
| Incumplimiento de plazos | ⚠️ | Garantía | La página Garantía dice "cancelación automática y reembolso" por no despachar en 5 días, pero Términos dice 3 días — **INCONSISTENCIA** |

#### Devoluciones y garantías

| Cláusula | Estado | Ubicación | Observación |
|----------|--------|-----------|-------------|
| Plazo de devolución | ⚠️ | Términos §7, FAQ | Términos: 14 días / FAQ: 30 días — **INCONSISTENCIA** (código enforce 14) |
| Condiciones de devolución | ✅ | Términos §7 | Estado original, sin uso |
| Piezas personalizadas excluidas | ✅ | Términos §7 | "Salvo defectos de fabricación" |
| Costo envío devolución | ✅ | Términos §7 | Defecto=orfebre, arrepentimiento=comprador |
| Garantía artesanal | ✅ parcial | Garantía page | Configurable por orfebre |
| Plazo de reembolso | ✅ | Términos §7 | 10 días hábiles |

#### Propiedad intelectual

| Cláusula | Estado | Ubicación | Observación |
|----------|--------|-----------|-------------|
| Autoría del orfebre | ✅ | Términos §9 | "Propiedad intelectual de sus respectivos autores" |
| Licencia para marketing | ✅ | Términos §9 | No exclusiva, gratuita, mundial, durante la relación |
| Uso en redes sociales | ✅ | Términos §9 | Incluido en licencia |
| No reclamo de propiedad por Casa Orfebre | ✅ implícito | Términos §9 | Podría ser más explícito |
| Anti-plagio / originalidad | ❌ | — | No hay declaración de originalidad |
| Qué pasa con fotos tras baja | ❌ | — | No se define |

#### Conducta y estándares

| Cláusula | Estado | Ubicación | Observación |
|----------|--------|-----------|-------------|
| Prohibición piezas industriales | ❌ | — | No definido qué es "artesanal" |
| Estándares de calidad | ❌ | — | No existen estándares mínimos escritos |
| Fotos reales (no stock) | ❌ | — | No está prohibido usar fotos de terceros |
| Anti-bypass / intermediación | ❌ contractual | — | Existe filtro técnico pero sin base contractual |
| Consecuencias por incumplimiento | ❌ | — | No hay escala de sanciones |

#### Suspensión y baja

| Cláusula | Estado | Ubicación | Observación |
|----------|--------|-----------|-------------|
| Causales de suspensión | ❌ | — | No hay causales definidas |
| Fondos pendientes tras suspensión | ❌ | — | No se define qué pasa con el dinero |
| Baja voluntaria del orfebre | ❌ | — | No hay procedimiento |
| Preaviso de cambios | ✅ | Términos §12 | 15 días por email |

#### Datos y privacidad

| Cláusula | Estado | Ubicación | Observación |
|----------|--------|-----------|-------------|
| Recopilación de datos | ✅ | Privacidad §1 | Detallado |
| Uso de datos | ✅ | Privacidad §2 | Detallado |
| Anti-intermediación (datos del comprador) | ❌ contractual | — | Existe filtro técnico pero sin base contractual para el orfebre |
| Ley 19.628 | ✅ | Privacidad | Referencia a derechos ARCO |
| Cookies | ✅ | Privacidad | Mencionado |

#### Responsabilidad y jurisdicción

| Cláusula | Estado | Ubicación | Observación |
|----------|--------|-----------|-------------|
| No garantía de ventas | ❌ | — | No se aclara que la plataforma no garantiza ventas |
| Calidad es responsabilidad del orfebre | ✅ | Términos §8, §10 | "Bajo su exclusiva responsabilidad" |
| Indemnización al marketplace | ❌ | — | No hay cláusula de indemnidad |
| Jurisdicción Chile | ✅ | Términos §13 | Santiago de Chile |
| SERNAC | ✅ | Términos §11 | Mencionado |

### 2.3 Resumen de inconsistencias

| # | Elemento | Conflicto | Riesgo |
|---|----------|-----------|--------|
| 1 | Comisión | Términos: "18%" fijo / Código: 18%/12%/9% por plan | 🔴 Alto — orfebre Esencial podría reclamar que le cobran más de lo que dice el plan, o Maestro que los términos dicen 18% |
| 2 | Retención de fondos | Términos: "14 días" / Planes: 48h/7d/14d / Cron: hardcoded 14d | 🔴 Alto — Maestro paga plan premium esperando 48h pero recibe a los 14 días |
| 3 | Plazo devolución | Términos: 14 días / FAQ: 30 días | 🟡 Medio — comprador podría argumentar la FAQ |
| 4 | Plazo despacho | Términos: 3 días / Garantía: 5 días | 🟡 Medio — plazo inconsistente |
| 5 | Daños en tránsito | Términos: gestión con courier / Garantía: reembolso completo | 🟡 Medio — promesa distinta según página |

---

## 3. Propuesta

### 3.1 Acuerdo de Orfebre (texto completo)

---

#### ACUERDO DE ORFEBRE — CASA ORFEBRE

**Versión 1.0 — Abril 2026**

*Este Acuerdo regula la relación entre tú (el Orfebre) y Casa Orfebre (la Plataforma). Al aceptar este Acuerdo, te comprometes a cumplir con las obligaciones aquí descritas. Si tienes dudas, escríbenos a contacto@casaorfebre.cl antes de aceptar.*

---

**1. QUIÉNES SOMOS Y CÓMO FUNCIONA ESTO**

1.1. Casa Orfebre es un marketplace de intermediación. Nosotros conectamos a orfebres independientes con compradores. **No somos el vendedor** de tus piezas: tú vendes directamente al comprador a través de nuestra plataforma tecnológica.

1.2. **Eres independiente.** Este Acuerdo no crea una relación laboral, societaria ni de agencia entre tú y Casa Orfebre. Tú manejas tu taller, tus horarios, tus precios y tus técnicas de manera autónoma. No tienes exclusividad con la Plataforma: puedes vender en otros canales simultáneamente.

1.3. **Eres persona natural o jurídica.** Si operas como persona natural (con o sin inicio de actividades en SII), o como empresa (EIRL, SPA, SpA, Ltda.), el presente Acuerdo aplica de la misma manera.

---

**2. REQUISITOS PARA VENDER**

2.1. **Ser mayor de 18 años** y tener capacidad legal para celebrar contratos en Chile.

2.2. **Vender piezas de tu propia autoría o taller.** Cada pieza publicada en Casa Orfebre debe ser fabricada artesanalmente por ti o tu taller. Queda estrictamente prohibido:
   - Revender piezas industriales o fabricadas en serie por terceros.
   - Publicar piezas compradas a mayoristas o importadas como si fueran propias.
   - Presentar fotografías de piezas que no correspondan al producto real que recibirá el comprador.

2.3. **Declarar materiales con veracidad.** Los materiales que declares (tipo de metal, ley de la plata/oro, piedras, aleaciones) deben ser exactos. La declaración falsa de materiales es causal de suspensión inmediata y puede dar lugar a acciones legales.

2.4. **Mantener tus datos actualizados.** Nombre, email, dirección, teléfono y datos bancarios deben estar al día. Cualquier cambio debe actualizarse dentro de 5 días hábiles.

---

**3. COMISIONES Y PAGOS**

3.1. **Comisión por venta.** Casa Orfebre cobra una comisión sobre cada venta realizada a través de la Plataforma. La tasa de comisión depende de tu plan de membresía:

| Plan | Comisión |
|------|----------|
| Esencial (gratuito) | 18% |
| Artesano | 12% |
| Maestro | 9% |

La comisión se calcula sobre el precio de venta del producto (sin incluir el costo de envío). Esta comisión ya incluye el costo de procesamiento de pagos de MercadoPago — tú no pagas comisión adicional de MercadoPago.

3.2. **Comisión personalizada.** En casos excepcionales, Casa Orfebre podrá acordar una comisión personalizada diferente a la de tu plan. Esta se registrará en tu cuenta y prevalecerá sobre la tasa estándar del plan.

3.3. **Retención de fondos.** Como medida de protección al comprador, los fondos de cada venta son retenidos desde la fecha en que el comprador confirma la recepción del producto (o se auto-confirma a los 10 días del despacho). El período de retención varía según tu plan:

| Plan | Fondos disponibles |
|------|-------------------|
| Maestro | 2 días después de confirmar recepción |
| Artesano | 7 días después de confirmar recepción |
| Esencial | 14 días después de confirmar recepción |

3.4. **Liberación de fondos.** Los fondos se liberan automáticamente a tu cuenta de MercadoPago una vez transcurrido el período de retención, siempre que no exista un reclamo o solicitud de devolución pendiente sobre ese pedido.

3.5. **Devoluciones y comisiones.** Si una venta resulta en devolución con reembolso, Casa Orfebre devolverá la comisión cobrada sobre esa venta. Si el reembolso es parcial, la devolución de comisión será proporcional.

3.6. **Método de pago.** Todos los pagos se procesan a través de MercadoPago. Para recibir pagos, debes conectar tu cuenta de MercadoPago a la Plataforma mediante el proceso OAuth que te indicaremos.

3.7. **Cambios de comisión.** Casa Orfebre podrá modificar las tasas de comisión con un preaviso mínimo de 30 días calendario, notificado por email. Si no estás de acuerdo, podrás dar de baja tu cuenta sin penalización antes de que el cambio entre en vigor.

---

**4. SUSCRIPCIONES Y PLANES**

4.1. **Planes disponibles.** Casa Orfebre ofrece planes de membresía con distintos beneficios y niveles de servicio. Los detalles de cada plan (precio, límites, beneficios) están disponibles en la sección "Plan" de tu portal.

4.2. **Facturación.** El pago de la suscripción se realiza a través de MercadoPago, con periodicidad mensual o anual según tu elección.

4.3. **Cambio de plan.** Puedes subir de plan en cualquier momento. Si bajas de plan y tienes más productos activos que el límite del nuevo plan, tendrás 7 días de gracia para seleccionar cuáles mantener activos. Los demás se pausarán (no se eliminan).

4.4. **Promociones y códigos.** Las condiciones especiales de códigos promocionales (como el programa Pioneros) se detallan al momento de su uso y tienen vigencia limitada.

---

**5. TUS OBLIGACIONES COMO ORFEBRE**

5.1. **Calidad artesanal.** Cada pieza debe cumplir con estándares mínimos de calidad:
   - Terminación prolija (soldaduras limpias, engastes firmes, cierres funcionales).
   - Materiales reales coincidentes con la declaración.
   - Fotografías reales del producto (no renders, no fotos de stock, no fotos de catálogo de terceros).
   - Descripciones honestas y completas.

5.2. **Despacho.** Te comprometes a:
   - Despachar cada pieza dentro de los **3 días hábiles** siguientes a la confirmación del pedido (salvo piezas a medida, donde indicarás el plazo de elaboración).
   - Embalar adecuadamente para proteger la pieza durante el transporte.
   - Proporcionar un número de seguimiento (tracking) válido al despachar.
   - Usar un courier con cobertura y seguimiento (Chilexpress, Starken, Blue Express u otro de servicio equivalente).

5.3. **Atención al comprador.** Responderás consultas y mensajes a través de la Plataforma dentro de 48 horas hábiles. La comunicación con compradores debe ser respetuosa y profesional.

5.4. **Devoluciones.** Aceptarás las devoluciones aprobadas por Casa Orfebre conforme a la política de devoluciones vigente. Al recibir un producto devuelto, confirmarás su recepción dentro de 3 días hábiles.

5.5. **Garantía.** Al publicar una pieza, puedes configurar la garantía que ofreces. Si no configuras garantía, se aplica la garantía legal mínima según la Ley 19.496.

---

**6. PROHIBICIONES**

6.1. **Anti-intermediación.** Queda estrictamente prohibido:
   - Solicitar, compartir u obtener datos de contacto personales del comprador (teléfono, email, redes sociales, dirección) fuera de lo estrictamente necesario para el despacho.
   - Invitar al comprador a realizar transacciones fuera de la Plataforma.
   - Incluir materiales promocionales de otros canales de venta dentro del empaque.
   - Intentar eludir los filtros de comunicación de la Plataforma.

La Plataforma aplica filtros automáticos a las comunicaciones. Los datos de envío (nombre y dirección) se proporcionan exclusivamente para el despacho del pedido.

6.2. **Productos prohibidos.** No podrás publicar:
   - Piezas industriales, fabricadas en serie o importadas de catálogos.
   - Joyas con piedras o metales de procedencia ilegal o no declarada.
   - Falsificaciones o réplicas de marcas registradas.
   - Productos que no sean joyería artesanal u orfebrería.

6.3. **Manipulación.** No podrás:
   - Crear cuentas múltiples.
   - Inflar artificialmente precios para luego "rebajarlos".
   - Publicar reseñas falsas o incentivar reseñas a cambio de beneficios.
   - Manipular el sistema de búsqueda o ranking.

---

**7. PROPIEDAD INTELECTUAL**

7.1. **Tu contenido es tuyo.** Tú retienes la propiedad intelectual de tus fotografías, descripciones, diseños y todo contenido que publiques en Casa Orfebre.

7.2. **Licencia a la Plataforma.** Al publicar contenido, nos otorgas una licencia no exclusiva, gratuita, mundial y por el tiempo que dure nuestra relación comercial, para:
   - Exhibir tu contenido en la Plataforma.
   - Usar tus fotografías y descripciones en nuestros canales de marketing (redes sociales, newsletters, publicidad digital).
   - Redimensionar, optimizar y adaptar las imágenes para diferentes formatos.

7.3. **Tras tu baja.** Si das de baja tu cuenta, retiraremos tu contenido de la Plataforma dentro de 30 días calendario. Podremos conservar copias de respaldo para fines legales y administrativos, pero no las usaremos con fines comerciales.

7.4. **Originalidad.** Declaras que todo contenido que publicas es de tu autoría o tienes los derechos necesarios para publicarlo. Si un tercero reclama derechos sobre tu contenido, serás responsable de resolver la disputa y mantendrás a Casa Orfebre libre de responsabilidad.

---

**8. SUSPENSIÓN Y BAJA**

8.1. **Causales de suspensión.** Casa Orfebre podrá suspender temporal o definitivamente tu cuenta en los siguientes casos:
   - Venta de piezas que no sean artesanales o de tu autoría.
   - Declaración falsa de materiales.
   - Intentos reiterados de intermediación o bypass.
   - Incumplimiento reiterado de plazos de despacho (3 o más pedidos con demora en 90 días).
   - Acumulación de reclamos o devoluciones (tasa superior al 15% en un trimestre).
   - Conducta irrespetuosa o abusiva con compradores.
   - Cualquier infracción grave a este Acuerdo o a la ley.

8.2. **Procedimiento.** Antes de una suspensión definitiva, Casa Orfebre:
   1. Te notificará por email con detalle de la infracción.
   2. Te dará 5 días hábiles para responder o corregir (salvo casos graves que justifiquen suspensión inmediata).
   3. Evaluará tu respuesta y tomará una decisión final.

8.3. **Fondos pendientes tras suspensión.** Si tu cuenta es suspendida:
   - Los pedidos en curso se completarán normalmente.
   - Los fondos retenidos que no tengan reclamo pendiente se liberarán según el calendario de tu plan.
   - Los fondos asociados a reclamos o disputas quedarán retenidos hasta la resolución.

8.4. **Baja voluntaria.** Puedes dar de baja tu cuenta en cualquier momento notificando a contacto@casaorfebre.cl con 15 días de anticipación. Deberás:
   - Completar todos los pedidos pendientes.
   - Resolver o aceptar las devoluciones en curso.
   - Desconectar tu cuenta de MercadoPago una vez liberados todos los fondos.

8.5. **Efecto de la baja.** Al darte de baja:
   - Tus productos se despublicarán.
   - Tu perfil dejará de ser visible en la Plataforma.
   - Los certificados de autenticidad emitidos seguirán siendo verificables.
   - La suscripción vigente no será reembolsada por el período restante.

---

**9. RESPONSABILIDAD TRIBUTARIA**

9.1. **Tú eres responsable.** Como vendedor independiente, eres el único responsable de cumplir con tus obligaciones tributarias ante el Servicio de Impuestos Internos (SII), incluyendo:
   - Emitir boleta o factura al comprador si corresponde según tu situación tributaria.
   - Declarar y pagar el IVA si eres contribuyente de este impuesto.
   - Declarar los ingresos obtenidos a través de la Plataforma en tus declaraciones de impuestos.
   - Realizar inicio de actividades en el SII si corresponde según el volumen de tus ventas.

9.2. **Casa Orfebre como intermediario.** Casa Orfebre no actúa como agente de retención de impuestos. La comisión cobrada por Casa Orfebre corresponde a un servicio de intermediación tecnológica.

9.3. **Documentación.** Casa Orfebre pondrá a tu disposición un resumen mensual de tus ventas, comisiones y pagos netos para facilitar tu gestión tributaria. Este resumen no constituye un documento tributario.

9.4. **Facturación de la comisión.** Casa Orfebre emitirá el documento tributario correspondiente (boleta o factura) por el servicio de intermediación cobrado, según la normativa vigente. *[Nota para revisión legal: definir si Casa Orfebre ya tiene inicio de actividades y cómo se documentará la comisión]*

---

**10. PROTECCIÓN DE DATOS**

10.1. **Datos del comprador.** Los datos personales del comprador (nombre, dirección de envío) que recibes para cumplir con el despacho son confidenciales. Solo podrás usarlos para el fin de enviar el pedido correspondiente. Queda prohibido:
   - Almacenar datos de compradores fuera de la Plataforma.
   - Contactar compradores por canales externos.
   - Compartir datos de compradores con terceros.
   - Usar datos de compradores para marketing propio.

10.2. **Tus datos.** Casa Orfebre tratará tus datos personales conforme a la Política de Privacidad disponible en casaorfebre.cl/privacidad.

10.3. **Ley aplicable.** El tratamiento de datos personales se rige por la Ley N° 19.628 sobre Protección de la Vida Privada.

---

**11. MODIFICACIONES**

11.1. Casa Orfebre podrá modificar este Acuerdo con un preaviso mínimo de 15 días calendario, notificado por email. Si la modificación es sustancial (cambio de comisiones, cambio de política de retención, cambio de obligaciones), el preaviso será de 30 días.

11.2. Si no estás de acuerdo con los nuevos términos, podrás dar de baja tu cuenta antes de que entren en vigor, sin penalización.

11.3. El uso continuado de la Plataforma tras la entrada en vigor constituye aceptación del Acuerdo modificado.

---

**12. LEY APLICABLE Y JURISDICCIÓN**

12.1. Este Acuerdo se rige por las leyes de la República de Chile, en particular:
   - Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.
   - Código Civil y Código de Comercio.
   - Ley N° 19.628 sobre Protección de la Vida Privada.
   - Ley N° 20.169 sobre Competencia Desleal.

12.2. Para la resolución de cualquier controversia, las partes se someten a la jurisdicción de los tribunales ordinarios de la ciudad de Santiago de Chile.

12.3. Este Acuerdo no limita los derechos del consumidor final conforme a la Ley 19.496.

---

**13. CONTACTO**

Para consultas sobre este Acuerdo: contacto@casaorfebre.cl

---

*Al aceptar este Acuerdo, declaro que he leído y comprendido todas sus cláusulas, y me comprometo a cumplir con las obligaciones aquí establecidas.*

*Fecha de aceptación: [registrada automáticamente]*

---

### 3.2 Modelo de datos propuesto

```prisma
// Agregar al schema.prisma

model LegalAcceptance {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  documentType   LegalDocumentType
  documentVersion String  // ej: "1.0", "1.1", "2.0"
  acceptedAt     DateTime @default(now())
  ipAddress      String?
  userAgent      String?
  method         AcceptanceMethod @default(CHECKBOX)

  @@index([userId])
  @@index([documentType, documentVersion])
  @@map("legal_acceptances")
}

enum LegalDocumentType {
  SELLER_AGREEMENT        // Acuerdo de Orfebre
  TERMS_AND_CONDITIONS    // Términos y Condiciones generales
  PRIVACY_POLICY          // Política de Privacidad
  QUALITY_STANDARDS       // Estándares de Calidad (futuro)
}

enum AcceptanceMethod {
  CHECKBOX    // Checkbox en formulario
  CLICK_WRAP  // Botón "Acepto"
  BROWSE_WRAP // Uso continuado (para actualizaciones menores)
}

// Agregar relación en User:
// legalAcceptances LegalAcceptance[]
```

**Campos clave:**
- `documentVersion` — permite re-solicitar aceptación cuando cambian los términos.
- `ipAddress` + `userAgent` — evidencia probatoria de la aceptación.
- `method` — registra cómo se obtuvo el consentimiento (relevante legalmente).

### 3.3 Flujo de UI propuesto

#### A. En la postulación (`/postular`)

Agregar antes del botón "Enviar postulación":

```
☐ He leído y acepto el Acuerdo de Orfebre [enlace]
☐ He leído y acepto los Términos y Condiciones [enlace]
☐ He leído y acepto la Política de Privacidad [enlace]
```

Los tres checkboxes deben estar desmarcados por defecto. El botón de envío se deshabilita hasta que los tres estén marcados.

#### B. En el primer login post-aprobación (Onboarding Gate)

Si el orfebre aprobado no tiene `LegalAcceptance` registrada para la versión actual del Acuerdo de Orfebre:

1. Mostrar modal/página completa con el Acuerdo de Orfebre.
2. Botón "He leído y acepto el Acuerdo de Orfebre" al final.
3. No permitir acceso al portal hasta aceptar.

#### C. Re-aceptación por cambio de versión

Cuando se actualice el Acuerdo (nueva versión):
1. Al siguiente login, mostrar un banner/modal: "Hemos actualizado el Acuerdo de Orfebre. Revisa los cambios y acepta para continuar."
2. Mostrar resumen de cambios + enlace al documento completo.
3. Bloquear funcionalidades sensibles (publicar productos, despachar) hasta re-aceptar.
4. No bloquear visualización de pedidos existentes ni chat con compradores.

#### D. En la primera publicación de producto

Agregar declaración:

```
☐ Declaro que esta pieza es de mi propia autoría o taller,
  los materiales declarados son veraces, y las fotografías
  corresponden al producto real.
```

### 3.4 Checklist de implementación

#### 🔴 URGENTE — Antes de operar comercialmente

| # | Tarea | Esfuerzo | Detalle |
|---|-------|----------|---------|
| 1 | Crear página `/acuerdo-orfebre` con el Acuerdo de Orfebre | Medio | Página pública con el texto de §3.1 |
| 2 | Agregar modelo `LegalAcceptance` a Prisma | Bajo | Schema de §3.2, migración, relación en User |
| 3 | Agregar checkboxes de aceptación en `/postular` | Bajo | 3 checkboxes obligatorios antes de enviar |
| 4 | Registrar aceptación en `approveApplication()` | Bajo | Guardar LegalAcceptance al aprobar (con IP, UA) |
| 5 | Implementar Onboarding Gate en portal del orfebre | Medio | Middleware/layout que verifica aceptación vigente |
| 6 | Corregir Términos §5: comisión varía por plan | Bajo | Actualizar texto de "18%" a tabla por plan |
| 7 | Corregir Términos §5: retención varía por plan | Bajo | Actualizar texto de "14 días" a tabla por plan |
| 8 | Corregir FAQ: plazo devolución 30→14 días | Bajo | Alinear con Términos y código |
| 9 | Corregir cron `release-payouts`: usar `payoutEligibleAt` | Bajo | El cron ignora la fecha calculada por plan |
| 10 | Agregar identificación del prestador (razón social, RUT) | Bajo | Footer o página de aviso legal |

#### 🟡 IMPORTANTE — Dentro de 30 días

| # | Tarea | Esfuerzo | Detalle |
|---|-------|----------|---------|
| 11 | Corregir Garantía: plazo despacho 5→3 días | Bajo | Alinear con Términos |
| 12 | Corregir Términos §6: daños en tránsito consistente con Garantía | Bajo | Decidir una política y alinear |
| 13 | Implementar declaración de originalidad en publicación de producto | Bajo | Checkbox al crear/publicar producto |
| 14 | Crear flujo de re-aceptación por cambio de versión | Medio | Banner/modal al detectar nueva versión |
| 15 | Agregar resumen mensual de ventas/comisiones exportable | Medio | Para que el orfebre pueda tributar |
| 16 | Definir política de uso aceptable / estándares de calidad | Bajo | Documento separado con definiciones claras |
| 17 | Hacer campo RUT obligatorio para orfebres aprobados | Bajo | Validar formato RUT chileno |
| 18 | Agregar cláusula de devolución de comisión en Términos | Bajo | ¿Se devuelve comisión si hay reembolso? |

#### 🟢 DESEABLE — Dentro de 90 días

| # | Tarea | Esfuerzo | Detalle |
|---|-------|----------|---------|
| 19 | Implementar emisión de documento tributario por comisión | Alto | Integración con facturación electrónica SII |
| 20 | Crear página de procedimiento de baja voluntaria | Bajo | Formulario + flujo automatizado |
| 21 | Implementar escala de sanciones visible al orfebre | Medio | Advertencia → suspensión temporal → definitiva |
| 22 | Agregar política de post-baja para contenido (fotos) | Bajo | Timer de 30 días para eliminar contenido |
| 23 | Crear kit de onboarding legal (PDF descargable) | Bajo | Resumen del acuerdo en formato amigable |
| 24 | Versionamiento de documentos legales con diff visible | Medio | Mostrar qué cambió entre versiones |
| 25 | Consultoría legal profesional para validar todo lo anterior | — | Revisión por abogado comercialista chileno |

---

## 4. Nota sobre facturación y tributación

### Situación actual

Casa Orfebre **no emite documentos tributarios** (boleta ni factura) por la comisión cobrada a los orfebres. Esto presenta un riesgo significativo:

1. **Si Casa Orfebre tiene inicio de actividades en SII:** Debería emitir factura (B2B) o boleta (B2C) por el servicio de intermediación. La comisión es un ingreso gravado con IVA (servicio digital).

2. **Si Casa Orfebre NO tiene inicio de actividades:** Operar un marketplace cobrando comisiones sin inicio de actividades es irregular ante el SII.

### Obligaciones del orfebre

Muchos orfebres son **personas naturales sin inicio de actividades**. Según la normativa actual del SII:

- **Bajo ~$13.500.000 CLP anuales (aprox.):** Pueden operar como persona natural con boletas de honorarios o bajo el régimen simplificado (Art. 14 D Nº8 LIR), dependiendo de la habitualidad.
- **Sobre ese umbral o con habitualidad:** Deben tener inicio de actividades, emitir boletas/facturas y declarar IVA si corresponde.

### Recomendaciones tributarias

| Acción | Prioridad | Detalle |
|--------|-----------|---------|
| Consultar con contador/abogado tributario | 🔴 URGENTE | Definir la estructura tributaria de Casa Orfebre |
| Verificar inicio de actividades de Casa Orfebre | 🔴 URGENTE | Requisito para cobrar comisiones legalmente |
| Definir si comisión lleva IVA | 🔴 URGENTE | Servicio de intermediación digital → probablemente sí |
| Informar al orfebre de sus obligaciones | 🟡 IMPORTANTE | En el Acuerdo de Orfebre (§9 propuesto) |
| Implementar resumen mensual de transacciones | 🟡 IMPORTANTE | Facilita declaración tributaria del orfebre |
| Evaluar integración con facturación electrónica | 🟢 DESEABLE | Emisión automática de DTE por comisión |

### Sobre el campo RUT

El modelo `Artisan` tiene el campo `rut` como opcional. Se recomienda:
- Hacerlo **obligatorio** para orfebres aprobados (al menos antes de la primera venta).
- Validar formato de RUT chileno (XX.XXX.XXX-X).
- Considerar si solicitar copia de cédula de identidad para verificación.

---

## Anexo: Referencia normativa

| Ley | Relevancia para Casa Orfebre |
|-----|------------------------------|
| **Ley 19.496** (Protección al Consumidor) | Derechos del comprador, derecho de retracto, garantía legal, información veraz, responsabilidad del proveedor intermediario |
| **Ley 19.628** (Protección de Datos Personales) | Tratamiento de datos de compradores y orfebres, derechos ARCO, consentimiento |
| **Ley 20.169** (Competencia Desleal) | Declaración falsa de materiales, publicidad engañosa, actos de confusión |
| **Código de Comercio** | Naturaleza mercantil de la intermediación, obligaciones del comerciante |
| **DL 825** (Ley de IVA) | IVA sobre servicios de intermediación digital |
| **LIR (Art. 14 D)** | Régimen simplificado para personas naturales / micro-empresas |
| **Circular SII sobre plataformas digitales** | Obligaciones de información y retención de plataformas de intermediación |

---

> **Disclaimer final:** Este documento fue generado como herramienta de análisis técnico-legal.
> No constituye asesoría jurídica. Todos los textos propuestos deben ser revisados,
> adaptados y validados por un abogado especializado antes de su implementación.
> Particular atención requieren las secciones tributarias, que dependen de la estructura
> jurídica específica de Casa Orfebre.
