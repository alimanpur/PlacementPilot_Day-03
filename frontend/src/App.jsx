import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import AppRoutes from '@/routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          expand
          richColors
          toastOptions={{
            style: {
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
