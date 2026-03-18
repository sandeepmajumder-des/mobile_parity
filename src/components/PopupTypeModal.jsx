import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronDown, Filter } from 'lucide-react'
import './PopupTypeModal.css'

const popupTypes = [
  {
    id: 'overlay',
    title: 'Overlay',
    description: 'Guides users and help them adapt to new features',
    type: 'center'
  },
  {
    id: 'fullscreen',
    title: 'Full screen',
    description: 'Guides users and help them adapt to new features',
    type: 'fullscreen'
  },
  {
    id: 'drawer',
    title: 'Drawer',
    description: 'Guides users and help them adapt to new features',
    type: 'drawer'
  },
  {
    id: 'bottomsheet',
    title: 'Bottom sheet',
    description: 'Guides users and help them adapt to new features',
    type: 'bottomsheet'
  },
  {
    id: 'carousel',
    title: 'Carousel',
    description: 'Guides users and help them adapt to new features',
    type: 'carousel'
  },
  {
    id: 'snackbar',
    title: 'Snackbar',
    description: 'Guides users and help them adapt to new features',
    type: 'snackbar'
  },
  {
    id: 'banner',
    title: 'Banner',
    description: 'Guides users and help them adapt to new features',
    type: 'banner'
  },
]

// Template variations for each popup type
const popupTemplates = {
  overlay: [
    { id: 'overlay-1', name: 'Light Theme', variant: 'light', buttons: 1, alignment: 'center' },
    { id: 'overlay-2', name: 'Dark Theme', variant: 'dark', buttons: 1, alignment: 'center' },
    { id: 'overlay-3', name: 'Two Buttons', variant: 'light', buttons: 2, alignment: 'center' },
    { id: 'overlay-4', name: 'Three Buttons', variant: 'light', buttons: 3, alignment: 'center' },
    { id: 'overlay-5', name: 'Left Aligned', variant: 'light', buttons: 1, alignment: 'left' },
    { id: 'overlay-6', name: 'Right Aligned', variant: 'light', buttons: 1, alignment: 'right' },
  ],
  fullscreen: [
    { id: 'fullscreen-1', name: 'Light Theme', variant: 'light', buttons: 1 },
    { id: 'fullscreen-2', name: 'Dark Theme', variant: 'dark', buttons: 1 },
    { id: 'fullscreen-3', name: 'Two Buttons', variant: 'light', buttons: 2 },
    { id: 'fullscreen-4', name: 'Three Buttons', variant: 'light', buttons: 3 },
    { id: 'fullscreen-5', name: 'With Image', variant: 'light', buttons: 1, hasImage: true },
    { id: 'fullscreen-6', name: 'Minimal', variant: 'light', buttons: 1, minimal: true },
  ],
  drawer: [
    { id: 'drawer-1', name: 'Light Theme', variant: 'light', buttons: 1 },
    { id: 'drawer-2', name: 'Dark Theme', variant: 'dark', buttons: 1 },
    { id: 'drawer-3', name: 'Two Buttons', variant: 'light', buttons: 2 },
    { id: 'drawer-4', name: 'With Header', variant: 'light', buttons: 1, hasHeader: true },
    { id: 'drawer-5', name: 'Scrollable', variant: 'light', buttons: 1, scrollable: true },
    { id: 'drawer-6', name: 'Minimal', variant: 'light', buttons: 1, minimal: true },
  ],
  bottomsheet: [
    { id: 'bottomsheet-1', name: 'Light Theme', variant: 'light', buttons: 1 },
    { id: 'bottomsheet-2', name: 'Dark Theme', variant: 'dark', buttons: 1 },
    { id: 'bottomsheet-3', name: 'Two Buttons', variant: 'light', buttons: 2 },
    { id: 'bottomsheet-4', name: 'Three Buttons', variant: 'light', buttons: 3 },
    { id: 'bottomsheet-5', name: 'With List', variant: 'light', buttons: 1, hasList: true },
    { id: 'bottomsheet-6', name: 'Compact', variant: 'light', buttons: 1, compact: true },
  ],
  carousel: [
    { id: 'carousel-1', name: 'Light Theme', variant: 'light', cards: 3 },
    { id: 'carousel-2', name: 'Dark Theme', variant: 'dark', cards: 3 },
    { id: 'carousel-3', name: 'Five Cards', variant: 'light', cards: 5 },
    { id: 'carousel-4', name: 'With Dots', variant: 'light', cards: 3, hasDots: true },
    { id: 'carousel-5', name: 'Auto Play', variant: 'light', cards: 3, autoPlay: true },
    { id: 'carousel-6', name: 'Minimal', variant: 'light', cards: 3, minimal: true },
  ],
  snackbar: [
    { id: 'snackbar-1', name: 'Light Theme', variant: 'light', action: true },
    { id: 'snackbar-2', name: 'Dark Theme', variant: 'dark', action: true },
    { id: 'snackbar-3', name: 'No Action', variant: 'light', action: false },
    { id: 'snackbar-4', name: 'With Icon', variant: 'light', action: true, hasIcon: true },
    { id: 'snackbar-5', name: 'Success', variant: 'success', action: true },
    { id: 'snackbar-6', name: 'Error', variant: 'error', action: true },
  ],
  banner: [
    { id: 'banner-1', name: 'Light Theme', variant: 'light', buttons: 1 },
    { id: 'banner-2', name: 'Dark Theme', variant: 'dark', buttons: 1 },
    { id: 'banner-3', name: 'Two Buttons', variant: 'light', buttons: 2 },
    { id: 'banner-4', name: 'With Icon', variant: 'light', buttons: 1, hasIcon: true },
    { id: 'banner-5', name: 'Dismissible', variant: 'light', buttons: 1, dismissible: true },
    { id: 'banner-6', name: 'Compact', variant: 'light', buttons: 1, compact: true },
  ],
}

