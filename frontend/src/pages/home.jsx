
import { Navigate } from 'react-router-dom';

import { useAuthContext } from '../contexts/auth.jsx'
const HomePage = () => {
  const { user, isInitializing } = useAuthContext()
  if (isInitializing) return null;
  if (!user) {
    return <Navigate to="/login" />
  }
  return <h1>Home page</h1>
}

export default HomePage