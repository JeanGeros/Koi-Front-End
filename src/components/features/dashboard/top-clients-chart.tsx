"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { DashboardTopCliente } from "@/lib/types/dashboard.types"

type Props = {
  data: DashboardTopCliente[]
}

const chartConfig = {
  points: { label: "Puntos", color: "hsl(var(--primary))" },
} satisfies ChartConfig

export function TopClientsChart({ data }: Props) {
  const chartData = data.slice(0, 6).map((c) => ({
    name: c.nombre_completo.split(" ").slice(0, 2).join(" "),
    rut: c.rut_completo,
    points: c.current_points,
  }))

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Top Clientes por Puntos</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
          <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickFormatter={(v) => v.toLocaleString()} width={70} />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              content={<ChartTooltipContent nameKey="points" />}
            />
            <Bar dataKey="points" fill="var(--color-points)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}


