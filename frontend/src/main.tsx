import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { GlobalProvider } from './contexts/GlobalContext'
import App from './App'
import './styles/globals.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1
        }
    }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <GlobalProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </GlobalProvider>
        </QueryClientProvider>
    </React.StrictMode>
)