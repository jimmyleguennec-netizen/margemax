import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm text-muted-foreground">Connecté en tant que</p>
      <p className="text-lg font-medium">{user.email}</p>
      <form action={logout}>
        <Button variant="outline" type="submit">
          Se déconnecter
        </Button>
      </form>
    </main>
  );
}
