import { useEffect } from 'react'
import { NavLink, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useClerk } from '@clerk/react'
import './FamilyApp.css'
import { FamilyProvider, useFamily } from './contexts/FamilyContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Onboarding from './components/Onboarding.jsx'

import HomeSection from './sections/HomeSection.jsx'
import BulletinSection from './sections/BulletinSection.jsx'
import WealthSection from './sections/WealthSection.jsx'
import CalendarSection from './sections/CalendarSection.jsx'
import CareSection from './sections/CareSection.jsx'
import GoalsSection from './sections/GoalsSection.jsx'
import DocumentsSection from './sections/DocumentsSection.jsx'
import MemorySection from './sections/MemorySection.jsx'
import SettingsSection from './sections/SettingsSection.jsx'
import MaahiAI from './sections/MaahiAI.jsx'

export default function FamilyApp() {
  return (
    <FamilyProvider>
      <FamilyAppInner />
    </FamilyProvider>
  )
}

function FamilyAppInner() {
  const { family, loading, maahiContext } = useFamily()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '18px', color: '#888' }}>
        Loading your family space…
      </div>
    )
  }

  if (!family) return <Onboarding />

  return (
    <div className="app-layout">
      <ScrollToTop />
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ErrorBoundary><HomeSection /></ErrorBoundary>} />
          <Route path="/bulletin" element={<ErrorBoundary><BulletinSection /></ErrorBoundary>} />
          <Route path="/wealth" element={<ErrorBoundary><WealthSection /></ErrorBoundary>} />
          <Route path="/calendar" element={<ErrorBoundary><CalendarSection /></ErrorBoundary>} />
          <Route path="/care" element={<ErrorBoundary><CareSection /></ErrorBoundary>} />
          <Route path="/goals" element={<ErrorBoundary><GoalsSection /></ErrorBoundary>} />
          <Route path="/documents" element={<ErrorBoundary><DocumentsSection /></ErrorBoundary>} />
          <Route path="/memories" element={<ErrorBoundary><MemorySection /></ErrorBoundary>} />
          <Route path="/maahi" element={<ErrorBoundary><MaahiAI familyContext={maahiContext} /></ErrorBoundary>} />
          <Route path="/settings" element={<ErrorBoundary><SettingsSection /></ErrorBoundary>} />
          {/* Legacy routes kept for backward compat */}
          <Route path="/hub" element={<ErrorBoundary><BulletinSection /></ErrorBoundary>} />
          <Route path="/legacy" element={<ErrorBoundary><DocumentsSection /></ErrorBoundary>} />
          <Route path="/planning" element={<ErrorBoundary><GoalsSection /></ErrorBoundary>} />
          <Route path="/rituals" element={<ErrorBoundary><MemorySection /></ErrorBoundary>} />
          <Route path="/ai" element={<ErrorBoundary><MaahiAI familyContext={maahiContext} /></ErrorBoundary>} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

const NAV_ITEMS = [
  { to: '/family', end: true, icon: '🏠', label: 'Home' },
  { to: '/family/bulletin', icon: '💬', label: 'Bulletin' },
  { to: '/family/wealth', icon: '💸', label: 'Hisaab' },
  { to: '/family/care', icon: '🏥', label: 'Sehat' },
  { to: '/family/calendar', icon: '📅', label: 'Calendar' },
  { to: '/family/goals', icon: '🌟', label: 'Sapne' },
  { to: '/family/documents', icon: '📁', label: 'Kagaz' },
  { to: '/family/memories', icon: '📸', label: 'Yaadein' },
  { to: '/family/maahi', icon: '🤖', label: 'Maahi' },
  { to: '/family/settings', icon: '⚙️', label: 'Settings' },
]

function Sidebar() {
  const { signOut } = useClerk()
  const navigate = useNavigate()
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">🏠</span>
        <span className="sidebar-brand-name">BiggFam</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="sidebar-signout" onClick={() => signOut(() => navigate('/auth'))}>
        Sign out
      </button>
    </aside>
  )
}

function BottomNav() {
  const location = useLocation()
  const primaryTabs = NAV_ITEMS.slice(0, 4)
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {primaryTabs.map(item => {
        const isActive = item.end
          ? location.pathname === '/family' || location.pathname === '/family/'
          : location.pathname.startsWith(item.to)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={`bottom-tab${isActive ? ' active' : ''}`}
          >
            <span className="bottom-tab-icon">{item.icon}</span>
            <span className="bottom-tab-label">{item.label}</span>
          </NavLink>
        )
      })}
      <NavLink to="/family/maahi" className={({ isActive }) => `bottom-tab${isActive ? ' active' : ''}`}>
        <span className="bottom-tab-icon">🤖</span>
        <span className="bottom-tab-label">Maahi</span>
      </NavLink>
    </nav>
  )
}
