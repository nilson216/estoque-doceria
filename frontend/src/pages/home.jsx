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
    </>
  )
}

export default HomePage
