import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function getPrisma() {
  const { default: prisma } = await import("@/lib/prisma");
  return prisma;
}

function getUserId(req: NextRequest) {
  const header = req.headers.get("authorization");
  if (!header) return null;

  const token = header.replace("Bearer ", "").trim();

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // TENTA VÁRIOS CAMPOS POSSÍVEIS
    return decoded.userId || decoded.id || decoded.sub || decoded.user?.id;
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

// GET – listar transações
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "token inválido" }, { status: 401 });
    }

    const prisma = await getPrisma();
    const transations = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transations);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "erro no GET" }, { status: 500 });
  }
}

// POST – criar transação
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "token inválido" }, { status: 401 });
    }

    const { amount, type, description, date } = await req.json();

    // Se o cliente enviar uma data válida, use-a; caso contrário, use a data atual
    let parsedDate: Date | undefined = undefined;
    if (date) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) parsedDate = d;
    }

    const prisma = await getPrisma();
    const newTransation = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        description,
        userId,
        date: parsedDate || new Date(),
      },
    });

    return NextResponse.json(newTransation);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "erro no POST" }, { status: 500 });
  }
}

// PUT – atualizar transação
export async function PUT(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "token inválido" }, { status: 401 });
    }

    const { id, amount, type, description } = await req.json();

    const prisma = await getPrisma();
    const userExist = await prisma.transaction.findUnique({ where: { id } });

    if (!userExist || userExist.userId !== userId) {
      return NextResponse.json({ error: "não autorizado" }, { status: 403 });
    }

    const att = await prisma.transaction.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        type,
        description,
      },
    });

    return NextResponse.json(att);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "erro no PUT" }, { status: 500 });
  }
}

// DELETE – apagar transação
export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "token inválido" }, { status: 401 });
    }

    const { id } = await req.json(); // 🔥 corrigido

    const prisma = await getPrisma();
    const userExist = await prisma.transaction.findUnique({ where: { id } });

    if (!userExist || userExist.userId !== userId) {
      return NextResponse.json({ error: "não autorizado" }, { status: 403 });
    }

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({ message: "apagado com sucesso" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "erro no DELETE" }, { status: 500 });
  }
}
