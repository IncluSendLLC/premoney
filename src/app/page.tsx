import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import {
  Layers,
  PieChart,
  ArrowDownToLine,
  GitCompare,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Layers,
    title: "FUNDING ROUNDS",
    description:
      "Model Pre-Seed through Series D+ rounds. Configure valuations, investment amounts, and option pool allocations with the pre-money shuffle.",
  },
  {
    icon: PieChart,
    title: "CAP TABLE",
    description:
      "See ownership breakdowns after each round with interactive charts. Track how founders, investors, and the option pool evolve over time.",
  },
  {
    icon: ArrowDownToLine,
    title: "EXIT WATERFALL",
    description:
      "Simulate exit scenarios and see exactly how proceeds are distributed. Understand liquidation preferences, participation rights, and conversion decisions.",
  },
  {
    icon: GitCompare,
    title: "SCENARIO COMPARISON",
    description:
      "Compare term sheet configurations side by side. See how non-participating vs participating preferences affect every stakeholder.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        style={{ padding: "80px 40px 96px" }}
      >
        <div className="mx-auto max-w-[800px] text-center">
          <Image
            src="/premoney-logo.png"
            alt=""
            width={64}
            height={64}
            className="mx-auto mb-8"
          />
          <p className="serif-lead mb-4">
            <em>together we model what&rsquo;s next &mdash;</em>
          </p>
          <h1
            style={{
              fontSize: "44px",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "var(--navy-900)",
              lineHeight: 1.1,
            }}
          >
            Venture financing,
            <br />
            made visible
          </h1>
          <p
            className="mx-auto mt-6"
            style={{
              maxWidth: "540px",
              fontSize: "14px",
              lineHeight: 1.55,
              color: "var(--ink-60)",
            }}
          >
            Understand how venture deals work. Model funding rounds, visualize
            cap tables, and simulate exit waterfalls to see how term sheets
            affect founders, investors, and employees.
          </p>
          <div className="flex gap-4 justify-center mt-10">
            <Link
              href="/simulator/rounds"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
              style={{
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderRadius: "var(--r-sm)",
                padding: "12px 24px",
              }}
            >
              Start Simulating
              <ArrowRight style={{ width: "14px", height: "14px" }} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          padding: "64px 40px",
          background: "var(--paper)",
          borderTop: "1px solid var(--ink-10)",
          borderBottom: "1px solid var(--ink-10)",
        }}
      >
        <div className="mx-auto max-w-[1080px]">
          <div className="text-center mb-12">
            <p className="serif-lead mb-3">
              <em>a story of</em>
            </p>
            <h2 className="caps-label" style={{ fontSize: "12px" }}>
              How it works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  background: "var(--cream)",
                  border: "1px solid var(--ink-10)",
                  borderRadius: "var(--r-md)",
                  padding: "26px",
                  transition: "box-shadow 200ms var(--ease)",
                }}
                className="hover:[box-shadow:var(--shadow-sm)]"
              >
                <feature.icon
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "var(--navy-700)",
                    marginBottom: "16px",
                    strokeWidth: 1.5,
                  }}
                />
                <h3
                  style={{
                    fontWeight: 500,
                    fontSize: "12px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--navy-900)",
                    marginBottom: "8px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.55,
                    color: "var(--ink-60)",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational callout */}
      <section style={{ padding: "64px 40px" }}>
        <div className="mx-auto max-w-[600px] text-center">
          <p className="serif-lead mb-3">
            <em>holders of knowledge</em>
          </p>
          <h2 className="caps-label mb-6" style={{ fontSize: "12px" }}>
            Built for learning
          </h2>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.55,
              color: "var(--ink-60)",
            }}
          >
            Every financial term includes an explanation. Hover over the info
            icons throughout the simulator to learn about pre-money valuations,
            liquidation preferences, anti-dilution provisions, the option pool
            shuffle, and more.
          </p>
          <Link
            href="/simulator/rounds"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-8 gap-2"
            )}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderRadius: "var(--r-sm)",
              borderColor: "var(--ink-10)",
            }}
          >
            Get Started
            <ArrowRight style={{ width: "14px", height: "14px" }} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--ink-10)",
          padding: "24px 40px",
        }}
      >
        <div
          className="mx-auto flex max-w-[1080px] items-center justify-between"
          style={{
            fontSize: "11.5px",
            color: "var(--ink-40)",
            fontFamily:
              "var(--font-geist-mono), ui-monospace, Menlo, monospace",
          }}
        >
          <span>PreMoney -- Venture Simulator</span>
          <span>Built by Inclusend LLC</span>
        </div>
      </footer>
    </div>
  );
}
