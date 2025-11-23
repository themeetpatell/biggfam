import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Website from './Website.jsx'
import FamilyApp from './FamilyApp.jsx'
import Auth from './Auth.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Marketing Website */}
        <Route path="/*" element={<Website />} />
        
        {/* Auth */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Platform App */}
        <Route path="/app/*" element={<FamilyApp />} />
        <Route path="/family/*" element={<FamilyApp />} />
      </Routes>
    </Router>
  </StrictMode>
)
