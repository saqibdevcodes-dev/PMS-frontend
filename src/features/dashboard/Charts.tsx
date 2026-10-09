import { t, useLocale } from '../../lib/i18n';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { money } from '../../lib/format';
export const chartColors = [
  '#4168e8',
  '#8babfc',
  '#33ad8b',
  '#edb559',
  '#91a0b7',
  '#b499d5',
  '#f18c85',
  '#7086ac',
];
export function CollectionChart({
  data,
  currency,
}: {
  data: { label: string; amount: number }[];
  currency: string;
}) {
  useLocale();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="collection-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4168e8" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#4168e8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'var(--muted)' }}
          dy={8}
        />
        <YAxis
          tickFormatter={(v: number) =>
            v >= 1000000 ? `${v / 1000000}m` : v >= 1000 ? `${v / 1000}k` : String(v)
          }
          width={48}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'var(--muted)' }}
        />
        <Tooltip
          formatter={(v) => money(v, currency)}
          contentStyle={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text)',
          }}
        />
        <Area
          type="monotone"
          dataKey="amount"
          name={t('Verified collections')}
          stroke="#4168e8"
          strokeWidth={2.5}
          fill="url(#collection-fill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
export function InventoryChart({ data }: { data: { name: string; value: number }[] }) {
  useLocale();
  return (
    <ResponsiveContainer width="100%" height={170}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={53}
          outerRadius={73}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={chartColors[i % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text)',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
export function AgeingChart({
  data,
  currency,
}: {
  data: { label: string; amount: number }[];
  currency: string;
}) {
  useLocale();
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'var(--muted)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide />
        <Tooltip
          formatter={(v) => money(v, currency)}
          contentStyle={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 10,
          }}
        />
        <Bar dataKey="amount" name={t('Overdue amount')} fill="#e8ad57" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
