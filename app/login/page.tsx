"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const result = await signIn("credentials", { email, senha, redirect: false });

    setCarregando(false);

    if (result?.error) {
      setErro("Email ou senha inválidos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 text-base outline-none transition"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Senha
        </label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 text-base outline-none transition"
          placeholder="••••••••"
        />
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {erro}
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold py-4 rounded-xl text-lg transition disabled:opacity-50 mt-2"
      >
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-700 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-blue-700 text-white text-center py-8 px-6">
          <div className="text-5xl mb-2">🅿️</div>
          <h1 className="text-2xl font-bold">Estacionamento</h1>
          <p className="text-blue-200 text-sm mt-1">Acesso ao sistema</p>
        </div>

        <Suspense fallback={<div className="p-6 text-center text-gray-400">Carregando...</div>}>
          <LoginForm />
        </Suspense>

        <div className="text-center pb-6">
          <a href="/vagas" className="text-sm text-gray-400 hover:text-gray-600 transition">
            Ver vagas disponíveis →
          </a>
        </div>
      </div>
    </main>
  );
}
