import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    title: "Fundraising Rounds",
    description:
      "Model Pre-Seed through Series D+ rounds. Configure valuations, investment amounts, and option pool allocations with the option pool shuffle.",
  },
  {
    icon: PieChart,
    title: "Cap Table Visualization",
    description:
      "See ownership breakdowns after each round with interactive charts. Track how founders, investors, and the option pool evolve over time.",
  },
  {
    icon: ArrowDownToLine,
    title: "Exit Waterfall",
    description:
      "Simulate exit scenarios and see exactly how proceeds are distributed. Understand liquidation preferences, participation rights, and conversion decisions.",
  },
  {
    icon: GitCompare,
    title: "Scenario Comparison",
    description:
      "Compare term sheet configurations side by side. See how 1x non-participating vs 2x participating affects every stakeholder.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="px-6 py-20 md:py-32">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            PreMoney
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mt-3">
            Venture Simulator
          </p>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            Understand how venture financing works. Model funding rounds,
            visualize cap tables, and simulate exit waterfalls to see how term
            sheets affect founders, investors, and employees.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/simulator/rounds"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              Start Simulating
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-muted/50">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            Everything you need to understand venture deals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 mb-3 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Educational callout */}
      <section className="px-6 py-16">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Built for learning</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every financial term includes an explanation. Hover over the{" "}
            <span className="inline-flex items-center text-foreground font-medium">
              info icons
            </span>{" "}
            throughout the simulator to learn about pre-money valuations,
            liquidation preferences, anti-dilution provisions, the option pool
            shuffle, and more.
          </p>
          <Link
            href="/simulator/rounds"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-6 gap-2"
            )}
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6">
        <div className="container max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>PreMoney -- Venture Simulator</span>
          <span>Built by Inclusend LLC</span>
        </div>
      </footer>
    </div>
  );
}
