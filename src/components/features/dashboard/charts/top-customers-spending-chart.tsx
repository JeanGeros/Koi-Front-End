"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { useTopCustomersSpending } from "@/hooks/use-top-customers-spending";
import { useDashboardFilters } from "@/lib/contexts/dashboard-filters.context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatNumber } from "@/lib/utils/formatters";

export const description = "Top clientes por gasto total";

const chartConfig = {
  spending: {
    label: "Gasto total",
    color: "var(--primary)",
  },
  customerName: {
    label: "Cliente",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function TopCustomersSpendingChart() {
  // ✅ Clean Architecture: Leer del contexto (Presentation Layer) y pasar explícitamente
  const { filters } = useDashboardFilters();
  // TopCustomersSpendingParams requiere start_date y end_date como obligatorios
  const { data, isLoading, error } = useTopCustomersSpending(
    filters.start_date && filters.end_date
      ? {
          start_date: filters.start_date,
          end_date: filters.end_date,
          ...(filters.limit !== undefined && { limit: filters.limit }),
        }
      : undefined
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Top Clientes por Gasto Total
          </CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full flex items-center justify-center text-muted-foreground">
            Cargando gráfico...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white ">
            Top Clientes por Gasto Total
          </CardTitle>
          <CardDescription>Error al cargar datos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full flex items-center justify-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.chartData || data.chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 ">
            Top Clientes por Gasto Total
          </CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full flex items-center justify-center text-muted-foreground">
            No se encontraron clientes
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.chartData.map((customer) => ({
    customerName: customer.name,
    spending: customer.spending,
    purchases: customer.purchases,
    products: customer.products,
    avgTicket: customer.avgTicket,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white ">
          Top Clientes por Gasto Total
        </CardTitle>
        <CardDescription>
          Clientes con mayor gasto en el período seleccionado
          {data.period && (
            <>
              {" "}
              (
              {new Date(data.period.startDate).toLocaleDateString("es-CL", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(data.period.endDate).toLocaleDateString("es-CL", {
                month: "short",
                day: "numeric",
              })}
              )
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="customerName"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) {
                  return null;
                }

                const data = payload[0]?.payload;
                if (!data) return null;

                return (
                  <div className="border-border/50 bg-background rounded-lg border px-3 py-2.5 text-xs shadow-xl min-w-[200px]">
                    <div className="font-medium mb-2 pb-2 border-b border-border/50">
                      {data.customerName}
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Gasto total:
                        </span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          ${formatNumber(data.spending)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Compras:</span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {formatNumber(data.purchases)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Productos:
                        </span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {formatNumber(data.products)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Ticket promedio:
                        </span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          ${formatNumber(data.avgTicket)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="spending" fill="var(--color-spending)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => `$${formatNumber(value)}`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
