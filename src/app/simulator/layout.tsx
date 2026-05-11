import { SimulatorNav } from "@/components/layout/simulator-nav";

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SimulatorNav />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
