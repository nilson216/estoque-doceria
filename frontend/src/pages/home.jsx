import { PlusIcon } from 'lucide-react'
import { Navigate } from 'react-router-dom'

import DateSelection from '@/components/date-selection.jsx'
import { Header } from '@/components/header.jsx'
import { Button } from '@/components/ui/button.jsx'

import { useAuthContext } from '../contexts/auth.jsx'

const HomePage = () => {
  const { user, isInitializing } = useAuthContext()

  if (isInitializing) return null

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <Header />
      <div className="p-8">
        {/* Parte do Topo */}
      <div className="flex justify-between items-center">
        <h2 className='font-bold text-2xl'>Dashboard</h2>
        <div className="flex items-center gap-2">
          <DateSelection />
          <Button >
            <PlusIcon />
            Nova Movimentação
            </Button>
          {/* Seletor de Data e botao de novo ingrediente */}
        </div>
      </div>
      {/* GRAFICOS ETC */}
      </div>
    </>
  )
}

export default HomePage
