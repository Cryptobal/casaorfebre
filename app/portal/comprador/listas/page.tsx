"use client";

import { useEffect, useState, useTransition } from "react";
import { createWishlist, deleteWishlist, removeFromWishlist } from "@/lib/actions/wishlist";
import Image from "next/image";
import Link from "next/link";

interface WishlistItemData {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { url: string; altText: string | null }[];
    artisan: { displayName: string; slug: string };
  };
}

interface WishlistData {
  id: string;
  name: string;
  code: string;
  isPublic: boolean;
  createdAt: string;
  _count: { items: number };
  items: WishlistItemData[];
}

export default function ListasPage() {
  const [wishlists, setWishlists] = useState<WishlistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  async function fetchWishlists() {
    const res = await fetch("/api/wishlists");
    if (res.ok) {
      const data = await res.json();
      setWishlists(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchWishlists();
  }, []);

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      await createWishlist(newName.trim());
      setNewName("");
      await fetchWishlists();
    });
  }

  function handleDelete(wishlistId: string) {
    startTransition(async () => {
      await deleteWishlist(wishlistId);
      await fetchWishlists();
    });
  }

  function handleRemoveItem(wishlistId: string, productId: string) {
    startTransition(async () => {
      await removeFromWishlist(wishlistId, productId);
      await fetchWishlists();
    });
  }

  function handleCopy(code: string) {
    const url = `https://casaorfebre.cl/wishlist/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleShareWhatsApp(name: string, code: string) {
    const url = `https://casaorfebre.cl/wishlist/${code}`;
    const text = encodeURIComponent(`Mira mi lista de deseos "${name}" en Casa Orfebre: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(price);
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-light text-text">Mis Listas de Deseos</h1>
        <div className="mt-8 flex items-center justify-center">
          <p className="text-sm text-text-tertiary">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-light text-text">Mis Listas de Deseos</h1>

      {/* Create new wishlist */}
      <div className="mt-6 flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Nombre de la lista..."
          className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          onClick={handleCreate}
          disabled={isPending || !newName.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
        >
          Crear lista
        </button>
      </div>

      {/* Wishlists */}
      {wishlists.length > 0 ? (
        <div className="mt-8 space-y-4">
          {wishlists.map((wl) => (
            <div key={wl.id} className="rounded-lg border border-border bg-surface p-6">
              <div className="flex items-start justify-between">
                <div>
                  <button
                    onClick={() => setExpandedId(expandedId === wl.id ? null : wl.id)}
                    className="text-left"
                  >
                    <h3 className="font-serif text-lg font-light text-text">{wl.name}</h3>
                    <p className="text-xs text-text-tertiary">
                      {wl._count.items} {wl._count.items === 1 ? "pieza" : "piezas"}
                    </p>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Copy link */}
                  <button
                    onClick={() => handleCopy(wl.code)}
                    className="min-h-[44px] rounded-lg border border-border px-4 py-1.5 text-xs text-text-secondary transition-colors hover:bg-background"
                  >
                    {copied === wl.code ? "Copiado" : "Copiar link"}
                  </button>
                  {/* WhatsApp */}
                  <button
                    onClick={() => handleShareWhatsApp(wl.name, wl.code)}
                    className="min-h-[44px] rounded-lg border border-border px-4 py-1.5 text-xs text-text-secondary transition-colors hover:bg-background"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1 inline-block">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(wl.id)}
                    disabled={isPending}
                    className="min-h-[44px] rounded-lg border border-border px-4 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Expanded items */}
              {expandedId === wl.id && (
                <div className="mt-4 border-t border-border pt-4">
                  {wl.items.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {wl.items.map((item) => (
                        <div key={item.id} className="group relative">
                          <Link href={`/coleccion/${item.product.slug}`} className="block">
                            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-background">
                              {item.product.images[0]?.url ? (
                                <Image
                                  src={item.product.images[0].url}
                                  alt={item.product.images[0].altText ?? item.product.name}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-text-tertiary">
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="M21 15l-5-5L5 21" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-text-tertiary">{item.product.artisan.displayName}</p>
                              <p className="font-serif text-sm text-text">{item.product.name}</p>
                              <p className="text-xs font-medium text-text-secondary">{formatPrice(item.product.price)}</p>
                            </div>
                          </Link>
                          <button
                            onClick={() => handleRemoveItem(wl.id, item.productId)}
                            className="absolute right-2 top-2 rounded-full bg-surface/80 p-1.5 text-text-tertiary opacity-0 backdrop-blur-sm transition-opacity hover:text-red-500 group-hover:opacity-100"
                            aria-label="Quitar de la lista"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-text-tertiary">
                      Esta lista esta vacia. Agrega piezas desde la coleccion.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-text-secondary">
            Aun no tienes listas de deseos. Crea una para organizar tus piezas favoritas.
          </p>
        </div>
      )}
    </div>
  );
}
