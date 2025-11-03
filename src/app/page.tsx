"use client";
// Deshabilitar caché para esta página
export const dynamic = "force-dynamic";

import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/features/dashboard/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useDashboard } from "@/hooks/use-dashboard";
import { CustomersWithMostPurchasesChart } from "@/components/features/dashboard/charts/customers-with.most-purchases";
import { SalesAndPointsDistributionChart } from "@/components/features/dashboard/charts/sales-and-points-distribution";
import { TopCustomersByCategoryChart } from "@/components/features/dashboard/charts/top-customers-by-category-chart";
import { TopCustomersNextPurchaseChart } from "@/components/features/dashboard/charts/top-customers-next-purchase";
import { DashboardFiltersProvider } from "@/lib/contexts/dashboard-filters.context";
import { TopCustomersSpendingChart } from "@/components/features/dashboard/charts/top-customers-spending-chart";

export default function Page() {
  const { data, isLoading, error } = useDashboard();
  return (
    <DashboardFiltersProvider>
      <SidebarProvider
        defaultOpen={false}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col container mx-auto">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomersWithMostPurchasesChart />
                  <SalesAndPointsDistributionChart />

                  {error && (
                    <div className="text-red-500 px-4 py-2">{error}</div>
                  )}
                </div>

                <div className="px-4 lg:px-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TopCustomersByCategoryChart />
                  <TopCustomersNextPurchaseChart />

                  {error && (
                    <div className="text-red-500 px-4 py-2">{error}</div>
                  )}
                </div>
                <div className="px-4 lg:px-6  grid grid-cols-1 gap-4">
                  <TopCustomersSpendingChart />
                  {error && (
                    <div className="text-red-500 px-4 py-2">{error}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardFiltersProvider>
  );
}
