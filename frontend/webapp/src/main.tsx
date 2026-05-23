import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@/api/client'
import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'
import { SessionBootstrap } from '@/app/SessionBootstrap'
import '@/styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <SessionBootstrap>
        <RouterProvider router={router} />
      </SessionBootstrap>
    </AppProviders>
  </StrictMode>,
)
