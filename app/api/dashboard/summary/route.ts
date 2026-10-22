// app/api/dashboard/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { toNumber, serializeTransaction } from "@/lib/serialize";

// Função para pegar userId do token
function getUserIdFromToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header) {
    console.log("❌ Nenhum cabeçalho de autorização");
    return null;
  }

  const token = header.replace("Bearer ", "").trim();

  if (!token) {
    console.log("❌ Token vazio");
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("✅ Token decodificado:", decoded);

    // Retorna o userId ou id (o que estiver no token)
    return decoded.userId || decoded.id;
  } catch (error: any) {
    console.error("❌ Erro ao verificar token:", error.message);
    return null;
  }
}

// GET - Pegar dados do dashboard
export async function GET(req: NextRequest) {
  console.log("🚀 GET /api/dashboard chamado");

  // 1. Verificar autenticação
  const userId = getUserIdFromToken(req);

  if (!userId) {
    console.log("🔒 Acesso negado - usuário não autenticado");
    return NextResponse.json(
      {
        success: false,
        error: "Não autorizado",
        message: "Token inválido ou expirado",
      },
      { status: 401 }
    );
  }

  console.log("✅ Usuário autorizado:", userId);

  try {
    const { default: prisma } = await import("@/lib/prisma");
    // 2. Calcular período do mês atual
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    console.log(
      `📅 Período: ${primeiroDiaMes.toLocaleDateString(
        "pt-BR"
      )} a ${ultimoDiaMes.toLocaleDateString("pt-BR")}`
    );

    // 3. Buscar transações do mês atual
    const transacoesMesAtual = await prisma.transaction.findMany({
      where: {
        userId: userId,
        date: {
          gte: primeiroDiaMes,
          lte: ultimoDiaMes,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    console.log(
      `📊 ${transacoesMesAtual.length} transações encontradas no mês`
    );

    // 4. Calcular totais
    let totalEntradas = 0;
    let totalSaidas = 0;

    transacoesMesAtual.forEach((trans) => {
      if (trans.type === "entrada") {
        totalEntradas += toNumber(trans.amount);
      } else if (trans.type === "saida") {
        totalSaidas += toNumber(trans.amount);
      }
    });

    const saldo = totalEntradas - totalSaidas;

    // 5. Pegar últimas 5 transações (de todos os tempos)
    const ultimasTransacoes = await prisma.transaction.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    });

    // 6. Pegar transações dos últimos 3 meses para histórico
    const historicoMensal: Array<{
      mes: string;
      ganhos: number;
      gastos: number;
      saldo: number;
    }> = [];
    const nomesMeses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    for (let i = 2; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const primeiroDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
      const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);

      const transacoesMes = await prisma.transaction.findMany({
        where: {
          userId: userId,
          date: {
            gte: primeiroDia,
            lte: ultimoDia,
          },
        },
      });

      const ganhos = transacoesMes
        .filter((t) => t.type === "entrada")
        .reduce((total, t) => total + toNumber(t.amount), 0);

      const gastos = transacoesMes
        .filter((t) => t.type === "saida")
        .reduce((total, t) => total + toNumber(t.amount), 0);

      historicoMensal.push({
        mes: nomesMeses[mes.getMonth()],
        ganhos: ganhos,
        gastos: gastos,
        saldo: ganhos - gastos,
      });
    }

    // 7. Formatar resposta
    const resposta = {
      success: true,
      data: {
        totais: {
          entradas: totalEntradas,
          saidas: totalSaidas,
          saldo: saldo,
          totalTransacoes: transacoesMesAtual.length,
        },
        historico: historicoMensal,
        ultimasTransacoes: ultimasTransacoes.map(serializeTransaction),
      },
    };

    console.log("✅ Dashboard gerado com sucesso!");
    return NextResponse.json(resposta);
  } catch (error: any) {
    console.error("💥 ERRO NO DASHBOARD:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
