import { useState } from 'react'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  ChevronUp,
  X,
  Send,
  FolderInput,
  Share2,
  Tag,
  Archive,
  Trash2,
} from 'lucide-react'
import ContentTable from './ContentTable'
import { initialContentData } from './ContentTable'
import MobileStudio from './MobileStudio'
import FlowStudio from './FlowStudio'
import './ContentArea.css'

function formatDate() {
  const d = new Date()
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

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

function SelfHelpMenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path
        d="M8 8C8 6.89543 8.89543 6 10 6C11.1046 6 12 6.89543 12 8C12 8.74028 11.5978 9.38663 11 9.73244V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="13.5" r="0.75" fill="currentColor"/>
    </svg>
  )
}

function TaskListMenuIcon() {
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

function CreateMenuIcon({ Icon, customSvg }) {
  if (customSvg) return <Icon />
  return <Icon size={20} strokeWidth={1.5} aria-hidden />
}

/** Create Content dropdown: flows + core widgets (subset of V2 studio catalog). */
const CREATE_MENU_SECTIONS = [
  {
    id: 'content',
    items: [
      { id: 'flows', label: 'Flows', Icon: DirectionsIcon, customSvg: true, route: 'flow' },
    ],
  },
  {
    id: 'widgets',
    items: [
      { id: 'beacon', label: 'Beacon', Icon: LivePhotoIcon, customSvg: true, route: 'beacon' },
      { id: 'smarttip', label: 'Smart-tip', Icon: MessageReportIcon, customSvg: true, route: 'smarttip' },
      { id: 'popup', label: 'Pop-up', Icon: AppWindowIcon, customSvg: true, route: 'popup' },
      { id: 'self-help', label: 'Self help', Icon: SelfHelpMenuIcon, customSvg: true, route: 'self-help' },
      { id: 'task-list', label: 'Task list', Icon: TaskListMenuIcon, customSvg: true, route: 'task-list' },
    ],
  },
]

const STUB_CATALOG_HINT =
  'Same tile as the V2 studio panel — not wired to a creation flow in this demo (matches V2 console.log).'

function ContentArea() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showMobileStudio, setShowMobileStudio] = useState(false)
  const [showFlowStudio, setShowFlowStudio] = useState(false)
  /** Row opened from dashboard Edit (Flow / Popup / Smart Tip / Beacon). */
  const [editTarget, setEditTarget] = useState(null)
  const [parityNotice, setParityNotice] = useState(null)
  const [selectedPopupType, setSelectedPopupType] = useState(null)
  const [contentItems, setContentItems] = useState(() => [...initialContentData])
  const [activeContentTab, setActiveContentTab] = useState('published')
  const [selectedIds, setSelectedIds] = useState([])

  const handleCreateClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleCreateMenuPick = (item) => {
    setIsDropdownOpen(false)
    setParityNotice(null)

    switch (item.route) {
      case 'flow':
        setEditTarget(null)
        setShowFlowStudio(true)
        break
      case 'popup':
        setEditTarget(null)
        setSelectedPopupType(null)
        setShowMobileStudio(true)
        break
      case 'smarttip':
        setEditTarget(null)
        setSelectedPopupType('smarttip')
        setShowMobileStudio(true)
        break
      case 'beacon':
        setEditTarget(null)
        setSelectedPopupType('beacon')
        setShowMobileStudio(true)
        break
      case 'self-help':
        addDraftItem({ name: '', type: 'Self Help' })
        break
      case 'task-list':
        addDraftItem({ name: '', type: 'Task List' })
        break
      case 'stub':
      default:
        setParityNotice(`${item.label}: ${STUB_CATALOG_HINT}`)
        break
    }
  }

  const handleCloseMobileStudio = () => {
    setShowMobileStudio(false)
    setSelectedPopupType(null)
    setEditTarget(null)
  }

  const handleCloseFlowStudio = () => {
    setShowFlowStudio(false)
    setEditTarget(null)
  }

  const handleEditItem = (item) => {
    if (!item || item.isFolder) return
    setParityNotice(null)
    setEditTarget(item)
    switch (item.type) {
      case 'Flow':
        setShowFlowStudio(true)
        break
      case 'Popup':
      case 'Smart Tip':
      case 'Beacon':
        setSelectedPopupType(null)
        setShowMobileStudio(true)
        break
      default:
        setEditTarget(null)
        setParityNotice(`Edit for ${item.type}: ${STUB_CATALOG_HINT}`)
    }
  }

  const addDraftItem = (payload) => {
    const { name, type, id: existingId, creationSnapshot } = payload
    const defaultName =
      type === 'Flow'
        ? 'Untitled Flow'
        : type === 'Smart Tip'
          ? 'Untitled Smart Tip'
          : type === 'Beacon'
            ? 'Untitled Beacon'
            : type === 'Self Help'
              ? 'Untitled Self Help'
              : type === 'Task List'
                ? 'Untitled Task List'
                : 'Untitled Pop-up'

    if (existingId != null) {
      setContentItems((prev) =>
        prev.map((item) =>
          item.id === existingId
            ? {
                ...item,
                name: name || item.name,
                type: type || item.type,
                lastUpdated: formatDate(),
                lastUpdatedBy: 'You',
                ...(creationSnapshot != null ? { creationSnapshot } : {}),
              }
            : item
        )
      )
      setActiveContentTab('draft')
      return
    }

    setContentItems((prev) => [
      {
        id: Date.now(),
        name: name || defaultName,
        type,
        status: 'draft',
        isFolder: false,
        platform: null,
        members: ['S', 'A', 'R'],
        lastUpdated: formatDate(),
        lastUpdatedBy: 'You',
        ...(creationSnapshot != null ? { creationSnapshot } : {}),
      },
      ...prev,
    ])
    setActiveContentTab('draft')
  }

  if (showFlowStudio) {
    return (
      <FlowStudio
        key={editTarget?.id != null ? `flow-edit-${editTarget.id}` : 'flow-create'}
        editItem={editTarget}
        onClose={handleCloseFlowStudio}
        onSave={addDraftItem}
      />
    )
  }

  if (showMobileStudio) {
    return (
      <MobileStudio
        key={editTarget?.id != null ? `mobile-edit-${editTarget.id}` : 'mobile-create'}
        onClose={handleCloseMobileStudio}
        popupType={editTarget ? null : selectedPopupType}
        editItem={editTarget}
        onSave={addDraftItem}
      />
    )
  }

  const filteredItems =
    activeContentTab === 'draft'
      ? contentItems.filter(item => item.status === 'draft' || item.status === 'published')
      : contentItems.filter(item => item.status === activeContentTab)

  // Newest first: sort by id descending (new items use Date.now() as id, so higher = newer)
  const sortedItems = [...filteredItems].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))

  return (
    <main className="content-area">
      {parityNotice && (
        <div className="create-content-notice" role="status">
          <span className="create-content-notice-text">{parityNotice}</span>
          <button
            type="button"
            className="create-content-notice-dismiss"
            aria-label="Dismiss"
            onClick={() => setParityNotice(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

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
              <div className="create-dropdown create-dropdown--v2-parity" role="menu" aria-label="Create content catalog">
                {CREATE_MENU_SECTIONS.map((section) => (
                  <div key={section.id} className="create-dropdown-section">
                    {section.label ? (
                      <div className="create-dropdown-section-label" aria-hidden>
                        {section.label}
                      </div>
                    ) : null}
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => handleCreateMenuPick(item)}
                      >
                        <CreateMenuIcon Icon={item.Icon} customSvg={item.customSvg} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-controls">
        <div className="controls-left">
          <div className="tabs">
            <button
              className={`tab ${activeContentTab === 'draft' ? 'active' : ''}`}
              onClick={() => setActiveContentTab('draft')}
            >
              <span className="tab-label">Draft</span>
              {activeContentTab === 'draft' && <div className="tab-indicator" />}
            </button>
            <button
              className={`tab ${activeContentTab === 'published' ? 'active' : ''}`}
              onClick={() => setActiveContentTab('published')}
            >
              <span className="tab-label">Ready</span>
              {activeContentTab === 'published' && <div className="tab-indicator" />}
            </button>
            <button
              className={`tab ${activeContentTab === 'unpublished' ? 'active' : ''}`}
              onClick={() => setActiveContentTab('unpublished')}
            >
              <span className="tab-label">Production</span>
              {activeContentTab === 'unpublished' && <div className="tab-indicator" />}
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

      {/* Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="selection-action-bar">
          <div className="selection-count">
            <span className="selection-badge">{selectedIds.length} selected</span>
            <button 
              className="selection-clear-btn" 
              onClick={() => setSelectedIds([])}
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          </div>
          <div className="selection-actions">
            <button className="selection-action-btn">
              <Send size={16} />
              <span>Send to Ready</span>
            </button>
            <button className="selection-action-btn">
              <FolderInput size={16} />
              <span>Move to folder</span>
            </button>
            <button className="selection-action-btn">
              <Share2 size={16} />
              <span>Share</span>
            </button>
            <button className="selection-action-btn">
              <Tag size={16} />
              <span>Tags</span>
            </button>
            <button className="selection-action-btn">
              <Archive size={16} />
              <span>Archive</span>
            </button>
            <button className="selection-action-btn selection-action-btn--danger">
              <Trash2 size={16} />
              <span>Delete content</span>
            </button>
          </div>
        </div>
      )}

      <div className="divider-horizontal" />

      <ContentTable 
        items={sortedItems} 
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEditItem={handleEditItem}
      />

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

    </main>
  )
}

export default ContentArea
