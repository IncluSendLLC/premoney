import { SimulatorNav } from "@/components/layout/simulator-nav";

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SimulatorNav />
      <main
        className="flex-1 overflow-auto"
        style={{
          padding: "36px 40px 80px 40px",
        }}
      >
        <div className="mx-auto max-w-[1480px]">{children}</div>
      </main>
    </div>
  );
}
