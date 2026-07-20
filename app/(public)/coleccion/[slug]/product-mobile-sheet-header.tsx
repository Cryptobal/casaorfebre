import Link from "next/link";
import Image from "next/image";

interface ProductMobileSheetHeaderProps {
  categoryLabel: string;
  materialLabel?: string | null;
  productName: string;
  artisan: {
    slug: string;
    displayName: string;
    location: string;
    profileImage: string | null;
    status: string;
    productCount: number;
  };
  productionType: string;
  stock: number;
}

export function ProductMobileSheetHeader({
  categoryLabel,
  materialLabel,
  productName,
  artisan,
  productionType,
  stock,
}: ProductMobileSheetHeaderProps) {
  const initials = artisan.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const eyebrow = [categoryLabel, materialLabel].filter(Boolean).join(" · ");

  return (
    <div className="space-y-4 md:hidden">
      {/* Grab handle */}
      <div className="flex justify-center pt-1" aria-hidden>
        <span className="h-1 w-10 rounded-full bg-border" />
      </div>

      <p
        className="uppercase text-accent"
        style={{ fontSize: "9px", letterSpacing: "0.16em" }}
      >
        {eyebrow}
      </p>

      <h1 className="font-serif font-light text-text" style={{ fontSize: "23px", lineHeight: 1.2 }}>
        {productName}
      </h1>

      <Link
        href={`/orfebres/${artisan.slug}`}
        className="flex items-center gap-3 rounded-xl py-1"
      >
        <div className="relative h-[30px] w-[30px] flex-shrink-0 overflow-hidden rounded-full bg-accent/10">
          {artisan.profileImage ? (
            <Image
              src={artisan.profileImage}
              alt={artisan.displayName}
              fill
              className="object-cover"
              sizes="30px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-serif text-[11px] text-accent">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">{artisan.displayName}</p>
          <p className="truncate text-xs font-light text-text-secondary">
            Taller en {artisan.location}
            {artisan.productCount > 0 ? ` · ${artisan.productCount} piezas` : ""}
          </p>
        </div>
        {artisan.status === "APPROVED" && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-accent-dark"
            style={{ border: "1px solid #ddd2c2", background: "#f8f4ec" }}
          >
            ✓ Verificada
          </span>
        )}
      </Link>

      <div className="flex flex-wrap gap-1.5">
        {productionType === "UNIQUE" && (
          <Seal>✦ Pieza única</Seal>
        )}
        {productionType === "MADE_TO_ORDER" && (
          <Seal>Hecha por encargo</Seal>
        )}
        {productionType === "LIMITED" && stock > 0 && stock < 10 && (
          <Seal>Quedan {stock}</Seal>
        )}
        <Seal>⌘ Certificado de autenticidad</Seal>
      </div>
    </div>
  );
}

function Seal({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-text-secondary"
      style={{ fontSize: "9.5px" }}
    >
      {children}
    </span>
  );
}
