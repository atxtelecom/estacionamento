"use client";

import { useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  nome: string;
  perfil: "ADMIN" | "OPERADOR" | "MENSALISTA";
}

const LINKS: Record<string, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/vagas", label: "Vagas" },
    { href: "/admin/tarifas", label: "Tarifas" },
    { href: "/admin/mensalistas", label: "Mensalistas" },
    { href: "/admin/operadores", label: "Operadores" },
    { href: "/admin/relatorios", label: "Relatórios" },
  ],
  OPERADOR: [
    { href: "/operador", label: "Painel" },
    { href: "/operador/entrada", label: "Entrada" },
    { href: "/operador/saida", label: "Saída" },
  ],
  MENSALISTA: [
    { href: "/mensalista", label: "Meu Plano" },
    { href: "/mensalista/historico", label: "Histórico" },
  ],
};

const COR: Record<string, string> = {
  ADMIN: "bg-indigo-700",
  OPERADOR: "bg-blue-700",
  MENSALISTA: "bg-green-700",
};

export default function Navbar({ nome, perfil }: NavbarProps) {
  const pathname = usePathname();
  const links = LINKS[perfil] ?? [];
  const cor = COR[perfil] ?? "bg-gray-700";

  // useCallback — não recria a função a cada render
  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <nav className={`${cor} text-white`} aria-label="Navegação principal">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-bold text-lg tracking-tight" aria-label="Estacionamento - início">
          🅿️ Estacionamento
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80 hidden sm:block" aria-label={`Usuário: ${nome}`}>
            {nome}
          </span>
          <button
            onClick={handleSignOut}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
            aria-label="Sair do sistema"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Menu com indicador de rota ativa */}
      <div
        className="flex overflow-x-auto border-t border-white/20"
        role="menubar"
        aria-label="Menu de seções"
        style={{ scrollbarWidth: "none" }}
      >
        {links.map((link) => {
          const ativo = pathname === link.href || (link.href !== "/admin" && link.href !== "/operador" && link.href !== "/mensalista" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              aria-current={ativo ? "page" : undefined}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium transition whitespace-nowrap border-b-2
                ${ativo ? "border-white bg-white/10" : "border-transparent hover:bg-white/10"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
