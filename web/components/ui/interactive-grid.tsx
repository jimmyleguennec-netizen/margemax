"use client";

import { useCallback, useRef, useState } from "react";

const CELL_SIZE = 40; // px
const FADE_MS = 500;
const NEON_COLORS = ["#00f0ff", "#8b5cf6"];

type LitCell = {
  id: number;
  row: number;
  col: number;
  color: string;
  lit: boolean;
};

/**
 * Fond de grille interactif : la grille elle-meme est dessinee en pur CSS
 * (background-image, aucun cout de DOM), et seule la case survolee est
 * rendue comme un petit <div> temporaire qui s'allume instantanement puis
 * s'eteint en fondu (transition CSS) avant d'etre retire. Beaucoup plus
 * leger qu'un <div> par case sur une grille pleine page.
 */
export function InteractiveGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState<LitCell[]>([]);
  const nextId = useRef(0);
  const lastKeyRef = useRef<string | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const col = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const row = Math.floor((e.clientY - rect.top) / CELL_SIZE);
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
      ref={containerRef}
      onMouseMove={handleMouseMove}
      aria-hidden
      className="pointer-events-auto absolute inset-0 -z-10 overflow-hidden"
      style={{
        backgroundColor: "#05050a",
        backgroundImage:
          "linear-gradient(rgba(139,92,246,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.09) 1px, transparent 1px)",
        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
      }}
    >
      {cells.map((cell) => (
        <div
          key={cell.id}
          className="pointer-events-none absolute"
          style={{
            left: cell.col * CELL_SIZE,
            top: cell.row * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            background: cell.lit ? cell.color : "transparent",
            boxShadow: cell.lit ? `0 0 18px 3px ${cell.color}` : "none",
            transition: "background 0.5s ease, box-shadow 0.5s ease",
          }}
        />
      ))}
    </div>
  );
}
