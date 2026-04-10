import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-700 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
        <p className="text-6xl font-black text-blue-600">404</p>
        <p className="text-5xl">🅿️</p>
        <h2 className="text-xl font-bold text-gray-800">Página não encontrada</h2>
        <p className="text-sm text-gray-500">
          Esta página não existe ou você não tem acesso a ela.
        </p>
        <Link
          href="/"
          className="block w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
