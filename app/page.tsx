import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) redirect("/login");

  const painelPorPerfil: Record<string, string> = {
    ADMIN: "/admin",
    OPERADOR: "/operador",
    MENSALISTA: "/mensalista",
  };

  redirect(painelPorPerfil[session.user.perfil] ?? "/login");
}
