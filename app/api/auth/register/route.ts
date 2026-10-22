import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      // Never select the password column. Returning the hash to the browser
      // would let anyone who sees the response attack it offline.
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(
      { message: "Usuário registrado com sucesso", user: newUser },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erro ao registrar usuário", err);

    // Prisma error codes say what actually went wrong. Surfacing the code
    // (never the raw message, which can carry connection details) turns a
    // blank 500 into something diagnosable from the browser.
    const code = (err as { code?: string })?.code;

    if (code === "P2021" || code === "P2022") {
      return NextResponse.json(
        {
          error:
            "O banco de dados ainda não tem as tabelas. Rode as migrações do Prisma.",
          code,
        },
        { status: 503 }
      );
    }

    if (code === "P1001" || code === "P1017") {
      return NextResponse.json(
        { error: "Não foi possível conectar ao banco de dados.", code },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao registrar usuário", code },
      { status: 500 }
    );
  }
}