function PopupPreview({ type, template }) {
  // Mini popup preview component
  const variant = template?.variant || 'light'
  const buttons = template?.buttons || 1
  const alignment = template?.alignment || 'center'
  
  return (
    <div className={`popup-preview preview-${type} ${variant === 'dark' ? 'preview-dark' : ''}`}>
      <div className="preview-card">
        <div className="preview-header">
          <span className="preview-title">Say Hello to new features</span>
          {type !== 'snackbar' && <div className="preview-close">×</div>}
        </div>
        <p className="preview-text">
          Here goes the support text to compliment the header title above and explain it.
        </p>
        <div className="preview-buttons" style={{ 
          display: 'flex', 
          gap: '4px', 
          justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
          flexDirection: buttons > 2 ? 'column' : 'row'
        }}>
          <button className="preview-btn">Allright</button>
          {buttons >= 2 && <button className="preview-btn preview-btn-secondary">Cancel</button>}
          {buttons >= 3 && <button className="preview-btn preview-btn-secondary">Maybe</button>}
        </div>
      </div>
      {type === 'carousel' && (
        <>
          <div className="preview-card card-back-1">
            <div className="preview-header">
              <span className="preview-title">Say Hello to new features</span>
            </div>
          </div>
          <div className="preview-card card-back-2">
            <div className="preview-header">
              <span className="preview-title">Say Hello to new features</span>
            </div>
          </div>
        </>
      )}
      {type === 'banner' && (
        <div className="preview-secondary-btn">Okay</div>
      )}
    </div>
  )
}

