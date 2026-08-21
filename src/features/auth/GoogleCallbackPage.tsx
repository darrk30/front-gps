import { Navigate } from 'react-router-dom'

// @react-oauth/google resuelve el login vía popup (ver LoginPage), por lo que
// no hay nada que procesar aquí. Se mantiene la ruta por si en el futuro se
// necesita un flujo de redirect completo.
export function GoogleCallbackPage() {
  return <Navigate to="/login" replace />
}
