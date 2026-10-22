"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/register", "/"];

/**
 * Client side route guard.
 * It lives in its own component so the root layout can stay a server
 * component and keep the Next.js `metadata` export.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/login");
      return;
    }

    if (token && (pathname === "/login" || pathname === "/register")) {
      router.push("/dashboard");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
