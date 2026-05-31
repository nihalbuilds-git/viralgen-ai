import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface Props {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = "hsl(var(--primary))", height = 40 }: Props) {
  const chart = data.map((v, i) => ({ i, v }));
  const id = `spark-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chart} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${id})`}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
