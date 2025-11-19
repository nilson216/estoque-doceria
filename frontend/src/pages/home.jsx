import { Navigate } from 'react-router-dom'

import AddMovementButton from '@/components/add-ingredient-button.jsx'
import DateSelection from '@/components/date-selection.jsx'
import { Header } from '@/components/header.jsx'

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
          <AddMovementButton />
          {/* Seletor de Data e botao de novo ingrediente */}
        </div>
      </div>
      {/* GRAFICOS ETC */}
      </div>
    </>
  )
}

export default HomePage
