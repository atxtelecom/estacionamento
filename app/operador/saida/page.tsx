import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SaidaForm from "./SaidaForm";

export default async function SaidaPage({
  searchParams,
}: {
  searchParams: Promise<{ placa?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.perfil === "MENSALISTA") redirect("/login");

  const { placa } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil={session.user.perfil} />
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Registrar Saída</h1>
        <SaidaForm placaInicial={placa ?? ""} />
      </main>
    </div>
  );
}
