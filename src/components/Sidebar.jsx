import { useState } from 'react'
import { 
  Network,
  ChevronsUpDown,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  FileText,
  Settings2,
  Users,
  Cog,
  Smartphone,
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
  { id: 'content', label: 'Content', icon: 'layout-grid' },
  { id: 'analytics', label: 'Mobile analytics', icon: 'report-analytics' },
  { id: 'style', label: 'Style', icon: 'color-swatch' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

const settingsMenu = [
  {
    id: 'app-screens',
    label: 'App screens',
    icon: Smartphone,
    items: [
      { id: 'manage-screens', label: 'Manage screens' },
      { id: 'screen-settings', label: 'Screen settings' },
    ]
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    items: [
      { id: 'translations', label: 'Translations' },
      { id: 'video', label: 'Video' },
    ]
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Settings2,
    items: [
      { id: 'repositories', label: 'Repositories' },
      { id: 'video-channels', label: 'Video channels' },
      { id: 'app-integrations', label: 'App integrations' },
    ]
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    items: [
      { id: 'teammates', label: 'Teammates', badge: 'New' },
      { id: 'team-audit-logs', label: 'Team audit logs' },
    ]
  },
  {
    id: 'setup',
    label: 'Setup',
    icon: Cog,
    items: [
      { id: 'api-token', label: 'API token' },
      { id: 'advanced-customisation', label: 'Advanced customisation' },
    ]
  },
]

// Custom icons matching Figma design
function LayoutGridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function ReportAnalyticsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="10" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="8.5" y="6" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="3" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function ColorSwatchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 6C4 4.89543 4.89543 4 6 4H8C9.10457 4 10 4.89543 10 6V14C10 15.1046 9.10457 16 8 16H6C4.89543 16 4 15.1046 4 14V6Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 8L14.5858 3.41421C15.3668 2.63316 16.6332 2.63316 17.4142 3.41421V3.41421C18.1953 4.19526 18.1953 5.46159 17.4142 6.24264L13 10.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="7" cy="13" r="1" fill="currentColor"/>
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 3V5M10 15V17M17 10H15M5 10H3M15.5 4.5L14 6M6 14L4.5 15.5M15.5 15.5L14 14M6 6L4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 8C8 6.89543 8.89543 6 10 6C11.1046 6 12 6.89543 12 8C12 8.74028 11.5978 9.38663 11 9.73244V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="13.5" r="0.75" fill="currentColor"/>
    </svg>
  )
}

function NotificationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3C7.23858 3 5 5.23858 5 8V11L4 13H16L15 11V8C15 5.23858 12.7614 3 10 3Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 14C8 15.1046 8.89543 16 10 16C11.1046 16 12 15.1046 12 14" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function ResourcesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 7H13M7 10H13M7 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M17 10C17 13.866 13.866 17 10 17C8.79 17 7.65 16.71 6.64 16.19L3 17L3.81 13.36C3.29 12.35 3 11.21 3 10C3 6.134 6.134 3 10 3C13.866 3 17 6.134 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function getNavIcon(iconName) {
  switch(iconName) {
    case 'layout-grid': return <LayoutGridIcon />
    case 'report-analytics': return <ReportAnalyticsIcon />
    case 'color-swatch': return <ColorSwatchIcon />
    case 'settings': return <SettingsIcon />
    default: return <LayoutGridIcon />
  }
}

