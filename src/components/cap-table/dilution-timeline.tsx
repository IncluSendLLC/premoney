"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CapTableSnapshot } from "@/lib/engine/types";
import { getStakeholderColor } from "@/lib/constants";
import { formatPercent } from "@/lib/formatters";

interface DilutionTimelineProps {
  snapshots: CapTableSnapshot[];
}

export function DilutionTimeline({ snapshots }: DilutionTimelineProps) {
  // Collect all unique stakeholders across all snapshots
  const allStakeholders = new Set<string>();
  snapshots.forEach((s) =>
    s.entries.forEach((e) => allStakeholders.add(e.stakeholder))
  );

  const data = snapshots.map((snapshot, i) => {
    const point: Record<string, string | number> = {
      name: i === 0 ? "Inception" : `Round ${i}`,
    };
    for (const entry of snapshot.entries) {
      point[entry.stakeholder] = parseFloat(entry.ownershipPercent.toFixed(2));
    }
    return point;
  });

  const stakeholders = Array.from(allStakeholders);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => formatPercent(Number(value))}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
          }}
        />
        <Legend />
        {stakeholders.map((s) => (
          <Bar
            key={s}
            dataKey={s}
            stackId="ownership"
            fill={getStakeholderColor(s)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
