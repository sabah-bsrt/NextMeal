"use client";

import { InventoryProvider } from "@/context/InventoryContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <InventoryProvider>{children}</InventoryProvider>;
}
