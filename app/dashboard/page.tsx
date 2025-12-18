// app/dashboard/page.tsx - VERSÃO ATUALIZADA
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../_components/header";
import { Hero } from "../_components/hero";
import Link from "next/link";

// Componente de Card Dinâmico
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
        return "from-green-400 to-emerald-500";
      case "expense":
        return "from-red-400 to-pink-500";
      case "balance":
        return value >= 0
          ? "from-blue-400 to-indigo-500"
          : "from-yellow-400 to-orange-500";
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div
      className={`bg-gradient-to-br ${getColors()} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{formatMoney(value)}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-sm">Este mês</p>
      </div>
    </div>
  );
}

// Componente de Transação Recente
function RecentTransaction({ transaction }: { transaction: any }) {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-100">
      <div className="flex items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            transaction.type === "entrada" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <span
            className={`text-lg ${
              transaction.type === "entrada" ? "text-green-600" : "text-red-600"
            }`}
          >
            {transaction.type === "entrada" ? "⬆️" : "⬇️"}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-800">{transaction.description}</p>
          <p className="text-sm text-gray-500">{transaction.date}</p>
        </div>
      </div>
      <span
        className={`font-bold ${
          transaction.type === "entrada" ? "text-green-600" : "text-red-600"
        }`}
      >
        {transaction.type === "entrada" ? "+" : "-"}{" "}
        {formatMoney(transaction.amount)}
      </span>
    </div>
  );
}

// Componente de Histórico
function HistoryItem({
  month,
  income,
  expense,
}: {
  month: string;
  income: number;
  expense: number;
}) {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const maxValue = Math.max(income, expense, 5000); // Base para cálculo da barra

  return (
    <div className="space-y-3 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
      <div className="flex justify-between items-center">
        <span className="font-bold text-gray-800">{month.toUpperCase()}</span>
        <span
          className={`text-sm font-medium ${
            income - expense >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatMoney(income - expense)}
        </span>
      </div>

      {/* Barra de Entradas */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-600">Entradas</span>
          <span className="font-medium">{formatMoney(income)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(income / maxValue) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Barra de Saídas */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-red-600">Saídas</span>
          <span className="font-medium">{formatMoney(expense)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(expense / maxValue) * 100}%` }}
          ></div>
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
      router.push("/Login");
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
      console.error("❌ Erro no dashboard:", err);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        <Header title="Meu Financeiro" />
        <div className="container mx-auto p-4">
          <Hero />
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">
              Carregando seus dados financeiros...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header title="Meu Financeiro" />

      <div className="container mx-auto p-4 md:p-6">
        <Hero />

        {/* Botão de Atualizar */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-indigo-100"
          >
            <span>🔄</span>
            Atualizar Dados
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <DashboardCard
            title="Entradas"
            value={dashboardData?.totais.entradas || 0}
            type="income"
            icon="💰"
          />

          <DashboardCard
            title="Saídas"
            value={dashboardData?.totais.saidas || 0}
            type="expense"
            icon="💸"
          />

          <DashboardCard
            title="Saldo Atual"
            value={dashboardData?.totais.saldo || 0}
            type="balance"
            icon={dashboardData?.totais.saldo >= 0 ? "⚖️" : "⚠️"}
          />
        </div>

        {/* Conteúdo Principal */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimas Transações */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Últimas Transações
              </h2>
              <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                {dashboardData?.totais.totalTransacoes || 0} total
              </span>
            </div>

            {dashboardData?.ultimasTransacoes?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.ultimasTransacoes.map((trans: any) => (
                  <RecentTransaction key={trans.id} transaction={trans} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500 mb-2">
                  Nenhuma transação registrada ainda
                </p>
                <p className="text-gray-400 text-sm">
                  Suas transações aparecerão aqui
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link
                href="/transactions"
                className="block w-full text-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Ver todas as transações →
              </Link>
            </div>
          </div>

          {/* Histórico Mensal */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Histórico Mensal
              </h2>
              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                Últimos 3 meses
              </span>
            </div>

            {dashboardData?.historico?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.historico.map((month: any, index: number) => (
                  <HistoryItem
                    key={index}
                    month={month.mes}
                    income={month.ganhos}
                    expense={month.gastos}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-gray-500 mb-2">Sem histórico disponível</p>
                <p className="text-gray-400 text-sm">
                  O histórico será gerado com o tempo
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                * Baseado nas transações registradas no sistema
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas Adicionais */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-gray-800">
              {dashboardData?.totais.totalTransacoes || 0}
            </p>
            <p className="text-gray-600 text-sm">Transações</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-green-600">
              {dashboardData?.historico?.[0]?.ganhos ? "💰" : "📈"}
            </p>
            <p className="text-gray-600 text-sm">Mês atual</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-red-600">
              {dashboardData?.historico?.[0]?.gastos ? "💸" : "📉"}
            </p>
            <p className="text-gray-600 text-sm">Despesas</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {dashboardData?.ultimasTransacoes?.length || 0}
            </p>
            <p className="text-gray-600 text-sm">Recentes</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 p-8 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-center relative overflow-hidden">
          {/* Elementos decorativos */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-3">
              {dashboardData?.totais.totalTransacoes
                ? `Você está no controle das suas finanças!`
                : "Dê o primeiro passo para organizar suas finanças!"}
            </h3>

            <p className="mb-6 opacity-90">
              {dashboardData?.totais.totalTransacoes
                ? `Continue registrando suas transações para ter um histórico completo.`
                : "Registre sua primeira transação e comece a acompanhar seus gastos e ganhos."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/transactions"
                className="inline-flex items-center justify-center bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105"
              >
                {dashboardData?.totais.totalTransacoes
                  ? "Ver todas as transações"
                  : "Criar primeira transação"}
                <span className="ml-2">→</span>
              </Link>

              {dashboardData?.totais.totalTransacoes > 0 && (
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-lg font-bold transition-all duration-300"
                >
                  Atualizar Dashboard
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-500 mr-2">❌</span>
              <div>
                <p className="text-red-700 font-medium">
                  Erro ao carregar dados
                </p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Informativo */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Sistema desenvolvido com Next.js 14, TypeScript, Prisma e SQLite
            <span className="mx-2">•</span>
            Dados atualizados em tempo real
          </p>
        </div>
      </div>
    </div>
  );
}
