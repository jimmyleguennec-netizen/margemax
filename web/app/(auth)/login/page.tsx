import type { Metadata } from "next";

import { NeonAuthPanel } from "@/components/auth/neon-auth-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion — MargeMax",
};

export default function LoginPage() {
  return <NeonAuthPanel initialMode="login" />;
}
