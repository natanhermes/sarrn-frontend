"use client";

import { useAuth } from "@/store/useAuth";
import { roleLabels } from "@/schemas/users";

export default function DashboardPage() {
  const user = useAuth((state) => state.user);

  return (
    <main className="flex flex-1 flex-col gap-2 px-4 py-6 md:px-6 md:py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        {user
          ? `Bem-vindo(a), ${user.name}. Perfil: ${roleLabels[user.role]}.`
          : "Carregando sessão..."}
      </p>
    </main>
  );
}
