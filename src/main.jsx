import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import Website from './Website.jsx'
import FamilyApp from './FamilyApp.jsx'
import Auth from './Auth.jsx'

function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontSize: '18px', color: '#888'
      }}>
        Loading…
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/app/*" element={<RequireAuth><FamilyApp /></RequireAuth>} />
          <Route path="/family/*" element={<RequireAuth><FamilyApp /></RequireAuth>} />
          <Route path="/*" element={<Website />} />
        </Routes>
      </Router>
    </ClerkProvider>
  </StrictMode>
)
