import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AuthContextProvider } from './contexts/auth.jsx'
import HomePage from './pages/home.jsx'
import LoginPage from './pages/login.jsx'
import NotFoundPage from './pages/not-found.jsx'
import SignupPage from './pages/signup.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas de Autenticação existentes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Rotas do Sistema de Gerenciamento de Estoque */}
        {/*  <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/estoque/ingredientes" element={<IngredientsPage />} />
          <Route path="/estoque/produtos" element={<ProductsPage />} />
          <Route path="/estoque/movimentacoes" element={<MovementsPage />} />
          */}
          {/* Rota Home pode redirecionar para o Dashboard */}
          <Route path="/homepage" element={<HomePage />} /> 

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthContextProvider>
  </QueryClientProvider>
</StrictMode>
)