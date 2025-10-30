"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useDashboard } from "@/hooks/use-dashboard"
import { ChartBarLabel } from "@/components/features/dashboard/charts/chart-bar"
import { ChartAreaInteractive } from "@/components/features/dashboard/charts/chart-area-interactive"

export default function Page() {
  const { data, isLoading, error } = useDashboard()
  console.log("data in view")
  console.log(data)
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
       }
    >
      <AppSidebar variant="inset"/>
      <SidebarInset >
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards data={data ?? undefined} />
              <div className="px-4 lg:px-6">
            {!isLoading && data    ?  
            <>

<ChartBarLabel data={data.top_customers_by_category ?? []} />
<ChartAreaInteractive />
            </>          
                : (
                  <div className="text-muted-foreground px-4 py-8">Cargando dashboard...</div>
                )}
                {error && (
                  <div className="text-red-500 px-4 py-2">{error}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
