import { RgbLoader } from "@/components/ui/rgb-loader";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05050a]">
      <RgbLoader size={40} />
    </div>
  );
}
