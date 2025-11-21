import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import AddIngredientButton from '@/components/add-ingredient-button.jsx'
import DateSelection from '@/components/date-selection.jsx'
import { Header } from '@/components/header.jsx'
import IngredientsTable from '@/components/ingredients-table'
import MovementsTable from '@/components/movements-table'

import { useAuthContext } from '../contexts/auth.jsx'

const HomePage = () => {
  const { user, isInitializing } = useAuthContext()
  const [createdSignal, setCreatedSignal] = useState(0)

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
          <DateSelection prefix="created" placeholder="Registro: selecione intervalo" />
          <DateSelection prefix="expiry" placeholder="Validade: selecione intervalo" />
          <AddIngredientButton onCreated={() => setCreatedSignal(s => s + 1)} />
          {/* Seletor de Data e botao de novo ingrediente */}
        </div>
      </div>
      
      {/* Conteúdo principal: tabela de ingredientes */}
      <div className="mt-6">
        <IngredientsTable refreshSignal={createdSignal} />
      </div>

      <div className="mt-8">
        <MovementsTable refreshSignal={createdSignal} />
      </div>

      </div>
    </>
  )
}

export default HomePage
