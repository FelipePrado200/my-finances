"use client";

import { useRouter } from "next/navigation";

type HeaderProps = {
  title: string;
};
export function Header({ title }: HeaderProps) {
  const router = useRouter();

  function handlelogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function handleNewTransaction() {
    router.push("/transactions");
  }

  return (
    <header className="flex items-center justify-between p-6 bg-transparent container-max">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg glass flex items-center justify-center elevated">
          <span className="text-xl font-bold">MF</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleNewTransaction} className="btn btn-ghost">
          Nova Transação
        </button>
        <button
          onClick={handlelogout}
          type="button"
          className="btn btn-primary"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
