"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];
const PROTECTED_ROUTES = ["/dashboard", "/projects"];

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      setChecking(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isProtected = PROTECTED_ROUTES.includes(pathname);

      // ❌ Not logged in → block only protected routes
      if (!user && isProtected) {
        router.replace("/login");
        return;
      }

      // ❌ Logged in → don't stay on login page
      if (user && pathname === "/login") {
        router.replace("/dashboard");
        return;
      }

      if (active) setChecking(false);
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}