import { useState } from 'react'
import { 
  Search, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  ChevronUp
} from 'lucide-react'
import ContentTable from './ContentTable'
import PopupTypeModal from './PopupTypeModal'
import MobileStudio from './MobileStudio'
import FlowStudio from './FlowStudio'
import './ContentArea.css'

// Dropdown menu icons
function DirectionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3V17M10 3L6 7M10 3L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10H7M17 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 13L10 17L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function AppWindowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="5.5" cy="6" r="0.75" fill="currentColor"/>
      <circle cx="7.5" cy="6" r="0.75" fill="currentColor"/>
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

function ListCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 5L5.5 6.5L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 10L5.5 11.5L8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 15L5.5 16.5L8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 15H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function LivePhotoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
    </svg>
  )
}

function MessageReportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 4H16C16.5523 4 17 4.44772 17 5V13C17 13.5523 16.5523 14 16 14H6L3 17V5C3 4.44772 3.44772 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="12" r="0.75" fill="currentColor"/>
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5H17M6 10H14M9 15H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function ColumnsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="12" y="3" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

const dropdownItems = [
  { id: 'flow', label: 'Flow', icon: DirectionsIcon },
  { id: 'popup', label: 'Pop-up', icon: AppWindowIcon },
  { id: 'selfhelp', label: 'Self Help', icon: HelpIcon },
  { id: 'tasklist', label: 'Task list', icon: ListCheckIcon },
  { id: 'beacon', label: 'Beacon', icon: LivePhotoIcon },
  { id: 'smarttip', label: 'Smart-tip', icon: MessageReportIcon },
]

function ContentArea() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showPopupModal, setShowPopupModal] = useState(false)
  const [showMobileStudio, setShowMobileStudio] = useState(false)
  const [showFlowStudio, setShowFlowStudio] = useState(false)
  const [selectedPopupType, setSelectedPopupType] = useState(null)

  const handleCreateClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleItemClick = (itemId) => {
    setIsDropdownOpen(false)

    if (itemId === 'popup') {
      setShowPopupModal(true)
    } else if (itemId === 'flow') {
      setShowFlowStudio(true)
    } else {
      console.log('Selected:', itemId)
    }
  }

  const handlePopupTypeSelect = (typeId) => {
    console.log('Selected popup type:', typeId)
    setSelectedPopupType(typeId)
    setShowPopupModal(false)
    setShowMobileStudio(true)
  }

  const handleCloseMobileStudio = () => {
    setShowMobileStudio(false)
    setSelectedPopupType(null)
  }

  // If Flow Studio is open, show flow creation journey
  if (showFlowStudio) {
    return (
      <FlowStudio onClose={() => setShowFlowStudio(false)} />
    )
  }

  // If Mobile Studio is open, show popup creation journey
  if (showMobileStudio) {
    return (
      <MobileStudio 
        onClose={handleCloseMobileStudio}
        popupType={selectedPopupType}
      />
    )
  }

  return (
    <main className="content-area">
      <div className="content-header">
        <div className="header-left">
          <div className="breadcrumb">
            <a href="#" className="breadcrumb-link">Content</a>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Folder name</span>
          </div>
          <h1 className="page-title">Content</h1>
        </div>
        <div className="header-right">
          <div className="create-content-wrapper">
            <button className="btn btn-primary" onClick={handleCreateClick}>
              Create Content
              {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isDropdownOpen && (
              <div className="create-dropdown">
                {dropdownItems.map((item) => (
                  <button 
                    key={item.id} 
                    className="dropdown-item"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-controls">
        <div className="controls-left">
          <div className="tabs">
            <button className="tab active">
              <span className="tab-label">Draft</span>
              <div className="tab-indicator" />
            </button>
            <button className="tab">
              <span className="tab-label">Published </span>
            </button>
            <button className="tab">
              <span className="tab-label">Unpublished</span>
            </button>
          </div>
        </div>

        <div className="controls-right">
          <button className="btn btn-tertiary btn-info">
            <FolderPlus size={20} />
            Create folder
          </button>

          <div className="search-filters">
            <div className="search-box">
              <div className="search-prefix">
                <Search size={20} />
              </div>
              <input type="text" placeholder="Search" />
            </div>
            
            <button className="btn btn-secondary">
              <FilterIcon />
              Filters
            </button>
          </div>

          <div className="view-actions">
            <div className="divider-vertical" />
            <button className="btn btn-icon">
              <GridIcon />
            </button>
            <button className="btn btn-icon">
              <ColumnsIcon />
            </button>
            <button className="btn btn-icon active">
              <ListIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="divider-horizontal" />

      <ContentTable />

      <div className="pagination">
        <div className="pagination-info">
          <span>Rows <strong>1-15</strong> of <strong>120</strong> </span>
        </div>
        <div className="pagination-controls">
          <button className="pagination-nav" disabled>
            <ChevronLeft size={16} />
          </button>
          <div className="pagination-pages">
            <button className="page-btn">1</button>
            <button className="page-btn active">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">...</button>
            <button className="page-btn">21</button>
          </div>
          <button className="pagination-nav">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {showPopupModal && (
        <PopupTypeModal 
          onClose={() => setShowPopupModal(false)}
          onSelect={handlePopupTypeSelect}
        />
      )}
    </main>
  )
}

export default ContentArea
