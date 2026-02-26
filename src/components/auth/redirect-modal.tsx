"use client"

import { useEffect, useState } from "react"

const TARGET_URL = "https://koi.casalicia.cl/dashboard_marketing/"
const COUNTDOWN_SECONDS = 3

export function RedirectModal() {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          window.location.href = TARGET_URL
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl shadow-2xl p-8 flex flex-col items-center gap-5 w-full max-w-sm mx-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-lg font-semibold">Redirigiendo al Dashboard de Koi</h2>
          <p className="text-sm text-muted-foreground">
            Serás redirigido automáticamente en{" "}
            <span className="font-bold text-foreground">{seconds}</span>{" "}
            {seconds === 1 ? "segundo" : "segundos"}...
          </p>
        </div>
        <a
          href={TARGET_URL}
          className="text-xs text-primary underline underline-offset-4 hover:opacity-80"
        >
          Ir ahora
        </a>
      </div>
    </div>
  )
}
