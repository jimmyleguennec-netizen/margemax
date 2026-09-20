import { RgbLoader } from "@/components/ui/rgb-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <RgbLoader size={40} />
    </div>
  );
}
