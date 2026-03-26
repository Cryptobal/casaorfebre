import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <Image src="/casaorfebre-logo-light.svg" alt="Casa Orfebre" width={280} height={64} priority />
      <p className="mt-6 font-serif text-3xl font-light italic text-text-secondary">
        Joyería de Autor
      </p>
      <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-text-tertiary">
        Piezas únicas nacidas de manos chilenas. Cada joya cuenta una historia,
        cada orfebre es un artista verificado.
      </p>
      <p className="mt-8 rounded-full border border-border px-6 py-2 text-xs uppercase tracking-widest text-text-tertiary">
        Próximamente
      </p>
    </div>
  );
}
