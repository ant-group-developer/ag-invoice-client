import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { auth0Config } from './config/auth0.ts'
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
        <Auth0Provider {...auth0Config}>
          <BrowserRouter>
            <NuqsAdapter>
              <AppRoutes />
            </NuqsAdapter>
          </BrowserRouter>
        </Auth0Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>
)
