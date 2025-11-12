"use client";

import { useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { generateFilterDescription } from "@/lib/utils/filter-helpers";
import { getFamilyName } from "@/lib/constants/product-families";


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

  // Memoizar los parámetros para evitar re-renders innecesarios
  const queryParams = useMemo(() =>
    filters.start_date && filters.end_date
      ? {
          start_date: filters.start_date,
          end_date: filters.end_date,
          ...(filters.limit !== undefined && { limit: filters.limit }),
          sales_channel: filters.sales_channel,
          family_product: filters.family_product,
        }
      : undefined
  , [filters.start_date, filters.end_date, filters.limit, filters.sales_channel, filters.family_product]);

  const { data, isLoading, error } = useTopCustomersSpending(queryParams);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Top Clientes por Gasto Total
          </CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[320px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
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
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Top Clientes por Gasto Total
          </CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full flex text-lg dark:text-white items-center justify-center text-muted-foreground">
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
        <CardDescription className="whitespace-pre-line">
          Clientes con mayor gasto en el período seleccionado
          {generateFilterDescription(
            {
              family_product: filters.family_product ?? undefined,
              sales_channel: filters.sales_channel,
              start_date: filters.start_date,
              end_date: filters.end_date,
              min_purchases: filters.min_purchases,
            },
            filters.family_product ? getFamilyName(filters.family_product) : undefined
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
