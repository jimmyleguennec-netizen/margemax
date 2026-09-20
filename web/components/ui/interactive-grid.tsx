"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

const CELL_SIZE = 40; // px
const FADE_MS = 600;
const NEON_COLORS = ["#00f0ff", "#8b5cf6"];

type LitCell = {
  id: number;
  row: number;
  col: number;
  color: string;
  lit: boolean;
};

/**
 * Fond de grille interactif, en position fixed plein ecran derriere tout le
 * contenu (z-0). La grille elle-meme est dessinee en pur CSS
 * (background-image, aucun cout de DOM) ; seule la case survolee est rendue
 * comme un petit <div> temporaire qui s'allume instantanement puis s'eteint
 * en fondu (transition CSS) avant d'etre retire.
 *
 * Pour que les cases reagissent au survol MEME quand la souris est au-dessus
 * du contenu (boutons, cartes, texte), ce composant enveloppe {children} au
 * lieu d'etre un simple calque absolu derriere eux : le mousemove est capte
 * sur le conteneur englobant et remonte naturellement (bubbling DOM) depuis
 * n'importe quel element survole, quel que soit son z-index ou son
 * pointer-events. Aucun pointer-events:none n'est applique nulle part sur le
 * contenu -- tous les boutons, liens, champs et cartes du site restent
 * cliquables exactement comme avant, sans avoir a etre audites un par un.
 */
export function InteractiveGrid({
  children,
  className,
  hideOnMobile = false,
}: {
  children?: React.ReactNode;
  className?: string;
  /** true : aucun calque decoratif fixe sous md (pages d'auth) -- des calques
   * fixes plein ecran + parallaxe saturent la memoire graphique de Safari iOS
   * et gelent la page quand le clavier redimensionne le viewport. */
  hideOnMobile?: boolean;
}) {
  const [cells, setCells] = useState<LitCell[]>([]);
  const nextId = useRef(0);
  const lastKeyRef = useRef<string | null>(null);

  const { scrollYProgress } = useScroll();
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -150]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Le calque visuel est fixed inset-0 (= plein viewport), donc les
    // coordonnees ecran (clientX/clientY) correspondent deja directement
    // aux coordonnees du calque -- pas besoin de getBoundingClientRect.
    const col = Math.floor(e.clientX / CELL_SIZE);
    const row = Math.floor(e.clientY / CELL_SIZE);
    const key = `${row}-${col}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    const id = nextId.current++;
    const color = NEON_COLORS[(row + col) % NEON_COLORS.length];

    setCells((prev) => [...prev, { id, row, col, color, lit: true }]);

    // Allumage instantane (premiere peinture au style "lit"), puis on bascule
    // sur "eteint" une frame plus tard : la transition CSS anime le fondu.
    requestAnimationFrame(() => {
      setCells((prev) =>
        prev.map((c) => (c.id === id ? { ...c, lit: false } : c))
      );
    });

    window.setTimeout(() => {
      setCells((prev) => prev.filter((c) => c.id !== id));
    }, FADE_MS + 100);
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn("pointer-events-auto relative", className)}
    >
      {/* Motif de grille decoratif, avec un leger parallaxe vertical au
          defilement -- deborde de 150px en haut/bas pour ne jamais laisser
          de vide pendant la translation. */}
      <motion.div
        aria-hidden
        className={cn("pointer-events-none fixed inset-x-0 z-0 w-full overflow-hidden", hideOnMobile && "hidden md:block")}
        style={{
          top: -150,
          bottom: -150,
          y: gridY,
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)",
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        }}
      />

      {/* Calque des cases allumees, aligne sur le viewport (coordonnees
          clientX/clientY) -- jamais transforme, pour rester pile sous le
          curseur independamment du parallaxe du motif ci-dessus. */}
      <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden", hideOnMobile && "hidden md:block")}>
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="pointer-events-none absolute"
            style={{
              left: cell.col * CELL_SIZE,
              top: cell.row * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: cell.lit ? cell.color : "transparent",
              boxShadow: cell.lit ? `0 0 18px 3px ${cell.color}` : "none",
              transition: `background-color ${FADE_MS}ms ease, box-shadow ${FADE_MS}ms ease`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
