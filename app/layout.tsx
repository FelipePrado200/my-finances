"use client";

import { Outfit } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 🔥 LÓGICA DE AUTENTICAÇÃO
    const publicRoutes = ["/login", "/register", "/"];

    // Verificar localStorage APENAS no cliente
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      // Se não tem token e não está em rota pública → redireciona para login
      if (!token && !publicRoutes.includes(pathname)) {
        router.push("/login");
      }

      // Se tem token e está em login → redireciona para dashboard
      if (token && pathname === "/login") {
        router.push("/dashboard");
      }
    }
  }, [pathname, router]);

  return (
    <html lang="pt-BR">
      <head>
        <title>Meu Financeiro</title>
        <meta
          name="description"
          content="Sistema de controle financeiro pessoal"
        />
      </head>
      <body
        className={`${outfit.variable} antialiased dark`}
      >
        {children}
      </body>
    </html>
  );
}
