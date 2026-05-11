import Link from "next/link";
import { DollarSign } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <DollarSign className="h-5 w-5" />
          <span>PreMoney</span>
          <span className="text-xs font-normal text-muted-foreground hidden sm:inline">
            Venture Simulator
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-6 text-sm">
          <Link
            href="/simulator/rounds"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Simulator
          </Link>
        </nav>
      </div>
    </header>
  );
}
