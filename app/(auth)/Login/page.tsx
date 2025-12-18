"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // SALVA O TOKEN NO LOCALSTORAGE - ESSA É A PARTE QUE FALTAVA!
        if (res.ok && data.token) {
          localStorage.setItem("token", `Bearer ${data.token}`);

          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }

          router.push("/dashboard");
          router.refresh();
        }

        console.log("✅ Login bem-sucedido! Token salvo:", data.token);

        // Redireciona para dashboard
        router.push("/dashboard");
        router.refresh(); // Força atualização
      } else {
        // Mostra erro específico da API ou erro genérico
        setError(data.message || "Credenciais inválidas");
        console.error("❌ Erro no login:", data);
      }
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  // Verifica se já está logado (redireciona se tiver token)
  useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("⚠️ Já tem token, redirecionando...");
      router.push("/dashboard");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
      <div className="bg-white  p-8 rounded-2xl shadow-2xl w-full max-w-md ">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Login</h1>
          <p className="text-gray-600 mt-2">Acesse sua conta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block  text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              placeholder="Sua senha"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
        <div className="text-black">
          <Link href="/Register">Deseja se registrar? clique aqui.</Link>
        </div>
      </div>
    </div>
  );
}
