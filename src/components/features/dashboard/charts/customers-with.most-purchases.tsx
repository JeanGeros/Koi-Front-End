"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DashboardCustomerWithMostSales,
  PropsTopCustomersByCategory,
} from "@/lib/types/dashboard.types";

export const description = "A bar chart with a label";

const chartConfig = {
  cantidad_compras: {
    label: "Cantidad de compras: ",
    color: "var(--primary)",
  },
  rut: {
    label: "Cantidad de compras: ",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Props = {
  data: PropsTopCustomersByCategory;
};
export function CustomersWithMostPurchasesChart({ data }: Props) {
  const chartData = data.top_customers_by_category.map((item) => ({
    rut: item.rut,
    cantidad_compras: item.cantidad_compras,
  }));
  return (
    <Card className="@container/card ">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-neutral-700 dark:text-white">
          Clientes con más compras
        </CardTitle>
        <CardDescription>
          Total de compras por cliente en la categoría {data.family_product}
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
              dataKey="rut"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
