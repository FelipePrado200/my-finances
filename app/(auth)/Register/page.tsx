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
      console.log("📌 RESPOSTA REGISTER:", data);

      if (!res.ok) {
        setError(data.message || "Erro ao criar usuário");
        return;
      }

      // 🔥 Agora o register DEVOLVE token e user
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redireciona
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.log("❌ erro no register:", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  // Se já estiver logado, redireciona
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/dashboard");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="glass p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Criar conta</h1>
          <p className="text-slate-300 mt-2">Preencha seus dados</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Nome
            </label>
            <input
              type="text"
              placeholder="Seu nome"
              className="w-full px-4 py-3 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="********"
              className="w-full px-4 py-3 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-transparent"
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
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>

        <div className="text-slate-300 mt-3">
          <Link href="/login" className="text-indigo-300 hover:text-indigo-200">
            Já tem uma conta? Clique aqui.
          </Link>
        </div>
      </div>
    </div>
  );
}
