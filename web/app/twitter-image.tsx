import { renderOgImage } from "@/lib/og-image";

export const alt = "MargeMax - Calcule tes vraies marges e-commerce";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage();
}
