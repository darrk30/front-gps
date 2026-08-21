import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from 'next-themes'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { Toaster } from '@/components/ui/sonner'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function AppProviders({ children }: { children: ReactNode }) {
  const content = (
    // attribute="class" pone/saca la clase `.dark` en <html> — es justo lo
    // que espera `@custom-variant dark (&:is(.dark *))` en index.css.
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  )

  if (!googleClientId) return content

  return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
}
