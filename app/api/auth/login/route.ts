// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Import do Prisma será feito dinamicamente dentro do handler

export async function POST(req: NextRequest) {
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // CRIANDO O TOKEN COM userId
    const token = jwt.sign(
      {
        userId: user.id, // ✅ ESSE É O CAMPO QUE VOCÊ PRECISA
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
