"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Layers,
  PieChart,
  ArrowDownToLine,
  GitCompare,
} from "lucide-react";

const navItems = [
  {
    label: "Rounds",
    href: "/simulator/rounds",
    icon: Layers,
  },
  {
    label: "Cap Table",
    href: "/simulator/cap-table",
    icon: PieChart,
  },
  {
    label: "Waterfall",
    href: "/simulator/waterfall",
    icon: ArrowDownToLine,
  },
  {
    label: "Compare",
    href: "/simulator/compare",
    icon: GitCompare,
  },
];

export function SimulatorNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-col gap-1 w-52 min-h-[calc(100vh-3.5rem)]"
      style={{
        background: "var(--paper)",
        borderRight: "1px solid var(--ink-10)",
        padding: "20px 12px",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 transition-all",
              isActive ? "" : ""
            )}
            style={{
              borderRadius: "var(--r-pill)",
              fontWeight: 500,
              fontSize: "12.5px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: isActive ? "var(--cream)" : "var(--ink-60)",
              background: isActive ? "var(--navy-900)" : "transparent",
              transition: "all 160ms var(--ease)",
            }}
            onMouseOver={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "var(--cream-2)";
                e.currentTarget.style.color = "var(--navy-900)";
              }
            }}
            onMouseOut={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--ink-60)";
              }
            }}
          >
            <item.icon
              className="flex-shrink-0"
              style={{ width: "14px", height: "14px" }}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
