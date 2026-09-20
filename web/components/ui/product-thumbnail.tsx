"use client";

import { useEffect, useState } from "react";
import { Package } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Miniature carrée du produit, avec repli sur un placeholder neon
 * MargeMax si aucune image n'est fournie ou si le chargement echoue
 * (photo retiree, domaine bloque, URL invalide...).
 */
export function ProductThumbnail({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  // Reinitialise l'etat d'erreur quand la source change (nouvelle
  // recherche), pour retenter le chargement de la nouvelle image.
  useEffect(() => {
    setErrored(false);
  }, [src]);

  const showImage = Boolean(src) && !errored;

  return (
    <div
      className={cn(
        "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-500/30 bg-white/5 transition-shadow duration-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]",
        className
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={alt}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Package aria-hidden="true" className="h-8 w-8 text-cyan-300/50" />
      )}
    </div>
  );
}
