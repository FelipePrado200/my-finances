// app/login/page.tsx - VERSÃO CORRIGIDA
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // ← ADICIONE useEffect AQUI!

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // ← ADICIONE ESTE ESTADO

  // 🔥 CORREÇÃO: Use useEffect, não useState!
  useEffect(() => {
    setIsClient(true); // Marca que estamos no cliente

    // Verificar token APENAS se estiver no cliente
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("⚠️ Já tem token, redirecionando...");
        router.push("/dashboard");
      }
    }
  }, [router]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    // Verificar se está no cliente
    if (typeof window === "undefined") return;

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
        // SALVA O TOKEN NO LOCALSTORAGE
        localStorage.setItem("token", data.token); // ⚠️ REMOVA "Bearer " se a API não precisa

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        console.log("✅ Login bem-sucedido! Token salvo:", data.token);

        // Redireciona para dashboard
        router.push("/dashboard");
        router.refresh(); // Força atualização
      } else {
        // Mostra erro específico da API ou erro genérico
        setError(data.message || data.error || "Credenciais inválidas");
        console.error("❌ Erro no login:", data);
      }
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  // 🔥 Se não estiver no cliente ainda, mostra loading
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-500/60 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-200">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="glass p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Login</h1>
          <p className="text-slate-300 mt-2">Acesse sua conta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-3 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Senha
            </label>
            <input
              type="password"
              placeholder="Sua senha"
              className="w-full px-4 py-3 border text-slate-100 border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mb-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="text-center mt-4">
          <Link
            href="/register"
            className="text-indigo-300 hover:text-indigo-200 font-medium"
          >
            Deseja se registrar? Clique aqui.
          </Link>
        </div>
      </div>
    </div>
  );
}
