"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center space-y-4">
        <p className="text-5xl">⚠️</p>
        <h2 className="text-xl font-bold text-gray-800">Algo deu errado</h2>
        <p className="text-sm text-gray-500">
          Não foi possível carregar o painel. Verifique a conexão e tente novamente.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={reset}
            className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Tentar novamente
          </button>
          <button
            onClick={() => router.push("/login")}
            className="border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
}
