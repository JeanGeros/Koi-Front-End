"use client";

import { useMemo, useState } from "react";
import { useCustomersTable } from "@/hooks/use-customers-table";
import { useDashboardFilters } from "@/lib/contexts/dashboard-filters.context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatCurrency } from "@/lib/utils/formatters";
import { getFamilyName } from "@/lib/constants/product-families";
import { generateFilterDescription } from "@/lib/utils/filter-helpers";
import { dashboardService } from "@/lib/services/dashboard.service";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortBy = "total_spending" | "total_purchases" | "avg_purchase";
type SortOrder = "desc" | "asc";

// Componente SortIcon fuera del componente principal para evitar errores de linting
function SortIcon({ field, currentSortBy, currentSortOrder }: { field: SortBy; currentSortBy: SortBy; currentSortOrder: SortOrder }) {
  if (currentSortBy !== field) {
    return <ArrowUpDown className="ml-1 h-4 w-4" />;
  }
  return currentSortOrder === "desc" ? (
    <ArrowDown className="ml-1 h-4 w-4" />
  ) : (
    <ArrowUp className="ml-1 h-4 w-4" />
  );
}

export function CustomersTable() {
  const { filters } = useDashboardFilters();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("total_spending");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const pageSize = 50; // Tamaño de página para la API (siempre máximo)

  // Memoizar los parámetros para evitar re-renders innecesarios
  const queryParams = useMemo(() => ({
    start_date: filters.start_date,
    end_date: filters.end_date,
    family_product: filters.family_product ?? undefined,
    sales_channel: filters.sales_channel,
    page,
    page_size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
  }), [filters.start_date, filters.end_date, filters.family_product, filters.sales_channel, page, sortBy, sortOrder]);

  const { data, isLoading, error } = useCustomersTable(queryParams);

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1); // Resetear a la primera página al cambiar el ordenamiento
  };

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Tabla de Clientes
          </CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[400px] rounded-xl" />
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
            Tabla de Clientes
          </CardTitle>
          <CardDescription>Error al cargar datos</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[400px] w-full flex items-center justify-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos
  if (!data || !data.customers || data.customers.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Tabla de Clientes
          </CardTitle>
          <CardDescription>
            No hay datos disponibles para el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[400px] w-full flex items-center text-lg justify-center text-muted-foreground dark:text-white">
            No se encontraron clientes
          </div>
        </CardContent>
      </Card>
    );
  }

  const { customers, pagination, summary } = data;

  // Paginación local basada en itemsPerPage
  const localTotalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCustomers = customers.slice(startIndex, endIndex);
  const localHasPrevious = page > 1;
  const localHasNext = page < localTotalPages;

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setPage(1); // Resetear a la primera página al cambiar el tamaño
  };

  const handleExport = async () => {
    try {
      // Obtener los parámetros de filtro actuales (sin paginación para exportar todo)
      const exportParams = {
        start_date: filters.start_date,
        end_date: filters.end_date,
        family_product: filters.family_product ?? undefined,
        sales_channel: filters.sales_channel,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // Llamar al servicio de exportación
      const blob = await dashboardService.exportCustomersTable(exportParams);

      // Crear URL temporal para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generar nombre de archivo con las fechas
      const startDate = filters.start_date || new Date().toISOString().split("T")[0];
      const endDate = filters.end_date || new Date().toISOString().split("T")[0];
      link.download = `clientes_dashboard_${startDate}_${endDate}.xlsx`;

      // Descargar el archivo
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar la tabla. Por favor, intenta nuevamente.");
    }
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
            Tabla de Clientes
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
        <CardDescription className="whitespace-pre-line">
          Información detallada de clientes
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
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* Resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Clientes</div>
            <div className="text-2xl font-bold">{formatNumber(summary.totalCustomers)}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Ventas Total</div>
            <div className="text-xl font-bold">{formatCurrency(summary.sales.totalAmount)}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatNumber(summary.sales.totalCount)} ventas</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Devoluciones</div>
            <div className="text-xl font-bold">{formatCurrency(summary.returns.totalAmount)}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatNumber(summary.returns.totalCount)} devoluciones</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Facturas</div>
            <div className="text-xl font-bold">{formatCurrency(summary.invoices.totalAmount)}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatNumber(summary.invoices.totalCount)} facturas</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total General</div>
            <div className="text-xl font-bold">{formatCurrency(summary.totals.totalAmount)}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatNumber(summary.totals.totalTransactions)} transacciones</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Promedio por Cliente</div>
            <div className="text-xl font-bold">{formatCurrency(summary.sales.avgPerCustomer)}</div>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">RUT</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 -ml-3"
                    onClick={() => handleSort("total_purchases")}
                  >
                    Ventas
                    <SortIcon field="total_purchases" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Button>
                </TableHead>
                <TableHead>Devoluciones</TableHead>
                <TableHead>Facturas</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 -ml-3"
                    onClick={() => handleSort("total_spending")}
                  >
                    Gasto Total
                    <SortIcon field="total_spending" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 -ml-3"
                    onClick={() => handleSort("avg_purchase")}
                  >
                    Promedio
                    <SortIcon field="avg_purchase" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Button>
                </TableHead>
                <TableHead>Artículos</TableHead>
                <TableHead>Categoría Top</TableHead>
                <TableHead>Destacados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedCustomers.map((customer) => (
                <TableRow key={customer.rut}>
                  <TableCell className="font-mono text-xs">
                    {customer.rut}
                  </TableCell>
                  <TableCell className="font-medium">
                    {customer.nombre_completo}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.email}
                  </TableCell>
                  <TableCell className="text-sm">
                    {customer.telefono || "-"}
                  </TableCell>
                  <TableCell className="font-mono">
                    <div className="flex flex-col">
                      <span>{formatNumber(customer.sales.count)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(customer.sales.amount)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="flex flex-col">
                      <span>{formatNumber(customer.returns.count)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(customer.returns.amount)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="flex flex-col">
                      <span>{formatNumber(customer.invoices.count)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(customer.invoices.amount)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {formatCurrency(customer.total_amount)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(customer.sales.average)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatNumber(customer.total_items)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {customer.top_category_id ? (
                      <span className="text-muted-foreground">
                        {getFamilyName(customer.top_category_id)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {customer.highlights.includes("top_gastador") && (
                        <Badge variant="default" className="text-xs">
                          Top Gastador
                        </Badge>
                      )}
                      {customer.highlights.includes("top_comprador") && (
                        <Badge variant="secondary" className="text-xs">
                          Top Comprador
                        </Badge>
                      )}
                      {customer.highlights.includes("comprador_diverso") && (
                        <Badge variant="outline" className="text-xs">
                          Diverso
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} -{" "}
            {Math.min(endIndex, customers.length)} de{" "}
            {formatNumber(customers.length)} clientes
            {customers.length < pagination.totalCustomers && (
              <span className="ml-2">
                (de {formatNumber(pagination.totalCustomers)} totales)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!localHasPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm text-muted-foreground">
              Página {page} de {localTotalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!localHasNext}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

