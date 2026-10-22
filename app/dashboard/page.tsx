"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "../_components/header";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  date: string;
};

type MonthHistory = {
  mes: string;
  ganhos: number;
  gastos: number;
  saldo: number;
};

type DashboardData = {
  totais: {
    entradas: number;
    saidas: number;
    saldo: number;
    totalTransacoes: number;
  };
  historico: MonthHistory[];
  ultimasTransacoes: Transaction[];
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "income" | "expense" | "balance";
  icon: string;
}) {
  const valueColor =
    tone === "income"
      ? "text-success-500"
      : tone === "expense"
        ? "text-danger-500"
        : value >= 0
          ? "text-primary-400"
          : "text-danger-500";

  const iconBg =
    tone === "income"
      ? "bg-success-500/10"
      : tone === "expense"
        ? "bg-danger-500/10"
        : "bg-primary-500/10";

  return (
    <div className="card">
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <span
          className={`${iconBg} shrink-0 rounded-lg px-2.5 py-2 text-lg leading-none`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>
        {money(value)}
      </p>

      <p className="mt-4 border-t border-border pt-4 text-xs text-text-muted">
        Referente a este mês
      </p>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === "entrada";

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg p-3 transition-colors hover:bg-bg-tertiary">
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
          <p className="truncate text-sm font-medium text-text-primary">
            {transaction.description || (isIncome ? "Entrada" : "Saída")}
          </p>
          <p className="text-xs text-text-muted">{shortDate(transaction.date)}</p>
        </div>
      </div>

      <p
        className={`shrink-0 text-sm font-semibold ${
          isIncome ? "text-success-400" : "text-danger-400"
        }`}
      >
        {isIncome ? "+" : "-"}
        {money(Math.abs(transaction.amount))}
      </p>
    </li>
  );
}

function MonthBar({ month }: { month: MonthHistory }) {
  const scale = Math.max(month.ganhos, month.gastos, 1);

  return (
    <div className="rounded-lg bg-bg-tertiary p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">{month.mes}</p>
        <p
          className={`text-xs font-semibold ${
            month.saldo >= 0 ? "text-success-400" : "text-danger-400"
          }`}
        >
          {money(month.saldo)}
        </p>
      </div>

      <div className="space-y-2">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-muted">Entradas</span>
            <span className="text-success-400">{money(month.ganhos)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-success-500 transition-[width] duration-700 ease-out"
              style={{ width: `${(month.ganhos / scale) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-muted">Saídas</span>
            <span className="text-danger-400">{money(month.gastos)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-danger-500 transition-[width] duration-700 ease-out"
              style={{ width: `${(month.gastos / scale) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const stored = localStorage.getItem("user");
      if (stored) setUserName(JSON.parse(stored).name || "");
    } catch {
      setUserName("");
    }

    const load = async () => {
      try {
        const response = await fetch("/api/dashboard/summary", {
          headers: { Authorization: token },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          setError(payload.error || "Não foi possível carregar o resumo.");
          return;
        }

        setData(payload.data);
      } catch {
        setError("Não foi possível falar com o servidor.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container-max py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-36 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container-max py-16 text-center">
          <h1 className="mb-2 text-xl font-bold">Algo deu errado</h1>
          <p className="mb-6 text-text-muted">
            {error || "Não foi possível carregar o resumo."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Tentar de novo
          </button>
        </main>
      </div>
    );
  }

  const hasTransactions = data.ultimasTransacoes.length > 0;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container-max py-8">
        <header className="mb-8">
          <h1 className="mb-1 text-3xl font-bold">
            {userName ? `Olá, ${userName}` : "Seu resumo"}
          </h1>
          <p className="text-text-muted">
            {data.totais.totalTransacoes} transações registradas neste mês.
          </p>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            label="Saldo do mês"
            value={data.totais.saldo}
            tone="balance"
            icon="◆"
          />
          <StatCard
            label="Entradas"
            value={data.totais.entradas}
            tone="income"
            icon="↑"
          />
          <StatCard
            label="Saídas"
            value={data.totais.saidas}
            tone="expense"
            icon="↓"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold">Últimas transações</h2>
              <Link
                href="/transactions"
                className="text-sm font-medium text-primary-400 transition-colors hover:text-primary-500"
              >
                Ver todas
              </Link>
            </div>

            {hasTransactions ? (
              <ul className="space-y-1">
                {data.ultimasTransacoes.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </ul>
            ) : (
              <div className="py-10 text-center">
                <p className="mb-4 text-text-muted">
                  Você ainda não registrou nenhuma transação.
                </p>
                <Link href="/transactions" className="btn btn-primary">
                  Registrar a primeira
                </Link>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-bold">Últimos 3 meses</h2>

            <div className="space-y-3">
              {data.historico.map((month) => (
                <MonthBar key={month.mes} month={month} />
              ))}
            </div>

            <Link href="/transactions" className="btn btn-outline mt-6 w-full">
              Gerenciar transações
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
