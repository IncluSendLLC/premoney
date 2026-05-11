import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "var(--paper)",
        borderBottom: "1px solid var(--ink-10)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-[1480px] items-center px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/premoney-logo.png"
            alt="PreMoney"
            width={30}
            height={30}
            className="flex-shrink-0"
          />
          <div className="flex flex-col">
            <span
              className="leading-none"
              style={{
                fontWeight: 600,
                fontSize: "16px",
                color: "var(--navy-900)",
              }}
            >
              PreMoney
            </span>
            <span
              className="leading-none mt-0.5 hidden sm:block"
              style={{
                fontWeight: 500,
                fontSize: "9.5px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-60)",
              }}
            >
              Venture Simulator
            </span>
          </div>
        </Link>
        <nav className="ml-auto flex items-center gap-6">
          <Link
            href="/simulator/rounds"
            className="header-nav-link"
          >
            Simulator
          </Link>
        </nav>
      </div>
    </header>
  );
}
