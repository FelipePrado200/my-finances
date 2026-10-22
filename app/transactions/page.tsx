"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../_components/header";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  date: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const fullDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/** First day of the month two months back, which is the oldest date allowed. */
function minAllowedDate() {
  const min = new Date();
  min.setMonth(min.getMonth() - 2);
  min.setDate(1);
  min.setHours(0, 0, 0, 0);
  return min;
}

export default function TransactionsPage() {
  const router = useRouter();

  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [descricao, setDescricao] = useState("");
  const [dataTransacao, setDataTransacao] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchTransactions(authToken: string) {
      setIsLoading(true);
      setError("");

      try {
        const res = await fetch("/api/transactions", {
          headers: { Authorization: authToken },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erro ao carregar transações.");
        }

        setTransactions(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e.message || "Falha ao carregar transações.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions(token);
  }, [router]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === "entrada") acc.entradas += t.amount;
        else acc.saidas += t.amount;
        return acc;
      },
      { entradas: 0, saidas: 0 }
    );
  }, [transactions]);

  const saldo = totals.entradas - totals.saidas;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const parsedValue = parseFloat(valor);
    if (!valor || Number.isNaN(parsedValue) || parsedValue <= 0) {
      setError("Digite um valor maior que zero.");
      return;
    }

    if (!descricao.trim()) {
      setError("Digite uma descrição.");
      return;
    }

    const selected = new Date(dataTransacao + "T00:00:00");
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selected < minAllowedDate() || selected > today) {
      setError("A data deve estar dentro dos últimos 3 meses.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          amount: parsedValue,
          type: tipo,
          description: descricao.trim(),
          date: selected.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar transação.");
      }

      setTransactions((current) => [data, ...current]);
      setValor("");
      setDescricao("");
      setDataTransacao(new Date().toISOString().slice(0, 10));
      setNotice("Transação registrada.");
    } catch (e: any) {
      setError(e.message || "Erro ao criar transação.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(id: string) {
    if (!confirm("Excluir esta transação?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setNotice("");

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
        throw new Error(data.error || "Erro ao excluir transação.");
      }

      setTransactions((current) => current.filter((t) => t.id !== id));
      setNotice("Transação excluída.");
    } catch (e: any) {
      setError(e.message || "Erro ao excluir transação.");
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Transações" />

      <main className="container-max py-8">
        <header className="mb-8">
          <h1 className="mb-1 text-3xl font-bold">Transações</h1>
          <p className="text-text-muted">
            Registre entradas e saídas dos últimos 3 meses.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Form */}
          <section className="card lg:col-span-2">
            <h2 className="mb-5 text-lg font-bold">Nova transação</h2>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400"
              >
                {error}
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="mb-4 rounded-lg border border-success-500/30 bg-success-500/10 p-3 text-sm text-success-400"
              >
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tipo">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo("entrada")}
                    aria-pressed={tipo === "entrada"}
                    className={`btn ${
                      tipo === "entrada" ? "btn-success" : "btn-outline"
                    }`}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo("saida")}
                    aria-pressed={tipo === "saida"}
                    className={`btn ${
                      tipo === "saida" ? "btn-danger" : "btn-outline"
                    }`}
                  >
                    Saída
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="valor">Valor (R$)</label>
                <input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="descricao">Descrição</label>
                <input
                  id="descricao"
                  type="text"
                  placeholder="Mercado, salário, aluguel"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="data">Data</label>
                <input
                  id="data"
                  type="date"
                  value={dataTransacao}
                  onChange={(e) => setDataTransacao(e.target.value)}
                  min={minAllowedDate().toISOString().slice(0, 10)}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary w-full"
              >
                {saving ? "Salvando..." : "Registrar transação"}
              </button>
            </form>
          </section>

          {/* List */}
          <section className="lg:col-span-3">
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="card card-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Entradas
                </p>
                <p className="text-lg font-bold text-success-400">
                  {money(totals.entradas)}
                </p>
              </div>
              <div className="card card-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Saídas
                </p>
                <p className="text-lg font-bold text-danger-400">
                  {money(totals.saidas)}
                </p>
              </div>
              <div className="card card-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Saldo
                </p>
                <p
                  className={`text-lg font-bold ${
                    saldo >= 0 ? "text-primary-400" : "text-danger-400"
                  }`}
                >
                  {money(saldo)}
                </p>
              </div>
            </div>

            <div className="card">
              <h2 className="mb-4 text-lg font-bold">
                Histórico
                {transactions.length > 0 && (
                  <span className="ml-2 text-sm font-medium text-text-muted">
                    {transactions.length}
                  </span>
                )}
              </h2>

              {isLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-lg bg-bg-tertiary"
                    />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <p className="py-10 text-center text-text-muted">
                  Nenhuma transação registrada ainda.
                </p>
              ) : (
                <ul className="space-y-2">
                  {transactions.map((t) => {
                    const isIncome = t.type === "entrada";
                    return (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:border-border-light"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                              isIncome
                                ? "bg-success-500/15 text-success-400"
                                : "bg-danger-500/15 text-danger-400"
                            }`}
                            aria-hidden="true"
                          >
                            {isIncome ? "+" : "-"}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {t.description || (isIncome ? "Entrada" : "Saída")}
                            </p>
                            <p className="text-xs text-text-muted">
                              {fullDate(t.date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span
                            className={`text-sm font-semibold ${
                              isIncome ? "text-success-400" : "text-danger-400"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {money(Math.abs(t.amount))}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteTransaction(t.id)}
                            aria-label={`Excluir ${t.description || "transação"}`}
                            className="btn btn-ghost btn-sm text-text-muted hover:text-danger-400"
                          >
                            Excluir
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
