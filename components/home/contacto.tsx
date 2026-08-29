import { PORTAL_INSTAGRAM_URL, PORTAL_WHATSAPP_URL } from "@/lib/site-config";

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.5-.6c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4a5 5 0 0 0 2.3.5c.5 0 1.3-.3 1.5-1 .2-.6.2-1.2.1-1.3-.1-.2-.3-.3-.5-.4z" />
    </svg>
  );
}

export function Contacto({
  instagramText,
  whatsappText,
}: {
  instagramText: string;
  whatsappText: string;
}) {
  return (
    <section className="flex flex-col items-center gap-[clamp(72px,12vw,120px)] px-6 pb-[clamp(110px,18vw,200px)] pt-0 text-center">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-[30px]">
        <p className="m-0 max-w-[42ch] text-pretty text-base font-light leading-[1.9] text-text-secondary">
          {instagramText}
        </p>
        <a
          href={PORTAL_INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="box-border flex min-h-12 w-full max-w-[300px] items-center justify-center border border-accent px-8 text-xs font-normal uppercase tracking-[0.24em] text-accent transition-all duration-[250ms] ease-[ease] hover:border-accent-light hover:bg-surface hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Instagram
        </a>
      </div>
      <div className="flex w-full max-w-[420px] flex-col items-center gap-[30px]">
        <p className="m-0 max-w-[42ch] text-pretty text-base font-light leading-[1.9] text-text-secondary">
          {whatsappText}
        </p>
        <a
          href={PORTAL_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="box-border flex min-h-12 w-full max-w-[300px] items-center justify-center gap-2.5 bg-accent px-8 text-xs font-normal uppercase tracking-[0.2em] text-background transition-[background-color] duration-[250ms] ease-[ease] hover:bg-accent-light hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <WhatsAppIcon />
          Hablemos por WhatsApp
        </a>
      </div>
    </section>
  );
}
