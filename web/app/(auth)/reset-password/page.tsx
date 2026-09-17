import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouveau mot de passe — MargeMax",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
