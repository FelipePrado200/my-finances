// app/dashboard/page.tsx - VERSÃO REFATORADA COM DESIGN PREMIUM
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../_components/header";
import { Hero } from "../_components/hero";
import Link from "next/link";

function DashboardCard({
  title,
  value,
  type,
  icon,
}: {
  title: string;
  value: number;
  type: "income" | "expense" | "balance";
  icon: string;
}) {
  const getColors = () => {
    switch (type) {
      case "income":
        return "text-success-400";
      case "expense":
        return "text-danger-500";
      case "balance":
        return value >= 0 ? "text-primary-400 text-gradient" : "text-danger-500";
    }
  };

  const getBgGlow = () => {
    switch (type) {
      case "income":
        return "shadow-[0_0_30px_rgba(16,185,129,0.15)]";
      case "expense":
        return "shadow-[0_0_30px_rgba(244,63,94,0.15)]";
      case "balance":
        return "shadow-[0_0_30px_rgba(124,58,237,0.2)]";
    }
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  return (
    <div className={`glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${getBgGlow()}`}>
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
      
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl backdrop-blur-md border border-white/10">
          {icon}
        </div>
      </div>
      
      <div>
        <p className={`text-4xl font-bold tracking-tight ${getColors()}`}>
          {formatMoney(value)}
        </p>
      </div>
      
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-slate-500">Relativo a este mês</span>
        <span className="text-xs font-medium bg-white/5 px-2 py-1 rounded-md text-slate-300">Atualizado</span>
      </div>
    </div>
  );
}

function RecentTransaction({ transaction }: { transaction: any }) {
  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const isIncome = transaction.type === "entrada";

  return (
    <div className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/10 group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
          isIncome ? "bg-success-500/10 text-success-400 border border-success-500/20" : "bg-danger-500/10 text-danger-500 border border-danger-500/20"
        }`}>
          <span className="text-xl">
            {isIncome ? "↗" : "↘"}
          </span>
        </div>
        <div>
          <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
            {transaction.description}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{transaction.date}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`font-bold text-lg ${isIncome ? "text-success-400" : "text-white"}`}>
          {isIncome ? "+" : "-"}{formatMoney(transaction.amount)}
        </span>
      </div>
    </div>
  );
}

function HistoryItem({
  month,
  income,
  expense,
}: {
  month: string;
  income: number;
  expense: number;
}) {
  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  const maxValue = Math.max(income, expense, 100); // Evitar divisão por zero
  const balance = income - expense;

  return (
    <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="flex justify-between items-center mb-5">
        <span className="font-bold text-slate-200 uppercase tracking-widest text-sm">{month}</span>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
          balance >= 0 ? "bg-success-500/10 text-success-400 border-success-500/20" : "bg-danger-500/10 text-danger-400 border-danger-500/20"
        }`}>
          {balance >= 0 ? "+" : ""}{formatMoney(balance)}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-400">Entradas</span>
            <span className="text-success-400">{formatMoney(income)}</span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-success-400 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${(income / maxValue) * 100}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30"></div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-400">Saídas</span>
            <span className="text-danger-400">{formatMoney(expense)}</span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-danger-500 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${(expense / maxValue) * 100}%` }}
            >
               <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      fetchDashboardData(token);
    }
  }, [router]);

  async function fetchDashboardData(token: string) {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/dashboard/summary", {
        headers: { Authorization: token },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.error || "Erro ao carregar dados");
      }
    } catch (err: any) {
      setError(err.message || "Falha ao carregar dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  const handleRefresh = () => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchDashboardData(token);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014]">
        <Header title="Meu Financeiro" />
        <div className="container mx-auto p-4">
          <Hero />
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-slate-400 font-medium animate-pulse">
              Sincronizando seus dados financeiros...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] relative">
      {/* Subtle Aurora Background for Dashboard */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary-600/20 blur-[100px]"></div>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-[#38bdf8]/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        <Header title="Meu Financeiro" />

        <div className="container-max mx-auto p-4 md:p-8">
          <Hero />

          <div className="flex justify-between items-center mb-6 mt-4">
            <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
            <button
              onClick={handleRefresh}
              className="btn btn-ghost hover:bg-white/5 text-sm"
            >
              <span className="mr-2">↻</span> Sincronizar
            </button>
          </div>

          {/* Cards de Resumo - Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <DashboardCard
              title="Receitas"
              value={dashboardData?.totais.entradas || 0}
              type="income"
              icon="💰"
            />

            <DashboardCard
              title="Despesas"
              value={dashboardData?.totais.saidas || 0}
              type="expense"
              icon="💳"
            />

            <DashboardCard
              title="Saldo Atual"
              value={dashboardData?.totais.saldo || 0}
              type="balance"
              icon={dashboardData?.totais.saldo >= 0 ? "✨" : "⚠️"}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Últimas Transações (Ocupa 2 colunas no XL) */}
            <div className="xl:col-span-2 glass-panel p-1 flex flex-col h-[500px]">
              <div className="p-6 pb-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">
                    ⟲
                  </div>
                  <h2 className="text-xl font-bold text-white">Últimas Transações</h2>
                </div>
                <Link
                  href="/transactions"
                  className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Ver todas →
                </Link>
              </div>

              <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
                {dashboardData?.ultimasTransacoes?.length > 0 ? (
                  <div className="space-y-1">
                    {dashboardData.ultimasTransacoes.map((trans: any) => (
                      <RecentTransaction key={trans.id} transaction={trans} />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10 text-3xl">
                      📊
                    </div>
                    <p className="text-white font-medium mb-1">Nenhuma transação</p>
                    <p className="text-slate-400 text-sm">Suas transações recentes aparecerão aqui.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Histórico Mensal */}
            <div className="glass-panel p-1 flex flex-col h-[500px]">
              <div className="p-6 pb-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
                    📈
                  </div>
                  <h2 className="text-xl font-bold text-white">Desempenho</h2>
                </div>
              </div>

              <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-4">
                {dashboardData?.historico?.length > 0 ? (
                  dashboardData.historico.map((month: any, index: number) => (
                    <HistoryItem
                      key={index}
                      month={month.mes}
                      income={month.ganhos}
                      expense={month.gastos}
                    />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="text-4xl mb-4 opacity-50">📅</div>
                    <p className="text-white font-medium mb-1">Sem histórico</p>
                    <p className="text-slate-400 text-sm">O histórico será gerado conforme você adiciona transações.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estatísticas Rápidas (Mini Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="glass p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Transações Totais</span>
              <span className="text-3xl font-bold text-white">{dashboardData?.totais.totalTransacoes || 0}</span>
            </div>
            
            <div className="glass p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Status do Mês</span>
              <span className="text-3xl">{dashboardData?.historico?.[0]?.ganhos >= dashboardData?.historico?.[0]?.gastos ? "🔥" : "🧊"}</span>
            </div>
            
            <div className="glass p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Transações Recentes</span>
              <span className="text-3xl font-bold text-primary-400">{dashboardData?.ultimasTransacoes?.length || 0}</span>
            </div>

            <div className="glass p-5 rounded-2xl flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary-600/20 to-transparent border-primary-500/30">
              <Link href="/transactions" className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">➕</span>
                <span className="text-sm font-medium text-white">Nova Transação</span>
              </Link>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 glass border-danger-500/30 bg-danger-500/10 rounded-2xl flex items-start">
              <span className="text-2xl mr-4">⚠️</span>
              <div>
                <h4 className="text-white font-bold mb-1">Falha na sincronização</h4>
                <p className="text-slate-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-12 mb-8 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Dashboard Financeiro <span className="mx-2 opacity-30">|</span> Next.js 15 & Prisma
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
