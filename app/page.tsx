import { redirect } from "next/navigation";

export default function Home() {
  // Redireciona para o dashboard no servidor para garantir rota raiz
  redirect("/dashboard");
}
