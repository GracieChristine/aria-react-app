import { useAuth } from '../hooks/useAuth'
import LandingPage from './LandingPage'
import ListingsPage from './ListingsPage'

export default function HomePage() {
  const { user } = useAuth()
  return user ? <ListingsPage /> : <LandingPage />
}
