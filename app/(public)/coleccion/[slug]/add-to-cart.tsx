"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart";
import { validateGuestAddToCart } from "@/lib/actions/guest-cart";
import { addGuestCartLine, readGuestCartLines } from "@/lib/guest-cart-storage";
import { formatCLP } from "@/lib/utils";
import { trackAddToCart, type GA4Item } from "@/lib/analytics-events";
import { showToast } from "@/components/ui/toast";

export interface RingSizeOption {
  size: string;
  stock: number;
}

interface AddToCartProps {
  productId: string;
  price: number;
  productionType: string;
  stock: number;
  ringSizeOptions?: RingSizeOption[];
  ga4Item?: Omit<GA4Item, "quantity">;
}

export function AddToCart({ productId, price, productionType, stock, ringSizeOptions, ga4Item }: AddToCartProps) {
  const router = useRouter();
  const { status } = useSession();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableSizes = useMemo(
    () => (ringSizeOptions ?? []).filter((o) => o.stock > 0 || productionType === "MADE_TO_ORDER"),
    [ringSizeOptions, productionType],
  );
  const hasSizeChoice = availableSizes.length > 0;
  const autoSelectedSize = availableSizes.length === 1 ? availableSizes[0].size : "";
  const [selectedSize, setSelectedSize] = useState<string>(autoSelectedSize);

  const selectedVariant = hasSizeChoice
    ? availableSizes.find((o) => o.size === selectedSize)
    : undefined;
  const effectiveStock = hasSizeChoice
    ? (selectedVariant?.stock ?? 0)
    : stock;

  const sessionLoading = status === "loading";
  const isGuestMode = status === "unauthenticated";

  // Sticky mobile buy bar: only show once the inline CTA scrolls out of view.
  const rootRef = useRef<HTMLDivElement>(null);
  const inlineCtaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const el = inlineCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleStickyAdd() {
    // If a size is required but not chosen, surface the inline selector instead.
    if (hasSizeChoice && !selectedSize) {
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setErrorMsg("Selecciona una talla");
      return;
    }
    handleAddToCart();
  }

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function increment() {
    setQuantity((q) => Math.min(Math.max(effectiveStock, 1), q + 1));
  }

  function handleSelectSize(size: string) {
    setSelectedSize(size);
    setQuantity(1);
    setErrorMsg(null);
  }

  function handleAddToCart() {
    setErrorMsg(null);

    if (hasSizeChoice && !selectedSize) {
      setErrorMsg("Selecciona una talla");
      return;
    }

    const sizeToSend = hasSizeChoice ? selectedSize : undefined;

    startTransition(async () => {
      if (!isGuestMode) {
        const result = await addToCart(productId, quantity, sizeToSend);
        if (result?.error) {
          setErrorMsg(result.error);
        } else {
          if (ga4Item) trackAddToCart({ ...ga4Item, quantity });
          showToast({
            message: "Añadido al carrito",
            actionLabel: "Ver carrito",
            actionHref: "/carrito",
          });
          window.dispatchEvent(new Event("casaorfebre:cart-updated"));
          router.refresh();
        }
        return;
      }

      if (productionType === "UNIQUE") {
        const alreadyInGuestCart = readGuestCartLines().some(
          (l) => l.productId === productId && (l.size ?? "") === (sizeToSend ?? ""),
        );
        if (alreadyInGuestCart) {
          setErrorMsg("Esta pieza única ya está en tu carrito");
          return;
        }
      }
      const check = await validateGuestAddToCart(productId, quantity, sizeToSend);
      if (check && "error" in check && check.error) {
        setErrorMsg(check.error);
        return;
      }
      addGuestCartLine(productId, quantity, sizeToSend);
      if (ga4Item) trackAddToCart({ ...ga4Item, quantity });
      showToast({
        message: "Añadido al carrito",
        actionLabel: "Ver carrito",
        actionHref: "/carrito",
      });
    });
  }

  const showQuantitySelector =
    productionType === "LIMITED" &&
    (hasSizeChoice ? effectiveStock > 1 : stock > 1);

  return (
    <div ref={rootRef} className="space-y-3">
      {/* Size selector — only when product has ring sizes */}
      {hasSizeChoice && availableSizes.length > 1 && (
        <div className="space-y-2">
          <span className="text-sm text-text-secondary">Talla:</span>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map((opt) => {
              const isSelected = selectedSize === opt.size;
              const isDisabled = opt.stock <= 0 && productionType !== "MADE_TO_ORDER";
              return (
                <button
                  key={opt.size}
                  type="button"
                  disabled={isDisabled || isPending}
                  onClick={() => handleSelectSize(opt.size)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-accent text-white"
                      : "border border-border text-text-secondary hover:border-accent/50"
                  } ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
                  aria-pressed={isSelected}
                  aria-label={`Talla ${opt.size}`}
                >
                  {opt.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity selector — only for LIMITED products with stock > 1 */}
      {showQuantitySelector && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">Cantidad:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={decrement}
              disabled={quantity <= 1 || isPending}
              className="flex h-8 w-8 items-center justify-center rounded border border-border text-text transition-colors hover:bg-background disabled:pointer-events-none disabled:opacity-40"
              aria-label="Disminuir cantidad"
            >
              &minus;
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={increment}
              disabled={quantity >= effectiveStock || isPending}
              className="flex h-8 w-8 items-center justify-center rounded border border-border text-text transition-colors hover:bg-background disabled:pointer-events-none disabled:opacity-40"
              aria-label="Aumentar cantidad"
            >
              &#43;
            </button>
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <div ref={inlineCtaRef}>
        <Button
          size="lg"
          className="w-full"
          loading={isPending || sessionLoading}
          disabled={sessionLoading || (hasSizeChoice && !selectedSize)}
          onClick={handleAddToCart}
        >
          A&ntilde;adir al Carrito &mdash; {formatCLP(price * quantity)}
        </Button>
      </div>

      {/* Error message */}
      {errorMsg && (
        <p className="text-center text-sm font-medium text-red-600">
          {errorMsg}
        </p>
      )}

      {/* Sticky mobile buy bar — CTA Liquid Glass (tab bar se oculta en ficha) */}
      <div
        className={`fixed z-50 transition-transform duration-300 md:hidden ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          left: 14,
          right: 14,
          bottom: "max(14px, env(safe-area-inset-bottom))",
          borderRadius: 28,
          background: "rgba(26,26,24,0.88)",
          WebkitBackdropFilter: "blur(16px)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.14)",
          padding: "12px 14px",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 shrink-0">
            <p
              className="uppercase"
              style={{ fontSize: "8.5px", letterSpacing: "0.1em", color: "#b8ab97" }}
            >
              Precio
            </p>
            <p className="tabular-nums font-medium" style={{ fontSize: "15px", color: "#FAFAF8" }}>
              {formatCLP(price * quantity)}
            </p>
          </div>
          <button
            type="button"
            disabled={sessionLoading || isPending}
            onClick={handleStickyAdd}
            className="flex-1 py-3 text-sm font-medium text-[#FAFAF8] disabled:opacity-60"
            style={{
              borderRadius: 22,
              background: "linear-gradient(120deg,#c9ad84,#8B7355)",
            }}
          >
            {isPending || sessionLoading ? "Agregando…" : "Agregar a la bolsa"}
          </button>
        </div>
      </div>
    </div>
  );
}
