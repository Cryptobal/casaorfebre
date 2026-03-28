"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PhotographyGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
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
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
        Guia de Fotos y Video
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-text"
              aria-label="Cerrar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h2 className="mb-4 font-serif text-xl font-semibold text-text">
              Guia de Fotografia y Video
            </h2>

            <h3 className="mb-2 font-serif text-base font-semibold text-text">
              Fotografia
            </h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>
                <strong className="text-text">Resolucion minima:</strong> 1200 x
                1600 px (formato retrato 3:4)
              </li>
              <li>
                <strong className="text-text">Fondo:</strong> neutro, idealmente
                blanco o gris claro, sin distracciones
              </li>
              <li>
                <strong className="text-text">Iluminacion:</strong> luz natural o
                difusa, sin sombras duras ni flash directo
              </li>
              <li>
                <strong className="text-text">Tomas recomendadas:</strong>
                <ol className="mt-1 ml-4 list-decimal space-y-1">
                  <li>Foto general de la pieza completa</li>
                  <li>Foto de detalle/textura</li>
                  <li>Foto con escala (en mano, cuello, etc.)</li>
                  <li>Foto del cierre/terminacion</li>
                </ol>
              </li>
              <li>
                <strong className="text-text">Prohibido:</strong> filtros de
                Instagram, logos, marcas de agua, texto sobre imagen
              </li>
            </ul>

            <hr className="my-5 border-border" />

            <h3 className="mb-2 font-serif text-base font-semibold text-text">
              Video
            </h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>
                <strong className="text-text">Duracion:</strong> entre 10 y 30
                segundos
              </li>
              <li>
                <strong className="text-text">Formato:</strong> MP4, orientacion
                vertical (9:16) o cuadrado (1:1)
              </li>
              <li>
                <strong className="text-text">Resolucion minima:</strong> 720p
                (1080p recomendado)
              </li>
              <li>
                <strong className="text-text">Peso maximo:</strong> 50 MB
              </li>
              <li>
                <strong className="text-text">Contenido sugerido:</strong>
                <ol className="mt-1 ml-4 list-decimal space-y-1">
                  <li>Pieza girando lentamente sobre fondo neutro</li>
                  <li>Detalle del brillo y textura en movimiento</li>
                  <li>Pieza puesta (en mano, cuello, oreja) para mostrar escala</li>
                </ol>
              </li>
              <li>
                <strong className="text-text">Iluminacion:</strong> misma regla
                que fotos — luz natural o difusa, sin flash
              </li>
              <li>
                <strong className="text-text">Prohibido:</strong> musica con
                copyright, voz en off, filtros, marcas de agua, movimientos
                bruscos de camara
              </li>
            </ul>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
