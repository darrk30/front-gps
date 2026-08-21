import { useEffect, useState } from 'react'

/**
 * Conserva el último heading no nulo. El bus detenido manda heading:null y
 * no debe "resetear" la orientación (ni la dirección inferida) que se venía
 * mostrando — se congela en el último valor real hasta el próximo ping.
 */
export function useLastKnownHeading(heading: number | null): number | null {
  const [last, setLast] = useState(heading)
  useEffect(() => {
    if (heading != null) setLast(heading)
  }, [heading])
  return last
}
