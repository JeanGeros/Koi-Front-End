"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { usePointsDistribution } from "@/hooks/use-points-distribution";
import { useDashboardFilters } from "@/lib/contexts/dashboard-filters.context";
import {
  Card,
  CardAction,
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
import { getFamilyName } from "@/lib/constants/product-families";
import { generateFilterDescription } from "@/lib/utils/filter-helpers";

export const description = "An interactive area chart";

const chartConfig = {
  points: {
    label: "Puntos",
    color: "var(--primary)",
  },
  sales: {
    label: "Ventas",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function SalesAndPointsDistributionChart() {
  const { filters } = useDashboardFilters();

  // Memoizar los parámetros para evitar re-renders innecesarios
  const queryParams = useMemo(() => ({
    start_date: filters.start_date,
    end_date: filters.end_date,
    sales_channel: filters.sales_channel,
    family_product: filters.family_product,
  }), [filters.start_date, filters.end_date, filters.sales_channel, filters.family_product]);

  const { data, isLoading, error } = usePointsDistribution(queryParams);

  // Si no hay datos, mostrar loading o error
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Puntos Generados por Fecha
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
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Puntos Generados por Fecha
          </CardTitle>
          <CardDescription>Error al cargar datos</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[320px] w-full flex items-center justify-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.chartData || [];

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
          Puntos Generados por Fecha
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block whitespace-pre-line">
            Total de puntos generados
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
          </span>
        </CardDescription>
        <CardAction>
         
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillPoints" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-points)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-points)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("es-CL", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) {
                  return null;
                }

                // Obtener los datos completos del payload
                const data = payload[0]?.payload;
                if (!data) return null;

                const { points, purchases, topCategories } = data;

                // Formatear la fecha
                const dateValue = data.date || label;
                const formattedDate = new Date(dateValue)
                  .toLocaleDateString("es-CL", {
                    month: "long",
                    day: "numeric",
                  })
                  .replace(/,/g, ".");

                return (
                  <div className="border-border/50 bg-background rounded-lg border px-3 py-2.5 text-xs shadow-xl min-w-[280px]">
                    {/* Fecha */}
                    <div className="font-medium mb-3 pb-2 border-b border-border/50">
                      {formattedDate}
                    </div>

                    {/* Resumen de métricas */}
                    <div className="grid gap-2.5">
                      {/* Puntos */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <div
                            className="shrink-0 rounded-[2px] w-1 h-3"
                            style={{
                              backgroundColor: "var(--color-points)",
                            }}
                          />
                          <span>{chartConfig.points.label}</span>
                        </span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {formatNumber(points || 0)}
                        </span>
                      </div>

                      {/* Compras */}
                      {purchases !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Compras</span>
                          <span className="text-foreground font-mono font-medium tabular-nums">
                            {formatNumber(purchases || 0)}
                          </span>
                        </div>
                      )}

                      {/* Top 3 Categorías */}
                      {topCategories && topCategories.length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                          <div className="text-muted-foreground text-[11px] font-medium mb-1.5">
                            Top 3 Familias:
                          </div>
                          <div className="grid gap-1.5">
                            {topCategories
                              .slice(0, 3)
                              .map((category: any, index: number) => {
                                const categoryName = category.id 
                                  ? getFamilyName(category.id) 
                                  : (category.name || `Familia ${category.id || index}`);
                                
                                return (
                                  <div
                                    key={category.id || index}
                                    className="flex items-center justify-between text-[11px]"
                                  >
                                    <span className="text-muted-foreground truncate max-w-[160px]">
                                      {categoryName}
                                    </span>
                                    <span className="text-foreground font-mono font-medium tabular-nums ml-2">
                                      {formatNumber(category.count || 0)}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Area
              dataKey="points"
              type="natural"
              fill="url(#fillPoints)"
              stroke="var(--color-points)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