function PopupTypeModal({ onClose, onSelect }) {
  const [selectedType, setSelectedType] = useState(null) // Single selection for top layout
  const [activeFilters, setActiveFilters] = useState([]) // For filter dropdown
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const filterDropdownRef = useRef(null)

  const handleSelect = (typeId, templateId = null) => {
    onSelect(typeId)
  }

  const handleTopLayoutSelect = (typeId) => {
    // Single selection - if clicking the same type, deselect it
    setSelectedType(prev => prev === typeId ? null : typeId)
  }

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    )
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get selected popup type details
  const selectedPopupType = selectedType ? popupTypes.find(p => p.id === selectedType) : null
  
  // Get templates for selected type, or show all popup types if none selected
  const displayItems = selectedType && popupTemplates[selectedType]
    ? popupTemplates[selectedType].map(template => ({
        ...popupTypes.find(p => p.id === selectedType),
        templateId: template.id,
        templateName: template.name,
        template
      }))
    : activeFilters.length === 0 
      ? popupTypes 
      : popupTypes.filter(popup => activeFilters.includes(popup.id))

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="breadcrumb-nav">
            <a href="#" className="breadcrumb-link" onClick={(e) => { e.preventDefault(); onClose(); }}>All content</a>
            <span className="breadcrumb-sep">/</span>
            <a href="#" className="breadcrumb-link" onClick={(e) => { e.preventDefault(); onClose(); }}>Create content</a>
            <span className="breadcrumb-sep">/</span>
            {selectedPopupType ? (
              <>
                <a href="#" className="breadcrumb-link" onClick={(e) => { e.preventDefault(); setSelectedType(null); }}>Choose popup type</a>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">Choose {selectedPopupType.title} template</span>
              </>
            ) : (
              <span className="breadcrumb-current">Choose popup type</span>
            )}
          </div>
          <div className="header-content">
            <button className="back-btn" onClick={onClose}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="modal-title">
              {selectedPopupType ? `Choose ${selectedPopupType.title} template` : 'Choose popup type'}
            </h2>
            <div className="header-actions">
              {/* Filter Dropdown */}
              <div className="filter-dropdown-container" ref={filterDropdownRef}>
                <button 
                  className={`filter-btn ${activeFilters.length > 0 ? 'has-filters' : ''}`}
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                >
                  <Filter size={18} />
                  Filter
                  {activeFilters.length > 0 && (
                    <span className="filter-count">{activeFilters.length}</span>
                  )}
                  <ChevronDown size={18} className={filterDropdownOpen ? 'rotated' : ''} />
                </button>
                
                {filterDropdownOpen && (
                  <div className="filter-dropdown">
                    <div className="filter-dropdown-header">
                      <span>Filter by type</span>
                      {activeFilters.length > 0 && (
                        <button 
                          className="clear-all-btn"
                          onClick={() => setActiveFilters([])}
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="filter-dropdown-list">
                      {popupTypes.map((popup) => (
                        <label key={popup.id} className="filter-dropdown-item">
                          <input
                            type="checkbox"
                            checked={activeFilters.includes(popup.id)}
                            onChange={() => toggleFilter(popup.id)}
                          />
                          <span className="checkbox-custom"></span>
                          <span>{popup.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button className="theme-btn">
                Theme
                <span className="theme-dot"></span>
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Single Line Visual Filter - Mini Previews */}
        <div className="type-visual-filter-bar">
          {popupTypes.map((popup) => (
            <button
              key={popup.id}
              className={`type-visual-item ${selectedType === popup.id ? 'active' : ''}`}
              onClick={() => handleTopLayoutSelect(popup.id)}
            >
              <div className={`mini-phone mini-${popup.type}`}>
                {popup.type === 'carousel' && (
                  <>
                    <div className="carousel-card-back"></div>
                    <div className="carousel-card-back"></div>
                  </>
                )}
                <div className="mini-popup-shape"></div>
              </div>
              <span className="type-visual-label">{popup.title}</span>
            </button>
          ))}
        </div>

        {/* Popup Cards Grid */}
        <div className="popup-types-grid">
          {displayItems.map((popup) => (
            <div 
              key={popup.templateId || popup.id} 
              className="popup-type-card"
              onClick={() => handleSelect(popup.id, popup.templateId)}
            >
              <div className="card-preview-container">
                <PopupPreview type={popup.type} template={popup.template} />
              </div>
              <div className="card-info">
                <h3 className="card-title">{popup.templateName || popup.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PopupTypeModal
