import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import App from './App.tsx'
import './index.css'
import './lib/i18n'

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <App />
    </Suspense>
  </QueryClientProvider>
);
