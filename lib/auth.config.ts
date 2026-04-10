import type { NextAuthConfig } from "next-auth";
import type { Perfil } from "@prisma/client";

// Config leve — sem imports Node.js (bcrypt, prisma, pg)
// Compatível com Edge Runtime (usado pelo middleware)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.perfil = (user as { perfil: Perfil }).perfil;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.perfil = token.perfil as Perfil;
      }
      return session;
    },
  },
  providers: [], // providers ficam só no auth.ts completo
};
