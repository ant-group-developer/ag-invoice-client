import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './config/query-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import AppRoutes from './routes/route.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={enUS}>
      <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <NuqsAdapter>
              <AppRoutes />
            </NuqsAdapter>
          </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>
)
