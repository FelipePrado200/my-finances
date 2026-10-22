"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type HeaderProps = {
  title?: string;
};

const links = [
  { href: "/dashboard", label: "Resumo" },
  { href: "/transactions", label: "Transações" },
];

export function Header({ title = "Meu Financeiro" }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <header className="border-b border-border bg-bg-secondary">
      <div className="container-max flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold text-white"
            aria-hidden="true"
          >
            MF
          </span>
          <span className="text-lg font-bold">{title}</span>
        </div>

        <nav className="flex items-center gap-1" aria-label="Navegação principal">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-bg-tertiary text-primary-400"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            type="button"
            className="btn btn-outline btn-sm ml-2"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
