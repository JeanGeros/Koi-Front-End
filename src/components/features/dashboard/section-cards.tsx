"use client";

import { useState } from "react";
import {
  IconTrendingDown,
  IconTrendingUp,
  IconAlertTriangle,
  IconChartBar,
  IconTarget,
  IconMoneybag,
  IconCrown,
  IconRefresh,
  IconCalendar,
  IconDiamond,
} from "@tabler/icons-react";
import { useAdvancedKPIs } from "@/hooks/use-advanced-kpis";
import { useKPICards } from "@/hooks/use-kpi-cards";
import { useDashboardFilters } from "@/lib/contexts/dashboard-filters.context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrencyShort,
  formatNumber,
  formatCurrency,
} from "@/lib/utils/formatters";
import {
  getDefaultEndDate,
  getDefaultStartDate,
} from "@/lib/utils/date-helpers";

export function SectionCards() {
  const { filters, updateFilters } = useDashboardFilters();
  // ✅ Clean Architecture: Leer del contexto (Presentation Layer) y pasar explícitamente
  const { data: kpis, isLoading, error } = useAdvancedKPIs(filters);
  const {
    data: kpiCards,
    isLoading: isLoadingKPICards,
    error: errorKPICards,
  } = useKPICards(filters);

  // Combinar estados de carga y errores
  const isLoadingAll = isLoading || isLoadingKPICards;
  const hasError = error || errorKPICards;

  // Inicializar los campos de fecha con los valores del contexto (desde cookies o valores predeterminados)
  // Usamos useState con función inicializadora para evitar actualizaciones innecesarias
  const [startDate, setStartDate] = useState<string>(
    () => filters.start_date || ""
  );
  const [endDate, setEndDate] = useState<string>(() => filters.end_date || "");
  const [selectedFamily, setSelectedFamily] = useState<string>(
    () => filters.family_product?.toString() || "all"
  );

  const handleApplyFilters = () => {
    const newFilters: {
      start_date?: string;
      end_date?: string;
      family_product?: number | null;
    } = {};

    // Usar las fechas seleccionadas, o las del contexto, o las predeterminadas
    newFilters.start_date =
      startDate || filters.start_date || getDefaultStartDate();
    newFilters.end_date = endDate || filters.end_date || getDefaultEndDate();

    if (selectedFamily && selectedFamily !== "all") {
      newFilters.family_product = parseInt(selectedFamily, 10);
    } else {
      newFilters.family_product = null;
    }

    // Actualizar el contexto de filtros que será usado por todos los componentes
    // Esto también guardará en localStorage automáticamente
    updateFilters(newFilters);
  };

  if (hasError) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 text-destructive">
              <IconAlertTriangle className="size-5" />
              <p>
                Error al cargar datos:{" "}
                {error || errorKPICards || "Error desconocido"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {isLoadingAll ? (
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="@container/card animate-pulse">
              <CardHeader>
                <CardDescription className="h-4 bg-muted rounded w-1/2" />
                <CardTitle className="h-8 bg-muted rounded w-3/4 mt-2" />
              </CardHeader>
              <CardFooter>
                <div className="h-4 bg-muted rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : kpis && kpiCards ? (
        <>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {/* FILTROS */}
            <Card className="@container/card @xl/main:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
                  Filtros
                </CardTitle>
                <CardDescription>
                  Filtra los KPIs por rango de fechas
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap 2xl:flex-nowrap gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                  <Input
                    id="fecha-inicio"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="fecha-termino">Fecha Término</Label>
                  <Input
                    id="fecha-termino"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="familia-producto">Familia de Producto</Label>
                  <Select
                    value={selectedFamily}
                    onValueChange={setSelectedFamily}
                  >
                    <SelectTrigger id="familia-producto" className="w-[180px]">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="1">Familia 1</SelectItem>
                      <SelectItem value="2">Familia 2</SelectItem>
                      <SelectItem value="family3">Familia 3</SelectItem>
                      <SelectItem value="4">Familia 4</SelectItem>
                      <SelectItem value="5">Familia 5</SelectItem>
                      <SelectItem value="6">Familia 6</SelectItem>
                      <SelectItem value="7">Familia 7</SelectItem>
                      <SelectItem value="8">Familia 8</SelectItem>
                      <SelectItem value="9">Familia 9</SelectItem>
                      <SelectItem value="22">Familia 22</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleApplyFilters} disabled={isLoadingAll}>
                    {isLoadingAll ? "Cargando..." : "Aplicar Filtros"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Metadata del Período */}
            <Card className="@container/card @xl/main:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
                  Período de Análisis
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Desde</p>
                  <p className="font-medium">{startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hasta</p>
                  <p className="font-medium">{endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Categoria de Familia
                  </p>
                  <p className="font-medium text-center">{selectedFamily}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {/* Top Spender */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-2 dark:text-white">
                  <IconMoneybag className="size-4" />
                  Cliente con mayor gasto
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-600 dark:text-white">
                  {formatCurrencyShort(kpiCards.topSpender?.totalSpending || 0)}
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className="border-blue-600 text-blue-600"
                  >
                    <IconTrendingUp className="size-3" />
                    Mayor gasto
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {kpiCards.topSpender?.name || "N/A"}
                </div>
                <div className="text-muted-foreground">
                  {kpiCards.topSpender?.totalPurchases || 0} compras •{" "}
                  {kpiCards.topSpender?.totalItems || 0} productos
                </div>
              </CardFooter>
            </Card>

            {/* Top Buyer */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-2 dark:text-white">
                  <IconChartBar className="size-4" />
                  Cliente con más compras
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600 dark:text-white">
                  {formatNumber(kpiCards.topBuyer?.totalPurchases || 0)}
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className="border-green-600 text-green-600"
                  >
                    <IconTrendingUp className="size-3" />
                    Mayor cantidad de compras
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {kpiCards.topBuyer?.name || "N/A"}
                </div>
                <div className="text-muted-foreground">
                  {formatCurrencyShort(kpiCards.topBuyer?.totalSpending || 0)}{" "}
                  gastado • {kpiCards.topBuyer?.totalItems || 0} productos
                </div>
              </CardFooter>
            </Card>

            {/* Top Diverse Buyer */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-2 dark:text-white">
                  <IconTarget className="size-4" />
                  Cliente con más diversidad de compras
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-600 dark:text-white">
                  {formatNumber(kpiCards.topDiverseBuyer?.familiesCount || 0)}
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className="border-purple-600 text-purple-600"
                  >
                    <IconTrendingUp className="size-3" />
                    Familias
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {kpiCards.topDiverseBuyer?.name || "N/A"}
                </div>
                <div className="text-muted-foreground">
                  {formatCurrencyShort(
                    kpiCards.topDiverseBuyer?.totalSpending || 0
                  )}{" "}
                  gastado • {kpiCards.topDiverseBuyer?.totalPurchases || 0}{" "}
                  compras
                </div>
              </CardFooter>
            </Card>
          </div>
          {/* Fila 1: Métricas de Alerta */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {/* KPI 1: Churn */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-2 dark:text-white">
                  <IconAlertTriangle className="size-4" />
                  Clientes en Riesgo
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-destructive dark:text-white">
                  {formatNumber(kpis.churn?.at_risk_customers || 0)}
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className="border-destructive text-destructive"
                  >
                    <IconTrendingDown className="size-3" />
                    {kpis.churn?.percentage.toFixed(1)}%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {formatCurrency(kpis.churn?.at_risk_value || 0)} en riesgo
                </div>
                <div className="text-muted-foreground">
                  Compraron antes pero no ahora
                </div>
              </CardFooter>
            </Card>

            {/* KPI 2: Redención de Puntos */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-2 dark:text-white">
                  <IconChartBar className="size-4" />
                  Redención de Puntos
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl dark:text-white">
                  {kpis.redemption?.redemption_rate.toFixed(1)}%
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    {kpis.redemption?.redemption_rate >= 15 ? (
                      <IconTrendingUp className="size-3" />
                    ) : (
                      <IconTrendingDown className="size-3" />
                    )}
                    {kpis.redemption?.redemption_rate >= 15
                      ? "Saludable"
                      : "Baja"}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {formatNumber(kpis.redemption?.points_unused || 0)} pts sin
                  usar
                </div>
                <div className="text-muted-foreground">
                  {kpis.redemption?.customers_with_points || 0} clientes con
                  puntos
                </div>
              </CardFooter>
            </Card>

            {/* KPI 3: Mono-Categoría */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-2 dark:text-white ">
                  <IconTarget className="size-4" />
                  Mono-Categoría
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl dark:text-white">
                  {formatNumber(
                    kpis.mono_category?.mono_category_customers || 0
                  )}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    {kpis.mono_category?.percentage || 0}%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Target Cross-Selling
                </div>
                <div className="text-muted-foreground">
                  Compran en 1 sola familia
                </div>
              </CardFooter>
            </Card>

            {/* KPI 4: Potencial Cross-Sell */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-2 dark:text-white">
                  <IconMoneybag className="size-4" />
                  Potencial No Capturado
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600 dark:text-white ">
                  {formatCurrencyShort(
                    kpis.cross_sell_potential?.total_potential || 0
                  )}
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className="border-green-600 text-green-600"
                  >
                    <IconTrendingUp className="size-3" />+
                    {kpis.cross_sell_potential?.upside_percentage || 0}%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Upside posible
                </div>
                <div className="text-muted-foreground">
                  Si todos compraran{" "}
                  {kpis.cross_sell_potential?.target_families || 0}+ familias
                </div>
              </CardFooter>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
