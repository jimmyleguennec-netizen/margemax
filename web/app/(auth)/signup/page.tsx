import type { Metadata } from "next";

import { NeonAuthPanel } from "@/components/auth/neon-auth-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Créer un compte — MargeMax",
};

export default function SignupPage() {
  return <NeonAuthPanel initialMode="signup" />;
}
