"use client";

export function MpConnectionBanner({ isConnected }: { isConnected: boolean }) {
  if (isConnected) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Mercado Pago conectado
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <div className="flex items-center justify-between gap-4">
        <p>
          Conecta tu cuenta de Mercado Pago para recibir tus pagos directamente.
          Mientras no la conectes, los pagos se procesan a través del marketplace.
        </p>
        <a
          href="/api/oauth/mercadopago"
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#009ee3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007eb5]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Conectar Mercado Pago
        </a>
      </div>
    </div>
  );
}
