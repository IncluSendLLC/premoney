"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { WaterfallRangePoint } from "@/lib/engine/types";
import { getStakeholderColor } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

interface WaterfallChartProps {
  data: WaterfallRangePoint[];
  stakeholders: string[];
}

export function WaterfallChart({ data, stakeholders }: WaterfallChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <XAxis
          dataKey="exitValue"
          tickFormatter={(v) => formatCurrency(v, true)}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v, true)}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          labelFormatter={(v) => `Exit: ${formatCurrency(v as number, true)}`}
          formatter={(value, name) => [
            formatCurrency(Number(value), true),
            String(name),
          ]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
            fontSize: "13px",
          }}
        />
        <Legend />
        {stakeholders.map((s) => (
          <Area
            key={s}
            type="monotone"
            dataKey={s}
            stackId="1"
            fill={getStakeholderColor(s)}
            stroke={getStakeholderColor(s)}
            fillOpacity={0.7}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
