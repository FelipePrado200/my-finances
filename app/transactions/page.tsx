// app/transactions/page.tsx - VERSÃO CORRIGIDA
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "../_components/header";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Transaction = {
  id: string;
  amount: number; // MUDADO: agora é number, não string
  type: string;
  description: string;
  date: string;
};

export default function TransactionsPage() {
  const router = useRouter();
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [descricao, setDescricao] = useState("");
  const [dataTransacao, setDataTransacao] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 CARREGAR TRANSAÇÕES
  useEffect(() => {
    async function fetchTransactions() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const res = await fetch("/api/transactions", {
          headers: {
            Authorization: token,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erro ao carregar transações");
        }

        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          console.error("Resposta não é array:", data);
          setTransactions([]);
        }
      } catch (e: any) {
        console.error("ERRO NO GET:", e);
        setError(e.message || "Falha ao carregar transações");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [router]);

  // 🔥 CRIAR TRANSAÇÃO
  async function handleTransaction(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Validações
    if (!valor || parseFloat(valor) <= 0) {
      setError("Digite um valor válido maior que zero");
      return;
    }

    // Validação da data: deve estar dentro dos últimos 3 meses
    const today = new Date();
    const selected = new Date(dataTransacao + "T00:00:00");
    const minDate = new Date();
    // considerar os últimos 3 meses incluindo o mês atual: min = dia 1 de 2 meses atrás
    minDate.setMonth(minDate.getMonth() - 2);
    minDate.setDate(1);
    // normaliza horas para comparação
    minDate.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);

    if (selected < minDate || selected > today) {
      setError("A data deve estar dentro dos últimos 3 meses");
      return;
    }

    if (!descricao.trim()) {
      setError("Digite uma descrição");
      return;
    }

    setError("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          amount: parseFloat(valor), // CONVERTE para número
          type: tipo,
          description: descricao.trim(),
          date: new Date(dataTransacao + "T00:00:00").toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar transação");
      }

      // Adicionar nova transação no início da lista
      setTransactions([data, ...transactions]);

      // Limpar formulário
      setValor("");
      setDescricao("");
      setDataTransacao(new Date().toISOString().slice(0, 10));

      // Redirecionar ao dashboard para refletir no histórico mensal
      router.push("/dashboard");
    } catch (e: any) {
      console.error("ERRO NO POST:", e);
      setError(e.message || "Erro ao criar transação");
    }
  }

  // 🔥 DELETAR TRANSAÇÃO
  async function deleteTransaction(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/transactions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao excluir transação");
      }

      // Remover da lista local
      setTransactions(transactions.filter((t) => t.id !== id));

      alert("✅ Transação excluída com sucesso!");
    } catch (e: any) {
      console.error("ERRO NO DELETE:", e);
      alert(`❌ Erro: ${e.message}`);
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Header title="Página de Transações" />

      <section className="container p-4 md:p-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FORMULÁRIO */}
          <div className="glass p-6 rounded-xl elevated text-slate-100">
            <h2 className="text-xl font-bold mb-6">➕ Adicionar Transação</h2>

            <form onSubmit={handleTransaction} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Valor (R$)
                </label>
                <input
                  className="w-full p-3 border rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 150.50"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Data</label>
                <input
                  type="date"
                  className="w-full p-3 border rounded text-white bg-transparent"
                  value={dataTransacao}
                  onChange={(e) => setDataTransacao(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  min={(() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - 2);
                    d.setDate(1);
                    return d.toISOString().slice(0, 10);
                  })()}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Tipo</label>
                <select
                  value={tipo}
                  className="w-full p-3 border rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="entrada" className="text-gray-300">
                    💰 Entrada (Dinheiro recebido)
                  </option>
                  <option value="saida" className="text-gray-300">
                    💸 Saída (Dinheiro gasto)
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Descrição
                </label>
                <input
                  className="w-full p-3 border rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  type="text"
                  placeholder="Ex: Salário, Mercado, Uber, Conta de luz"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                  ❌ {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full">
                📝 Adicionar Transação
              </button>
            </form>
          </div>

          {/* LISTA DE TRANSAÇÕES */}
          <div className="glass p-6 rounded-xl elevated text-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">📋 Suas Transações</h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {transactions.length}{" "}
                {transactions.length === 1 ? "transação" : "transações"}
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Carregando transações...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📭</div>
                <p className="mb-2">Nenhuma transação cadastrada</p>
                <p className="text-sm opacity-80">
                  Adicione sua primeira transação usando o formulário ao lado
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white/10 border border-white/20 p-4 rounded-lg hover:bg-white/20 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              t.type === "entrada"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          >
                            {t.type === "entrada" ? "ENTRADA" : "SAÍDA"}
                          </span>
                          <span className="font-bold text-lg">
                            R$ {t.amount.toFixed(2)}
                          </span>
                        </div>

                        <p className="mb-1">{t.description}</p>

                        <div className="flex justify-between items-center text-sm opacity-80">
                          <span>{formatDate(t.date)}</span>
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="btn btn-danger text-sm"
                            title="Excluir transação"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {transactions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/30">
                <p className="text-center text-sm opacity-80">
                  Total:{" "}
                  <span className="font-bold">
                    R${" "}
                    {transactions
                      .reduce(
                        (total, t) =>
                          t.type === "entrada"
                            ? total + t.amount
                            : total - t.amount,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center mt-4 glass p-6 rounded-xl shadow-lg">
          <Link
            href={"/dashboard"}
            className="btn btn-outline w-full text-center"
          >
            Clique aqui para retornar ao Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
