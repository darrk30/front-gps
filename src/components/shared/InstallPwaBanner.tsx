import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

function estaInstalada(): boolean {
  const enStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return enStandalone || iosStandalone
}

function esIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

/**
 * Banner para instalar la PWA, sin depender del mini-banner nativo del
 * navegador (poco fiable: solo aparece tras varias visitas y heurísticas
 * propias, y en iOS Safari ni siquiera existe). iOS no dispara
 * `beforeinstallprompt` — ahí solo se puede instalar a mano vía
 * "Compartir → Agregar a inicio", así que se muestran instrucciones en vez
 * de un botón.
 *
 * A propósito no persiste el cierre (ni en localStorage ni sessionStorage):
 * las notificaciones push en segundo plano solo son confiables con la app
 * instalada (crítico en iOS 16.4+, que las bloquea del todo si no lo está),
 * así que este banner vuelve a aparecer cada vez que se entra a la app
 * mientras siga sin instalarse.
 */
export function InstallPwaBanner() {
  const { puedeInstalar, instalar } = useInstallPrompt()
  const [instalada, setInstalada] = useState(true)
  const [cerrado, setCerrado] = useState(false)
  const ios = esIOS()

  useEffect(() => {
    setInstalada(estaInstalada())
    const onAppInstalled = () => setInstalada(true)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => window.removeEventListener('appinstalled', onAppInstalled)
  }, [])

  if (instalada || cerrado || !(puedeInstalar || ios)) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card p-3 shadow-lg sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:rounded-lg sm:border">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Download className="size-4" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">Instala UNPRG Bus Tracker</p>
          {ios ? (
            <p className="text-xs text-muted-foreground">
              Toca <Share className="inline size-3" /> Compartir y luego "Agregar a inicio" para recibir
              notificaciones aunque la app esté cerrada.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Instálala para recibir notificaciones aunque la app esté cerrada.
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => setCerrado(true)} aria-label="Cerrar">
          <X className="size-4" />
        </Button>
      </div>
      {!ios && (
        <Button
          className="mt-2 w-full"
          size="sm"
          onClick={async () => {
            const aceptado = await instalar()
            if (aceptado) setInstalada(true)
          }}
        >
          Instalar
        </Button>
      )}
    </div>
  )
}
