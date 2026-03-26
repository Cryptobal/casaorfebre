export const metadata = { title: "Términos y Condiciones" };

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-3xl font-light">Términos y Condiciones</h1>
      <p className="mt-4 text-sm text-text-tertiary">Última actualización: marzo 2026</p>
      <div className="mt-8 space-y-8 text-text-secondary font-light leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-medium text-text">1. Aceptación de los Términos</h2>
          <p className="mt-2">Al acceder y utilizar Casa Orfebre, aceptas estos términos y condiciones...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">2. Descripción del Servicio</h2>
          <p className="mt-2">Casa Orfebre es un marketplace curado de joyería artesanal chilena...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">3. Cuentas de Usuario</h2>
          <p className="mt-2">Para realizar compras debes crear una cuenta proporcionando información veraz...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">4. Compras y Pagos</h2>
          <p className="mt-2">Todos los pagos se procesan de forma segura a través de Mercado Pago...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">5. Envíos y Entregas</h2>
          <p className="mt-2">Los productos son despachados directamente por cada orfebre...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">6. Devoluciones y Reembolsos</h2>
          <p className="mt-2">Consulta nuestra <a href="/garantia" className="text-accent hover:underline">Política de Garantía</a> para información detallada...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">7. Propiedad Intelectual</h2>
          <p className="mt-2">Todo el contenido de Casa Orfebre está protegido por derechos de autor...</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-text">8. Contacto</h2>
          <p className="mt-2">Para consultas: soporte@casaorfebre.cl</p>
        </section>
      </div>
    </div>
  );
}
