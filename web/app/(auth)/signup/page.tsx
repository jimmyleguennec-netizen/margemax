import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Créer un compte — MargeMax",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
