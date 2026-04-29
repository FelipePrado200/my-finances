"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    if (token) router.push("/dashboard");
  }, [router]);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erro ao criar usuário");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
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
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#34d399]/10 blur-[120px] pointer-events-none"></div>

      <div className="glass-panel p-10 rounded-3xl w-full max-w-md relative z-10 mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_0_20px_rgba(124,58,237,0.4)] mb-6">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Criar conta</h1>
          <p className="text-muted text-lg">Preencha seus dados para começar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-500/10 border border-danger-500/20 text-danger-500 rounded-xl text-sm flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300 ml-1">
              Nome
            </label>
            <input
              type="text"
              placeholder="Como prefere ser chamado?"
              className="w-full px-5 py-3.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <label className="block text-sm font-medium text-slate-300 ml-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="Crie uma senha forte"
              className="w-full px-5 py-3.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-base shadow-lg shadow-primary-500/25 mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mr-3"></div>
                Registrando...
              </span>
            ) : (
              "Criar minha conta"
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-white/5">
          <p className="text-muted text-sm">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
