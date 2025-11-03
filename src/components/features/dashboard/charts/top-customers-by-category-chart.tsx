"use client";

import { PieChart, Pie, Cell } from "recharts";

import { useSalesByChannel } from "@/hooks/use-sales-by-channel";
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { formatNumber, formatCurrency } from "@/lib/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  casa_matriz: {
    label: "Casa Matriz",
    color: "var(--primary)",
  },
  outdoors: {
    label: "Outdoors",
    color: "var(--primary)",
  },
  todohogar: {
    label: "TodoHogar",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function TopCustomersByCategoryChart() {
  const { filters } = useDashboardFilters();
  const { data, isLoading, error } = useSalesByChannel({
    start_date: filters.start_date,
    end_date: filters.end_date,
  });

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader className="items-center pb-4">
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Ventas por Sucursales
          </CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 pb-0">
          <div className="flex flex-col space-y-3">
            <Skeleton className="mx-auto aspect-square w-full max-h-[250px] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[90%] mx-auto" />
              <Skeleton className="h-4 w-[80%] mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si hay error, mostrarlo
  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader className="items-center pb-4">
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Ventas por Sucursales
          </CardTitle>
          <CardDescription>Error al cargar datos</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 pb-0">
          <div className="h-[250px] w-full flex items-center justify-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos
  if (!data || !data.chartData || !data.chartData.labels || data.chartData.labels.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader className="items-center pb-4">
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Ventas por Sucursales
          </CardTitle>
          <CardDescription>
            No hay datos disponibles para el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 pb-0">
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
            No se encontraron ventas para el período seleccionado
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.chartData.labels.map((label, index) => {
    const normalizedLabel = label.toLowerCase().replace(/\s+/g, '_');
    
    return {
      name: label,
      value: data.chartData.values[index],
      count: data.chartData.counts[index],
      fill: "var(--primary)",
      normalizedLabel,
    };
  });

  // Calcular el porcentaje de cada canal respecto al total
  const totalSales = data.summary.totalSales;

  return (
    <Card className="@container/card">
      <CardHeader className="items-center pb-4">
        <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
          Ventas por Sucursales
        </CardTitle>
        <CardDescription>
          Distribución de ventas por canal en el período seleccionado
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-h-[350px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) {
                  return null;
                }

                const item = payload[0]?.payload;
                if (!item) return null;

                const percentage = totalSales > 0 
                  ? ((item.value / totalSales) * 100).toFixed(1)
                  : "0";

                return (
                  <div className="border-border/50 bg-background rounded-lg border px-3 py-2.5 text-xs shadow-xl min-w-[200px]">
                    <div className="font-medium mb-2 pb-2 border-b border-border/50">
                      {item.name}
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <div
                            className="shrink-0 rounded-full w-2 h-2"
                            style={{
                              backgroundColor: item.fill,
                            }}
                          />
                          <span>Total Ventas</span>
                        </span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Órdenes</span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {formatNumber(item.count || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Porcentaje</span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fill="var(--color-foreground)"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={500}
                  >
                    {`${name}: ${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="hsl(var(--background))" strokeWidth={2} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="normalizedLabel" />}
              iconSize={10}
              wrapperStyle={{ paddingTop: "1rem" }}
            />
          </PieChart>
        </ChartContainer>
        {/* {data.summary && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Ganancia</div>
              <div className="text-lg font-semibold">
                {formatCurrency(data.summary.totalSales)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Ventas</div>
              <div className="text-lg font-semibold">
                {formatNumber(data.summary.totalOrders)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Ganancia Promedio</div>
              <div className="text-lg font-semibold">
                {formatCurrency(data.summary.averageOrder)}
              </div>
            </div>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}