function Sidebar({ activeNav = 'content', onNavSelect }) {
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [expandedSections, setExpandedSections] = useState(['app-screens', 'content', 'integrations', 'team', 'setup'])
  const [activeSettingsItem, setActiveSettingsItem] = useState('video')

  const handleNavClick = (itemId) => {
    if (itemId === 'settings') {
      setShowSettingsPanel(true)
    } else {
      setShowSettingsPanel(false)
      onNavSelect?.(itemId)
    }
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  return (
    <div className="sidebar-wrapper">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-header">
            <div className="header-left">
              <div className="logo">
                <div className="logo-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M16 8L20 12L16 16" fill="#FBA450"/>
                    <path d="M8 8L4 12L8 16" fill="#FBA450"/>
                    <path d="M16 8L12 4L8 8L12 12L16 8Z" fill="#C84900"/>
                    <path d="M16 16L12 20L8 16L12 12L16 16Z" fill="#C84900"/>
                    <path d="M12 12L16 8L20 12L16 16L12 12Z" fill="#8B3A00"/>
                    <path d="M12 12L8 8L4 12L8 16L12 12Z" fill="#FA8A1F"/>
                  </svg>
                </div>
                <span className="logo-text">Guidance</span>
              </div>
            </div>
            <div className="header-actions">
              <button className="menu-btn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="4" height="4" rx="1" fill="currentColor"/>
                  <rect x="8" y="3" width="4" height="4" rx="1" fill="currentColor"/>
                  <rect x="13" y="3" width="4" height="4" rx="1" fill="currentColor"/>
                  <rect x="3" y="8" width="4" height="4" rx="1" fill="currentColor"/>
                  <rect x="8" y="8" width="4" height="4" rx="1" fill="currentColor"/>
                  <rect x="13" y="8" width="4" height="4" rx="1" fill="currentColor"/>
                  <rect x="3" y="13" width="4" height="4" rx="1" fill="currentColor"/>
                  <rect x="8" y="13" width="4" height="4" rx="1" fill="currentColor"/>
                  <rect x="13" y="13" width="4" height="4" rx="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="divider" />

          <div className="account-switcher">
            <div className="account-icon">
              <Network size={18} />
            </div>
            <span className="account-name">Sandeep_old_self...</span>
            <ChevronsUpDown size={16} className="chevron" />
          </div>

          <nav className="nav-menu">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${activeNav === item.id ? 'active' : ''} ${item.id === 'settings' && showSettingsPanel ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="icon-container">
                  {getNavIcon(item.icon)}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

      <div className="spacer" />

      <div className="divider" />

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar-container">
            <div className="avatar avatar-initial">
              <span>S</span>
            </div>
          </div>
          <span className="user-name">Sandeep Majumder</span>
        </div>
        
        <a href="#" className="nav-item footer-item notification-item">
          <span className="icon-container notification-icon-wrap">
            <NotificationIcon />
            <span className="notification-dot" aria-hidden />
          </span>
          <span>Notifications</span>
        </a>
        <a href="#" className="nav-item footer-item">
          <span className="icon-container">
            <ResourcesIcon />
          </span>
          <span>Resources</span>
        </a>
        <a href="#" className="nav-item footer-item">
          <span className="icon-container">
            <ChatIcon />
          </span>
          <span>Chat</span>
        </a>

        <div className="divider" />

        <div className="whatfix-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M16 8L20 12L16 16" fill="#FBA450"/>
            <path d="M8 8L4 12L8 16" fill="#FBA450"/>
            <path d="M16 8L12 4L8 8L12 12L16 8Z" fill="#C84900"/>
            <path d="M16 16L12 20L8 16L12 12L16 16Z" fill="#C84900"/>
          </svg>
          <span className="whatfix-text">whatfix</span>
        </div>
      </div>

        <button className="collapse-btn">
          <ChevronLeft size={14} />
        </button>
      </aside>

      {/* Settings Sub-Navigation Panel */}
      {showSettingsPanel && (
        <div className="settings-panel">
          <div className="settings-panel-header">
            <button 
              className="settings-back-btn"
              onClick={() => setShowSettingsPanel(false)}
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="settings-panel-title">Settings</h2>
          </div>

          <div className="settings-panel-content">
            {settingsMenu.map((section) => (
              <div key={section.id} className="settings-section">
                <button 
                  className="settings-section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="settings-section-left">
                    <section.icon size={18} className="settings-section-icon" />
                    <span className="settings-section-label">{section.label}</span>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronUp size={18} className="settings-section-chevron" />
                  ) : (
                    <ChevronDown size={18} className="settings-section-chevron" />
                  )}
                </button>

                {expandedSections.includes(section.id) && (
                  <div className="settings-section-items">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        className={`settings-item ${activeSettingsItem === item.id ? 'active' : ''}`}
                        onClick={() => setActiveSettingsItem(item.id)}
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="settings-item-badge">{item.badge}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
