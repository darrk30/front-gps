import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/providers'
import { router } from './app/router'
import { InstallPwaBanner } from './components/shared/InstallPwaBanner'

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <InstallPwaBanner />
    </AppProviders>
  )
}

export default App
