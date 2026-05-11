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
    description: "Configure funding rounds",
  },
  {
    label: "Cap Table",
    href: "/simulator/cap-table",
    icon: PieChart,
    description: "View ownership breakdown",
  },
  {
    label: "Waterfall",
    href: "/simulator/waterfall",
    icon: ArrowDownToLine,
    description: "Simulate exit outcomes",
  },
  {
    label: "Compare",
    href: "/simulator/compare",
    icon: GitCompare,
    description: "Compare scenarios",
  },
];

export function SimulatorNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4 w-56 border-r min-h-[calc(100vh-3.5rem)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-medium">{item.label}</div>
              <div
                className={cn(
                  "text-xs",
                  isActive
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}
              >
                {item.description}
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
