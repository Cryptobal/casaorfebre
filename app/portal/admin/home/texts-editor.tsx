"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { updateHomeTexts } from "@/lib/actions/home-content";
import {
  HOME_DEFAULT_MANIFESTO,
  HOME_DEFAULTS,
  type HomeConcept,
} from "@/lib/home-defaults";
import { showToast } from "@/components/ui/toast";
import { notifyHomeActionError } from "./notify-error";
import type { StoredHomeTexts } from "@/lib/queries/home-content";

type TextsEditorProps = {
  stored: StoredHomeTexts;
};

export function TextsEditor({ stored }: TextsEditorProps) {
  return (
    <div className="space-y-3">
      <HeroBlock defaultValue={stored.heroPhrase ?? ""} />
      <ManifestoBlock defaultValue={stored.manifesto ?? ""} />
      <ConceptsBlock defaultValue={stored.concepts} />
      <GalleryIntroBlock defaultValue={stored.galleryIntro ?? ""} />
      <ContactBlock
        instagram={stored.contactInstagramText ?? ""}
        whatsapp={stored.contactWhatsappText ?? ""}
      />
    </div>
  );
}

function EditorBlock({
  title,
  hint,
  defaultOpen,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-lg border border-border bg-surface p-4 sm:p-5"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-base font-medium text-text [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="text-text-tertiary" aria-hidden>
          ▾
        </span>
      </summary>
      {hint && (
        <p className="mt-2 text-sm text-text-secondary">{hint}</p>
      )}
      <div className="mt-4">{children}</div>
    </details>
  );
}

function SaveButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-5 text-base font-medium text-white transition-colors hover:bg-accent-dark disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-40"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

function fieldClassName() {
  return "min-h-12 w-full rounded-md border border-border bg-background px-3 py-3 text-base text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent";
}

function HeroBlock({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [pending, start] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    start(async () => {
      const result = await updateHomeTexts({ heroPhrase: value });
      if (result.error) {
        notifyHomeActionError(result.error);
        return;
      }
      showToast({ message: "Frase del hero guardada" });
      router.refresh();
    });
  }

  return (
    <EditorBlock
      title="Frase del hero"
      hint="Déjalo vacío para volver al texto original."
      defaultOpen
    >
      <form onSubmit={onSubmit}>
        <label className="block">
          <span className="sr-only">Frase del hero</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={HOME_DEFAULTS.heroPhrase}
            className={fieldClassName()}
          />
        </label>
        <SaveButton pending={pending} />
      </form>
    </EditorBlock>
  );
}

function ManifestoBlock({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [pending, start] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    start(async () => {
      const result = await updateHomeTexts({ manifesto: value });
      if (result.error) {
        notifyHomeActionError(result.error);
        return;
      }
      showToast({ message: "Manifiesto guardado" });
      router.refresh();
    });
  }

  return (
    <EditorBlock
      title="Manifiesto"
      hint="Separa los párrafos con una línea en blanco. El primero se ve más grande. Déjalo vacío para volver al texto original."
    >
      <form onSubmit={onSubmit}>
        <label className="block">
          <span className="sr-only">Manifiesto</span>
          <textarea
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              const el = event.target;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
            placeholder={HOME_DEFAULT_MANIFESTO}
            rows={10}
            className={`${fieldClassName()} min-h-40 resize-y leading-relaxed`}
          />
        </label>
        <SaveButton pending={pending} />
      </form>
    </EditorBlock>
  );
}

function ConceptsBlock({ defaultValue }: { defaultValue: HomeConcept[] }) {
  const router = useRouter();
  const [concepts, setConcepts] = useState<HomeConcept[]>(defaultValue);
  const [pending, start] = useTransition();

  function updateSlot(index: number, patch: Partial<HomeConcept>) {
    setConcepts((prev) =>
      prev.map((concept, i) => (i === index ? { ...concept, ...patch } : concept))
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    start(async () => {
      const result = await updateHomeTexts({ concepts });
      if (result.error) {
        notifyHomeActionError(result.error);
        return;
      }
      showToast({ message: "Conceptos guardados" });
      router.refresh();
    });
  }

  return (
    <EditorBlock
      title="Conceptos"
      hint="Cuatro bloques fijos. Un título o texto vacío vuelve al original de ese campo."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {concepts.map((concept, index) => {
          const fallback = HOME_DEFAULTS.concepts[index];
          return (
            <fieldset key={fallback.title} className="space-y-2">
              <legend className="text-sm font-medium text-text-secondary">
                Concepto {index + 1}
              </legend>
              <input
                value={concept.title}
                onChange={(event) => updateSlot(index, { title: event.target.value })}
                placeholder={fallback.title}
                className={fieldClassName()}
                aria-label={`Título del concepto ${index + 1}`}
              />
              <textarea
                value={concept.text}
                onChange={(event) => updateSlot(index, { text: event.target.value })}
                placeholder={fallback.text}
                rows={3}
                className={`${fieldClassName()} min-h-24 resize-y leading-relaxed`}
                aria-label={`Texto del concepto ${index + 1}`}
              />
            </fieldset>
          );
        })}
        <SaveButton pending={pending} />
      </form>
    </EditorBlock>
  );
}

function GalleryIntroBlock({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [pending, start] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    start(async () => {
      const result = await updateHomeTexts({ galleryIntro: value });
      if (result.error) {
        notifyHomeActionError(result.error);
        return;
      }
      showToast({ message: "Frase de la galería guardada" });
      router.refresh();
    });
  }

  return (
    <EditorBlock
      title="Frase de la galería"
      hint="Déjalo vacío para volver al texto original."
    >
      <form onSubmit={onSubmit}>
        <label className="block">
          <span className="sr-only">Frase de la galería</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={HOME_DEFAULTS.galleryIntro}
            className={fieldClassName()}
          />
        </label>
        <SaveButton pending={pending} />
      </form>
    </EditorBlock>
  );
}

function ContactBlock({
  instagram,
  whatsapp,
}: {
  instagram: string;
  whatsapp: string;
}) {
  const router = useRouter();
  const [ig, setIg] = useState(instagram);
  const [wa, setWa] = useState(whatsapp);
  const [pending, start] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    start(async () => {
      const result = await updateHomeTexts({
        contactInstagramText: ig,
        contactWhatsappText: wa,
      });
      if (result.error) {
        notifyHomeActionError(result.error);
        return;
      }
      showToast({ message: "Textos de contacto guardados" });
      router.refresh();
    });
  }

  return (
    <EditorBlock
      title="Contacto"
      hint="Déjalo vacío para volver al texto original. Los enlaces de Instagram y WhatsApp no se editan aquí."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-text-secondary">Texto de Instagram</span>
          <textarea
            value={ig}
            onChange={(event) => setIg(event.target.value)}
            placeholder={HOME_DEFAULTS.contactInstagramText}
            rows={3}
            className={`${fieldClassName()} min-h-24 resize-y leading-relaxed`}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-text-secondary">Texto de WhatsApp</span>
          <textarea
            value={wa}
            onChange={(event) => setWa(event.target.value)}
            placeholder={HOME_DEFAULTS.contactWhatsappText}
            rows={3}
            className={`${fieldClassName()} min-h-24 resize-y leading-relaxed`}
          />
        </label>
        <SaveButton pending={pending} />
      </form>
    </EditorBlock>
  );
}
