import { useState, useEffect, useRef } from 'react'
import './components.css'

export const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export const Tooltip = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div 
      className="tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && <div className={`tooltip ${position}`}>{content}</div>}
    </div>
  )
}

export const Dropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && <div className="dropdown-menu">{children}</div>}
    </div>
  )
}

export const SearchBar = ({ placeholder, onSearch, value, onChange }) => {
  return (
    <div className="search-bar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="search-icon">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <input 
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          onSearch(e.target.value)
        }}
        className="search-input"
      />
      {value && (
        <button 
          className="search-clear" 
          onClick={() => {
            onChange('')
            onSearch('')
          }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}

export const Toast = ({ message, type = 'info', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className={`toast ${type}`}>
      <div className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </div>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  )
}

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skeleton skeleton-${type}`}>
      {type === 'card' && (
        <>
          <div className="skeleton-header"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </>
      )}
      {type === 'list' && (
        <div className="skeleton-list-item">
          <div className="skeleton-circle"></div>
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
      )}
    </div>
  ))

  return <div className="skeleton-container">{skeletons}</div>
}

export const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        className="progress-ring-circle-bg"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="progress-ring-circle"
        stroke="url(#gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          strokeDasharray: `${circumference} ${circumference}`,
          strokeDashoffset: offset,
        }}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <text 
        x="50%" 
        y="50%" 
        textAnchor="middle" 
        dy=".3em" 
        className="progress-ring-text"
      >
        {progress}%
      </text>
    </svg>
  )
}

export const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export const EmptyState = ({ icon, title, description, action, actionLabel }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && actionLabel && (
        <button className="primary" onClick={action}>{actionLabel}</button>
      )}
    </div>
  )
}

export const Badge = ({ children, variant = 'default', size = 'medium' }) => {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {children}
    </span>
  )
}

export const Switch = ({ checked, onChange, label }) => {
  return (
    <label className="switch-container">
      <div className="switch">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="switch-slider"></span>
      </div>
      {label && <span className="switch-label">{label}</span>}
    </label>
  )
}

export const Accordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div key={index} className="accordion-item">
          <button
            className={`accordion-header ${openIndex === index ? 'active' : ''}`}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span>{item.title}</span>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              className={`accordion-icon ${openIndex === index ? 'rotated' : ''}`}
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
          <div className={`accordion-content ${openIndex === index ? 'open' : ''}`}>
            <div className="accordion-body">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const Card = ({ children, onClick, hoverable = false, className = '' }) => {
  return (
    <div 
      className={`card-component ${hoverable ? 'hoverable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  )
}

export const Select = ({ options, value, onChange, placeholder }) => {
  return (
    <select 
      className="select-component"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

