import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import type { DashboardOverview } from "@/lib/types/dashboard.types"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CL").format(value)
}

export function SectionCards({ data }: { data?: DashboardOverview }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Clientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data ? formatNumber(data.metricas_generales.total_clientes) : "-"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Clientes registrados <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Puntos en Circulación</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data ? formatNumber(data.metricas_generales.total_puntos_circulacion) : "-"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Puntos activos en el programa <IconTrendingDown className="size-4" />
          </div>
        </CardFooter>
      </Card> */}






      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card> */}

<Card className="@container/card col-span-2">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap md:flex-nowrap gap-2">

        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
          <Input id="fecha-inicio" type="date" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha-termino">Fecha Término</Label>
          <Input id="fecha-termino" type="date" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="cantidad-clientes">Cantidad de Clientes</Label>
          <Input
            id="cantidad-clientes"
            type="number"
            placeholder="Ej: 10"
            min="1"
            className="w-35"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="familia-productos">Familia de Productos</Label>
          <Select>
            <SelectTrigger id="familia-productos">
              <SelectValue placeholder="Seleccionar familia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="familia1">Familia 1</SelectItem>
              <SelectItem value="familia2">Familia 2</SelectItem>
              <SelectItem value="familia3">Familia 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </CardContent>
      </Card>
    </div>

  )
}
