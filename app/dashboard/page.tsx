// app/dashboard/page.tsx - NOVO DESIGN PREMIUM 2026
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../_components/header";
import Link from "next/link";

interface DashboardData {
  saldo: number;
  entradas: number;
  saidas: number;
  ultimasTransacoes: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    date: string;
  }>;
  historicoMensal: Array<{
    mes: string;
    entradas: number;
    saidas: number;
  }>;
}

function StatCard({
  label,
  value,
  type,
  icon,
  trend,
}: {
  label: string;
  value: number;
  type: "income" | "expense" | "balance";
  icon: string;
  trend?: number;
}) {
  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const getColorClass = () => {
    switch (type) {
      case "income":
        return "text-success-500";
      case "expense":
        return "text-danger-500";
      case "balance":
        return value >= 0 ? "text-primary-500" : "text-danger-500";
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "income":
        return "bg-success-500/10";
      case "expense":
        return "bg-danger-500/10";
      case "balance":
        return "bg-primary-500/10";
    }
  };

  return (
    <div className="card group hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-text-muted uppercase tracking-wide">
            {label}
          </p>
        </div>
        <div className={`${getBgColor()} p-2.5 rounded-lg text-lg`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <p className={`text-3xl font-bold ${getColorClass()}`}>
          {formatMoney(value)}
        </p>
        {trend !== undefined && (
          <span className={`text-xs font-semibold ${trend >= 0 ? "text-success-500" : "text-danger-500"}`}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>

      <div className="pt-4 border-t border-border text-xs text-text-muted">
        Período: este mês
      </div>
    </div>
  );
}

function TransactionItem({ transaction }: { transaction: any }) {
  const isIncome = transaction.type === "income";

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-tertiary/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
            isIncome ? "bg-success-500/20 text-success-500" : "bg-danger-500/20 text-danger-500"
          }`}
        >
          {isIncome ? "📥" : "📤"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {transaction.description || (isIncome ? "Receita" : "Despesa")}
          </p>
          <p className="text-xs text-text-muted">{formatDate(transaction.date)}</p>
        </div>
      </div>
      <p className={`text-sm font-semibold ${isIncome ? "text-success-500" : "text-danger-500"}`}>
        {isIncome ? "+" : "-"}{formatMoney(Math.abs(transaction.amount))}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard/summary", {
          headers: { Authorization: token },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Erro ao buscar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 rounded-lg bg-primary-500/20 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="container-max py-12">
          <div className="text-center">
            <p className="text-text-muted mb-4">Erro ao carregar dashboard</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Recarregar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="container-max py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Bem-vindo, Felipe 👋
          </h1>
          <p className="text-text-muted">Aqui está um resumo do seu controle financeiro</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Saldo Total"
            value={dashboardData.saldo}
            type="balance"
            icon="💰"
            trend={dashboardData.saldo >= 0 ? 12 : -5}
          />
          <StatCard
            label="Entradas (Mês)"
            value={dashboardData.entradas}
            type="income"
            icon="📈"
            trend={8}
          />
          <StatCard
            label="Saídas (Mês)"
            value={dashboardData.saidas}
            type="expense"
            icon="📉"
            trend={3}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions List */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text-primary">
                  Últimas Transações
                </h2>
                <Link href="/transactions" className="text-primary-500 text-sm font-medium hover:text-primary-400 transition">
                  Ver tudo →
                </Link>
              </div>

              <div className="space-y-2">
                {dashboardData.ultimasTransacoes && dashboardData.ultimasTransacoes.length > 0 ? (
                  dashboardData.ultimasTransacoes.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))
                ) : (
                  <p className="text-text-muted text-center py-8">
                    Nenhuma transação registrada ainda
                  </p>
                )}
              </div>

              {!dashboardData.ultimasTransacoes || dashboardData.ultimasTransacoes.length === 0 ? (
                <Link href="/transactions" className="btn btn-primary w-full mt-4">
                  Adicionar Transação
                </Link>
              ) : null}
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="card">
            <h3 className="text-lg font-bold text-text-primary mb-6">
              Últimos 3 Meses
            </h3>

            <div className="space-y-4">
              {dashboardData.historicoMensal && dashboardData.historicoMensal.map((month, index) => (
                <div key={index} className="p-3 rounded-lg bg-bg-tertiary/50">
                  <p className="text-sm font-medium text-text-muted mb-3">{month.mes}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Entradas:</span>
                      <span className="text-success-400 font-semibold">
                        +{new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(month.entradas)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Saídas:</span>
                      <span className="text-danger-400 font-semibold">
                        -{new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(month.saidas)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/transactions" className="btn btn-outline w-full mt-6">
              Gerenciar Transações
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
