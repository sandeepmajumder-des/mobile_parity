import { 
  Network,
  ChevronsUpDown,
  ChevronLeft,
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
  { id: 'content', label: 'Content', active: true, icon: 'layout-grid' },
  { id: 'analytics', label: 'Mobile analytics', icon: 'report-analytics' },
  { id: 'style', label: 'Style', icon: 'color-swatch' },
  { id: 'tags', label: 'Tags', icon: 'tags' },
  { id: 'testing', label: 'Auto testing', icon: 'test-pipe' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
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

function TagsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 7.5V5C3 3.89543 3.89543 3 5 3H7.5L16.5 12C17.2929 12.7929 17.2929 14.0929 16.5 14.8858L14.8858 16.5C14.0929 17.2929 12.7929 17.2929 12 16.5L3 7.5Z" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="6.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function TestPipeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M8 3V8L4 14C3.5 15 4 16.5 5.5 16.5H14.5C16 16.5 16.5 15 16 14L12 8V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 3H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="12" r="1" fill="currentColor"/>
      <circle cx="12" cy="13" r="1" fill="currentColor"/>
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

function getNavIcon(iconName) {
  switch(iconName) {
    case 'layout-grid': return <LayoutGridIcon />
    case 'report-analytics': return <ReportAnalyticsIcon />
    case 'color-swatch': return <ColorSwatchIcon />
    case 'tags': return <TagsIcon />
    case 'test-pipe': return <TestPipeIcon />
    case 'settings': return <SettingsIcon />
    default: return <LayoutGridIcon />
  }
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-header">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 8L20 12L16 16" fill="#FBA450"/>
                  <path d="M8 8L4 12L8 16" fill="#FBA450"/>
                  <path d="M16 8L12 4L8 8L12 12L16 8Z" fill="#F55800"/>
                  <path d="M16 16L12 20L8 16L12 12L16 16Z" fill="#F55800"/>
                  <path d="M12 12L16 8L20 12L16 16L12 12Z" fill="#C43F27"/>
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
          <span className="account-name">Ryan_LCG_spoutbout</span>
          <ChevronsUpDown size={16} className="chevron" />
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <a 
              key={item.id} 
              href="#" 
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              <span className="icon-container">
                {getNavIcon(item.icon)}
              </span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="spacer" />

      <div className="divider" />

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar-container">
            <div className="avatar">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=c0aede" alt="John Doe" />
            </div>
          </div>
          <span className="user-name">Ryan_LCG</span>
        </div>
        
        <a href="#" className="nav-item footer-item">
          <span className="icon-container">
            <HelpIcon />
          </span>
          <span>Help and support</span>
        </a>
        <a href="#" className="nav-item footer-item notification-item">
          <span className="icon-container notification-icon-wrap">
            <NotificationIcon />
            <span className="notification-dot" aria-hidden />
          </span>
          <span>Notifications</span>
        </a>

        <div className="divider" />

        <div className="whatfix-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M16 8L20 12L16 16" fill="#FBA450"/>
            <path d="M8 8L4 12L8 16" fill="#FBA450"/>
            <path d="M16 8L12 4L8 8L12 12L16 8Z" fill="#F55800"/>
            <path d="M16 16L12 20L8 16L12 12L16 16Z" fill="#F55800"/>
          </svg>
          <span className="whatfix-text">whatfix</span>
        </div>
      </div>

      <button className="collapse-btn">
        <ChevronLeft size={14} />
      </button>
    </aside>
  )
}

export default Sidebar
