"use client";

import { ConvexProvider as CP, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexProvider({ children }: { children: ReactNode }) {
  return <CP client={convex}>{children}</CP>;
}
