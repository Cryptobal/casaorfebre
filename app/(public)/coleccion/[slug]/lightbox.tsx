"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface LightboxProps {
  images: { id: string; url: string; altText: string | null }[];
  video?: { cloudflareStreamUid: string; status: string; muted: boolean } | null;
  productName: string;
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({
  images,
  video,
  productName,
  initialIndex,
  onClose,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasReadyVideo = video?.status === "READY";
  const totalSlides = images.length + (hasReadyVideo ? 1 : 0);
  const isVideoSlide = hasReadyVideo && currentIndex === images.length;
  const cfCustomerCode =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE
      : undefined;

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const animateClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  // Reset zoom on slide change
  useEffect(() => {
    setZoom(1);
    setTranslate({ x: 0, y: 0 });
  }, [currentIndex]);

  const goPrev = useCallback(() => {
    if (zoom > 1) return;
    setCurrentIndex((i) => (i - 1 + totalSlides) % totalSlides);
  }, [totalSlides, zoom]);

  const goNext = useCallback(() => {
    if (zoom > 1) return;
    setCurrentIndex((i) => (i + 1) % totalSlides);
  }, [totalSlides, zoom]);

  // Keyboard
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") animateClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [animateClose, goPrev, goNext]);

  // Scroll wheel zoom (desktop)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      setZoom((z) => {
        const next = z - e.deltaY * 0.002;
        if (next <= 1) {
          setTranslate({ x: 0, y: 0 });
          return 1;
        }
        return Math.min(next, 4);
      });
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Touch handlers
  function onTouchStart(e: ReactTouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistRef.current = Math.hypot(dx, dy);
      pinchStartZoomRef.current = zoom;
    } else if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }

  function onTouchMove(e: ReactTouchEvent) {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / pinchStartDistRef.current;
      const next = pinchStartZoomRef.current * scale;
      if (next <= 1) {
        setTranslate({ x: 0, y: 0 });
        setZoom(1);
      } else {
        setZoom(Math.min(next, 4));
      }
    } else if (e.touches.length === 1 && zoom > 1 && touchStartRef.current) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }

  function onTouchEnd(e: ReactTouchEvent) {
    // Swipe navigation (only when not zoomed)
    if (
      e.changedTouches.length === 1 &&
      zoom <= 1 &&
      touchStartRef.current &&
      pinchStartDistRef.current === null
    ) {
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      if (Math.abs(dx) > 60) {
        if (dx > 0) goPrev();
        else goNext();
      }
    }
    touchStartRef.current = null;
    pinchStartDistRef.current = null;
  }

  const content = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={animateClose}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={animateClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        aria-label="Cerrar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Counter */}
      {totalSlides > 1 && (
        <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
          {currentIndex + 1}/{totalSlides}
        </div>
      )}

      {/* Prev arrow */}
      {totalSlides > 1 && (
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white sm:left-6"
          aria-label="Imagen anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Next arrow */}
      {totalSlides > 1 && (
        <button
          type="button"
          onClick={goNext}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white sm:right-6"
          aria-label="Imagen siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Image / Video */}
      <div
        ref={containerRef}
        className={`relative flex max-h-[90vh] max-w-[90vw] items-center justify-center transition-transform duration-200 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {isVideoSlide && cfCustomerCode ? (
          <iframe
            src={`https://${cfCustomerCode}/${video!.cloudflareStreamUid}/iframe?autoplay=true&muted=${video!.muted ? "true" : "false"}&controls=true`}
            allow="autoplay"
            allowFullScreen
            style={{ border: "none" }}
            className="h-[70vh] w-[90vw] max-w-4xl rounded-lg sm:h-[80vh]"
          />
        ) : images[currentIndex] ? (
          <div
            className="relative select-none"
            style={{
              transform: `scale(${zoom}) translate(${translate.x / zoom}px, ${translate.y / zoom}px)`,
              transition: zoom === 1 ? "transform 0.2s ease-out" : "none",
            }}
          >
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].altText ?? `${productName} - ${currentIndex + 1}`}
              width={1200}
              height={1600}
              className="max-h-[90vh] w-auto rounded-lg object-contain"
              sizes="90vw"
              priority
              draggable={false}
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
