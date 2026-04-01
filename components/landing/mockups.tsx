import { Ico, ICON } from './icons';

export function BrowserChrome({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-[#f0ede8] px-3 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#e8e5df]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#e8e5df]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#e8e5df]" />
        </div>
        <div className="mx-2 flex-1 rounded bg-white px-3 py-1 text-[10px] font-light text-text-tertiary">
          {url}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function MockupProfile() {
  return (
    <BrowserChrome url="casaorfebre.cl/orfebres/tu-nombre">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 font-serif text-2xl font-light text-accent">
          MJ
        </div>
        <div className="text-center">
          <p className="font-serif text-lg font-light text-text">María José López</p>
          <p className="text-xs text-text-tertiary">Valparaíso, Chile</p>
        </div>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-medium text-accent">
          Artesano Verificado
        </span>
        <p className="max-w-[200px] text-center text-[10px] font-light leading-relaxed text-text-secondary">
          Orfebre autodidacta especializada en plata 950 y piedras nativas del sur de Chile.
        </p>
        <div className="mt-1 grid w-full grid-cols-3 gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded bg-[#f0ede8]" />
          ))}
        </div>
      </div>
    </BrowserChrome>
  );
}

export function MockupProduct() {
  return (
    <BrowserChrome url="casaorfebre.cl/coleccion/anillo-luna-nueva">
      <div className="flex gap-4">
        <div className="aspect-[3/4] w-28 shrink-0 rounded bg-[#f0ede8]" />
        <div className="flex flex-col gap-1.5 text-left">
          <p className="font-serif text-sm font-light text-text">Anillo Luna Nueva</p>
          <p className="font-serif text-lg font-light text-accent">$89.990</p>
          <div className="flex flex-wrap gap-1">
            <span className="rounded bg-[#f0ede8] px-1.5 py-0.5 text-[9px] text-text-secondary">Plata 950</span>
            <span className="rounded bg-[#f0ede8] px-1.5 py-0.5 text-[9px] text-text-secondary">Piedra Luna</span>
          </div>
          <span className="mt-0.5 text-[9px] font-medium text-accent">Pieza Única</span>
          <div className="mt-1 rounded bg-accent px-3 py-1 text-center text-[10px] text-white">
            Agregar al carrito
          </div>
          <p className="mt-1 text-[9px] text-text-tertiary">por María José López</p>
          <div className="flex items-center gap-1 text-[9px] text-accent">
            <Ico d={ICON.qr} className="h-3 w-3" />
            Certificado QR
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
}

export function MockupDashboard() {
  return (
    <BrowserChrome url="casaorfebre.cl/portal/orfebre">
      <div className="flex gap-3">
        <div className="hidden w-24 shrink-0 space-y-1.5 border-r border-border pr-3 sm:block">
          {['Mi Taller', 'Mis Piezas', 'Pedidos', 'Preguntas', 'Finanzas', 'Mi Perfil'].map((item) => (
            <div key={item} className="rounded px-2 py-1 text-[9px] font-light text-text-secondary first:bg-accent/10 first:text-accent">
              {item}
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Ventas mes', value: '$340.000' },
              { label: 'Pedidos', value: '4' },
              { label: 'Productos', value: '12' },
              { label: 'Rating', value: '4.9 \u2605' },
            ].map((s) => (
              <div key={s.label} className="rounded border border-border p-2 text-center">
                <p className="font-serif text-sm font-light text-text">{s.value}</p>
                <p className="text-[8px] text-text-tertiary">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="h-16 rounded bg-[#f0ede8]" />
        </div>
      </div>
    </BrowserChrome>
  );
}
