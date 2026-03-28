import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import Website from './Website.jsx'
import FamilyApp from './FamilyApp.jsx'
import Auth from './Auth.jsx'

function RequireAuth({ children }) {
  const location = useLocation()
  const isAuthed = localStorage.getItem('biggfam_auth') === 'true'
  if (!isAuthed) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<Auth />} />

        {/* Platform App — protected */}
        <Route path="/app/*" element={<RequireAuth><FamilyApp /></RequireAuth>} />
        <Route path="/family/*" element={<RequireAuth><FamilyApp /></RequireAuth>} />

        {/* Marketing Website — catch-all last */}
        <Route path="/*" element={<Website />} />
      </Routes>
    </Router>
  </StrictMode>
)
