import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mot de passe oublié — MargeMax",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
