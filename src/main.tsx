import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import App from './App.tsx'
import './index.css'
import './lib/i18n'

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<div>Loading translations...</div>}>
      <App />
    </Suspense>
  </QueryClientProvider>
);
