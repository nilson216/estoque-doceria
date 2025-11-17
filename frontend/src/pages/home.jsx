
import { Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/button.jsx';

import { useAuthContext } from '../contexts/auth.jsx'
const HomePage = () => {
  const { user, isInitializing, signOut } = useAuthContext()
  if (isInitializing) return null;
  if (!user) {
    return <Navigate to="/login" />
  }
  return (
    <>
      <h1>Ola, {user.name}</h1>
      <Button onClick={signOut}>Sair</Button>
    </>
  )
}

export default HomePage