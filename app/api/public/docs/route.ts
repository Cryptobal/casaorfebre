export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl").replace(/\/$/, "");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Casa Orfebre — API Pública</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1a1a18; line-height: 1.6; }
    h1 { font-family: Georgia, serif; font-weight: 300; color: #1a1a18; }
    h2 { font-family: Georgia, serif; font-weight: 400; margin-top: 2rem; border-bottom: 1px solid #e8e5df; padding-bottom: 0.5rem; }
    code { background: #f5f3ef; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
    pre { background: #f5f3ef; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.85em; }
    a { color: #8B7355; }
    .endpoint { margin: 1rem 0; padding: 1rem; border: 1px solid #e8e5df; border-radius: 8px; }
    .method { display: inline-block; background: #8B7355; color: white; padding: 0.1em 0.5em; border-radius: 4px; font-size: 0.8em; font-weight: 600; }
    .param { display: flex; gap: 0.5rem; margin: 0.3rem 0; }
    .param-name { font-weight: 600; min-width: 100px; }
    .param-desc { color: #6b6860; }
  </style>
</head>
<body>
  <h1>Casa Orfebre — API Pública</h1>
  <p>API de solo lectura para acceder al catálogo de joyería artesanal chilena de Casa Orfebre. Ideal para agentes de IA, integraciones y aplicaciones de terceros.</p>
  <p>Base URL: <code>${baseUrl}</code></p>
  <p>Todas las respuestas son JSON. CORS habilitado. Cache: 1 hora.</p>

  <h2>Endpoints</h2>

  <div class="endpoint">
    <p><span class="method">GET</span> <code>/api/public/products</code></p>
    <p>Lista de productos aprobados con filtros.</p>
    <p><strong>Parámetros (query string):</strong></p>
    <div class="param"><span class="param-name">category</span><span class="param-desc">Filtrar por slug de categoría (ej: anillos, collares)</span></div>
    <div class="param"><span class="param-name">material</span><span class="param-desc">Filtrar por nombre de material (ej: plata, oro)</span></div>
    <div class="param"><span class="param-name">occasion</span><span class="param-desc">Filtrar por slug de ocasión (ej: compromiso, dia-de-la-madre)</span></div>
    <div class="param"><span class="param-name">style</span><span class="param-desc">Filtrar por slug de especialidad/estilo</span></div>
    <div class="param"><span class="param-name">minPrice</span><span class="param-desc">Precio mínimo en CLP</span></div>
    <div class="param"><span class="param-name">maxPrice</span><span class="param-desc">Precio máximo en CLP</span></div>
    <div class="param"><span class="param-name">sort</span><span class="param-desc">newest (default), price_asc, price_desc, popular</span></div>
    <div class="param"><span class="param-name">limit</span><span class="param-desc">Máximo 100, default 20</span></div>
    <div class="param"><span class="param-name">offset</span><span class="param-desc">Para paginación, default 0</span></div>
    <p><strong>Ejemplo:</strong></p>
    <pre>GET ${baseUrl}/api/public/products?category=anillos&maxPrice=50000&sort=price_asc&limit=10</pre>
  </div>

  <div class="endpoint">
    <p><span class="method">GET</span> <code>/api/public/products/{slug}</code></p>
    <p>Detalle completo de un producto por slug.</p>
    <p><strong>Ejemplo:</strong></p>
    <pre>GET ${baseUrl}/api/public/products/anillo-luna-plata-925</pre>
  </div>

  <div class="endpoint">
    <p><span class="method">GET</span> <code>/api/public/artisans</code></p>
    <p>Lista de orfebres verificados con productos aprobados.</p>
    <p>Retorna: nombre, ubicación, especialidad, rating, cantidad de productos.</p>
    <p><strong>Ejemplo:</strong></p>
    <pre>GET ${baseUrl}/api/public/artisans</pre>
  </div>

  <div class="endpoint">
    <p><span class="method">GET</span> <code>/api/public/collections</code></p>
    <p>Colecciones curadas activas.</p>
    <p>Retorna: nombre, descripción, imagen de portada, cantidad de productos.</p>
    <p><strong>Ejemplo:</strong></p>
    <pre>GET ${baseUrl}/api/public/collections</pre>
  </div>

  <h2>Notas</h2>
  <ul>
    <li>Los precios están en CLP (pesos chilenos).</li>
    <li>Las imágenes son URLs absolutas.</li>
    <li>No se exponen datos sensibles (emails, IDs de pago, datos bancarios).</li>
    <li>Rate limit implícito: por favor no excedas 60 requests por minuto.</li>
    <li>Para más información: <a href="${baseUrl}/llms.txt">${baseUrl}/llms.txt</a></li>
  </ul>

  <h2>Contacto</h2>
  <p>Email: <a href="mailto:contacto@casaorfebre.cl">contacto@casaorfebre.cl</a></p>
  <p>Web: <a href="${baseUrl}">${baseUrl}</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
