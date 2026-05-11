"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CapTableEntry } from "@/lib/engine/types";
import { getStakeholderColor } from "@/lib/constants";
import { formatPercent } from "@/lib/formatters";

interface CapTableChartProps {
  entries: CapTableEntry[];
}

export function CapTableChart({ entries }: CapTableChartProps) {
  const data = entries.map((e) => ({
    name: e.stakeholder,
    value: parseFloat(e.ownershipPercent.toFixed(2)),
    color: getStakeholderColor(e.stakeholder),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={110}
          paddingAngle={1}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatPercent(Number(value))}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
