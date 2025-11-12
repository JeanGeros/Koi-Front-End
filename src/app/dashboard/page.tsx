"use client";
// Deshabilitar caché para esta página
export const dynamic = "force-dynamic";

import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/features/dashboard/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CustomersWithMostPurchasesChart } from "@/components/features/dashboard/charts/customers-with.most-purchases";
import { SalesAndPointsDistributionChart } from "@/components/features/dashboard/charts/sales-and-points-distribution";
import { TopCustomersByCategoryChart } from "@/components/features/dashboard/charts/top-customers-by-category-chart";
import { TopCustomersNextPurchaseChart } from "@/components/features/dashboard/charts/top-customers-next-purchase";
import { DashboardFiltersProvider } from "@/lib/contexts/dashboard-filters.context";
import { TopCustomersSpendingChart } from "@/components/features/dashboard/charts/top-customers-spending-chart";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CustomersTable } from "@/components/features/dashboard/customers-table";

export default function Page() {
  return (
    <ProtectedRoute>
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
                  </div>

                  <div className="px-4 lg:px-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TopCustomersByCategoryChart />
                    <TopCustomersNextPurchaseChart />
                  </div>
                  <div className="px-4 lg:px-6  grid grid-cols-1 gap-4">
                    <TopCustomersSpendingChart />
                  </div>
                  <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
                    <CustomersTable />
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </DashboardFiltersProvider>
    </ProtectedRoute>
  );
}
