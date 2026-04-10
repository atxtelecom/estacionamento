import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

const { auth } = NextAuth(authConfig);

const ROTAS_PUBLICAS = ["/login", "/vagas", "/api/auth", "/api/vagas"];

const ROTAS_PERMITIDAS: Record<string, string[]> = {
  ADMIN: ["/admin", "/operador", "/mensalista"],
  OPERADOR: ["/operador"],
  MENSALISTA: ["/mensalista"],
};

const PAINEL_POR_PERFIL: Record<string, string> = {
  ADMIN: "/admin",
  OPERADOR: "/operador",
  MENSALISTA: "/mensalista",
};

export default auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  if (ROTAS_PUBLICAS.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const session = req.auth;

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const perfil = (session.user as { perfil?: string }).perfil ?? "";
  const rotasDoUsuario = ROTAS_PERMITIDAS[perfil] ?? [];
  const temAcesso = rotasDoUsuario.some((rota) => pathname.startsWith(rota));

  if (!temAcesso) {
    return NextResponse.redirect(
      new URL(PAINEL_POR_PERFIL[perfil] ?? "/login", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico)$).*)"],
};
