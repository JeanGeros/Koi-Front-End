"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import { useTopCustomersByCategory } from "@/hooks/use-top-customers-by-category";
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

const chartConfig = {
  cantidad_compras: {
    label: "Cantidad de compras",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function CustomersWithMostPurchasesChart() {
  // ✅ Clean Architecture: Leer del contexto (Presentation Layer) y pasar explícitamente
  const { filters } = useDashboardFilters();
  const { data, isLoading, error } = useTopCustomersByCategory({
    start_date: filters.start_date,
    end_date: filters.end_date,
    family_product: filters.family_product || undefined,
    count_customers: filters.limit || undefined,
  });

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Clientes con más compras
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

  // Si hay error, mostrarlo
  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Clientes con más compras
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

  // Si no hay datos
  if (!data || !data.top_customers_by_category || data.top_customers_by_category.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Clientes con más compras
          </CardTitle>
          <CardDescription>
            No hay datos disponibles para el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[320px] w-full flex items-center justify-center text-muted-foreground">
            No se encontraron clientes con compras
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.top_customers_by_category.map((item) => ({
    rut: item.rut,
    nombre_completo: item.nombre_completo,
    cantidad_compras: item.cantidad_compras,
    total_monto: item.total_monto,
  }));

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
          Clientes con más compras
        </CardTitle>
        <CardDescription>
          Total de compras por cliente
          {data.family_product ? ` en la categoría ${data.family_product}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="rut"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickFormatter={(value) => formatNumber(value)}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) {
                  return null;
                }

                const item = payload[0]?.payload;
                if (!item) return null;

                return (
                  <div className="border-border/50 bg-background rounded-lg border px-3 py-2.5 text-xs shadow-xl min-w-[200px]">
                    <div className="font-medium mb-2 pb-2 border-b border-border/50">
                      {item.nombre_completo}
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <div
                            className="shrink-0 rounded-[2px] w-1 h-3"
                            style={{
                              backgroundColor: "var(--color-cantidad_compras)",
                            }}
                          />
                          <span>Compras</span>
                        </span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {formatNumber(item.cantidad_compras || 0)}
                        </span>
                      </div>
                      {item.total_monto !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total</span>
                          <span className="text-foreground font-mono font-medium tabular-nums">
                            ${formatNumber(item.total_monto || 0)}
                          </span>
                        </div>
                      )}
                      <div className="text-muted-foreground text-[11px] pt-1 border-t border-border/50">
                        RUT: {item.rut}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="cantidad_compras"
              fill="var(--color-cantidad_compras)"
              radius={8}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => formatNumber(value)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
