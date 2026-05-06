// app/login/page.tsx - VERSÃO CORRIGIDA E REFATORADA
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/dashboard");
      }
    }
  }, [router]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

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
        localStorage.setItem("token", data.token);

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.message || data.error || "Credenciais inválidas");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030014]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#030014] animate-aurora">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#38bdf8]/10 blur-[120px] pointer-events-none"></div>
      
      <div className="glass-panel p-10 rounded-3xl w-full max-w-md relative z-10 mx-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_0_20px_rgba(124,58,237,0.4)] mb-6">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Bem-vindo(a)</h1>
          <p className="text-muted text-lg">Acesse sua conta para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-500/10 border border-danger-500/20 text-danger-500 rounded-xl text-sm flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300 ml-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full px-5 py-3.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-sm font-medium text-slate-300">
                Senha
              </label>
              <a href="#" className="text-xs text-primary-400 hover:text-primary-500 transition-colors">
                Esqueceu a senha?
              </a>
            </div>
            <input
              type="password"
              placeholder="Sua senha secreta"
              className="w-full px-5 py-3.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-base shadow-lg shadow-primary-500/25 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mr-3"></div>
                Autenticando...
              </span>
            ) : (
              "Entrar na plataforma"
            )}
          </button>
        </form>
        
        <div className="text-center mt-8 pt-6 border-t border-white/5">
          <p className="text-muted text-sm">
            Ainda não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Criar conta agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
