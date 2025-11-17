import { Navigate } from 'react-router-dom'

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
      <div className="flex justify-between items-center">\
        <h2>Dashboard</h2>
        <div>
          {/* Seletor de Data e botao de novo ingrediente */}
        </div>
      </div>
    </>
  )
}

export default HomePage
