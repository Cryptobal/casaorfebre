export const metadata = { title: "Política de Privacidad" };

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-3xl font-light">Política de Privacidad</h1>
      <p className="mt-4 text-sm text-text-tertiary">Última actualización: marzo 2026</p>
      <div className="mt-8 space-y-8 text-text-secondary font-light leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-medium text-text">1. Datos que Recopilamos</h2>
          <p className="mt-2">Recopilamos información personal que nos proporcionas al crear una cuenta, realizar compras o contactarnos: nombre, correo electrónico, dirección de envío y datos de pago procesados por Mercado Pago...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">2. Uso de Datos</h2>
          <p className="mt-2">Utilizamos tu información para procesar pedidos, personalizar tu experiencia, enviar comunicaciones relevantes y mejorar nuestros servicios...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">3. Cookies</h2>
          <p className="mt-2">Utilizamos cookies esenciales para el funcionamiento del sitio y cookies analíticas (Google Analytics) para comprender el uso de la plataforma. Puedes gestionar tus preferencias de cookies en tu navegador...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">4. Seguridad</h2>
          <p className="mt-2">Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, pérdida o alteración...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">5. Derechos del Usuario</h2>
          <p className="mt-2">De acuerdo con la legislación chilena, tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos personales...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">6. Contacto</h2>
          <p className="mt-2">Para consultas sobre privacidad: soporte@casaorfebre.cl</p>
        </section>
      </div>
    </div>
  );
}
