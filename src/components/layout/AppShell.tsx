"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInternalOrAdmin = pathname?.startsWith("/admin") || pathname?.startsWith("/internal");

  if (isInternalOrAdmin) {
    return (
      <main className="w-full min-h-screen bg-[#f4f7f5] dark:bg-[#04120a] transition-colors duration-300">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 w-full">{children}</div>
      <Footer />
      <CartDrawer />
    </>
  );
}
