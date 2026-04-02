import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { ChevronLeft, ChevronUp, ChevronDown, Eye, Settings, MapPin, Clock, Users, Info, Bluetooth, Plus, Trash2, Pencil, Droplet, Square, AlignCenter, ArrowUpDown, FileText, Globe, Route, Hash, Tag, Calendar, Monitor, Crosshair, X } from 'lucide-react'
import './MobileStudio.css'

// Where does the popup appear – Show on options (each can only be used in one condition)
const WHERE_SHOW_ON_OPTIONS = [
  { value: 'url', label: 'URL', description: 'Only the page with a specific URL', Icon: FileText },
  { value: 'domain', label: 'Domain', description: 'All pages that start with the current domain', Icon: Globe },
  { value: 'url-path', label: 'URL path', description: 'Pages with URLs that contain a particular path', Icon: Route },
  { value: 'url-parameter', label: 'URL parameter', description: 'Pages with a specified URL parameter', Icon: MapPin },
  { value: 'url-hash', label: 'URL hash value', description: 'Pages with specified URL hash value', Icon: Hash },
  { value: 'page-tags', label: 'Page tags', description: 'Pages that have the specified page tag', Icon: Tag },
]

// When does the popup start appearing – cause options (each can only be used in one start condition); matches V2 WF_POPUP_WHEN_OPTS
const WHEN_CAUSE_OPTIONS = [
  { value: 'specific-date-range', label: 'Specific date range', description: 'Define a period during which the popup should appear', Icon: Calendar },
  { value: 'something-on-application', label: 'Something on the application', description: 'An event or state that triggers the popup', Icon: Monitor },
  {
    value: 'screen-detection',
    label: 'Screen detection',
    description: 'Show popup when a selected element is detected on screen',
    Icon: Crosshair,
  },
]

// Who does the popup appear to – identify options (each can only be used in one condition)
const WHO_IDENTIFY_OPTIONS = [
  { value: 'enterprise-attributes', label: 'Enterprise Attributes', description: 'Identify the user by enterprise-level attributes' },
  { value: 'user-attributes', label: 'User Attributes', description: 'Identify the user by user-level attributes' },
]

function defaultWhenStartCondition(id = 1) {
  return { id, cause: '', targetLabel: '', targetSelectValue: '', detectionTiming: 'instant' }
}

function normalizeWhenStartConditions(list) {
  if (!list?.length) return [defaultWhenStartCondition(1)]
  return list.map((c, i) => ({
    id: c.id != null ? c.id : Date.now() + i,
    cause: c.cause ?? '',
    targetLabel: c.targetLabel ?? '',
    targetSelectValue: c.targetSelectValue ?? '',
    detectionTiming:
      c.detectionTiming === 'stable-500ms' || c.detectionTiming === 'stable-1000ms'
        ? c.detectionTiming
        : 'instant',
  }))
}

// Food Delivery App Screens
const appScreens = [
  { 
    id: 1, 
    name: 'Home', 
    time: '27 minutes ago', 
    isRecent: true,
    layout: 'food-home',
    headerTitle: 'FoodieExpress',
    accentColor: '#E23744',
    content: {
      greeting: 'Good Evening, John!',
      address: '123 Main Street, Apt 4B',
      categories: [
        { name: 'Pizza', emoji: '🍕' },
        { name: 'Burger', emoji: '🍔' },
        { name: 'Sushi', emoji: '🍣' },
        { name: 'Tacos', emoji: '🌮' }
      ],
      featured: [
        { name: "Mario's Pizza", rating: 4.5, time: '25-30 min', cuisine: 'Italian' },
        { name: 'Burger Barn', rating: 4.3, time: '20-25 min', cuisine: 'American' }
      ]
    }
  },
  { 
    id: 2, 
    name: 'Restaurant', 
    time: '12 hours ago', 
    isRecent: false,
    layout: 'food-restaurant',
    headerTitle: "Mario's Pizza",
    accentColor: '#E23744',
    content: {
      banner: '🍕',
      name: "Mario's Pizza",
      rating: 4.5,
      reviews: 234,
      time: '25-30 min',
      minOrder: '$15',
      menu: [
        { name: 'Margherita Pizza', price: '$12.99', desc: 'Fresh tomatoes, mozzarella, basil' },
        { name: 'Pepperoni Pizza', price: '$14.99', desc: 'Classic pepperoni, cheese blend' },
        { name: 'Garlic Bread', price: '$5.99', desc: 'Crispy with herb butter' }
      ]
    }
  },
  { 
    id: 3, 
    name: 'Cart', 
    time: '12 hours ago', 
    isRecent: false,
    layout: 'food-cart',
    headerTitle: 'Your Cart',
    accentColor: '#E23744',
    content: {
      restaurant: "Mario's Pizza",
      items: [
        { name: 'Margherita Pizza', qty: 1, price: '$12.99' },
        { name: 'Pepperoni Pizza', qty: 2, price: '$29.98' },
        { name: 'Garlic Bread', qty: 1, price: '$5.99' }
      ],
      subtotal: '$48.96',
      delivery: '$2.99',
      total: '$51.95'
    }
  },
  { 
    id: 4, 
    name: 'Order Tracking', 
    time: '12 hours ago', 
    isRecent: false,
    layout: 'food-tracking',
    headerTitle: 'Track Order',
    accentColor: '#E23744',
    content: {
      orderId: '#FE2847',
      status: 'On the way',
      eta: '12 min',
      driver: 'Mike R.',
      steps: [
        { label: 'Order Placed', done: true },
        { label: 'Preparing', done: true },
        { label: 'On the way', done: true, current: true },
        { label: 'Delivered', done: false }
      ]
    }
  },
  { 
    id: 5, 
    name: 'Profile', 
    time: '12 hours ago', 
    isRecent: false,
    layout: 'food-profile',
    headerTitle: 'Account',
    accentColor: '#E23744',
    content: {
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@email.com',
      orders: 47,
      menuItems: [
        { icon: '📍', label: 'Saved Addresses' },
        { icon: '💳', label: 'Payment Methods' },
        { icon: '🎁', label: 'Rewards & Offers' },
        { icon: '⚙️', label: 'Settings' }
      ]
    }
  },
  { 
    id: 6, 
    name: 'Search', 
    time: '12 hours ago', 
    isRecent: false,
    layout: 'food-search',
    headerTitle: 'Search',
    accentColor: '#E23744',
    content: {
      recent: ['Pizza', 'Sushi', 'Thai food'],
      popular: [
        { name: 'Biryani', emoji: '🍛' },
        { name: 'Pasta', emoji: '🍝' },
        { name: 'Salads', emoji: '🥗' },
        { name: 'Ice Cream', emoji: '🍦' },
        { name: 'Coffee', emoji: '☕' },
        { name: 'Desserts', emoji: '🍰' }
      ]
    }
  },
]

// Overlay Templates
const overlayTemplates = [
  {
    id: 1,
    name: 'Template 1',
    theme: 'light',
    layout: 'centered',
    hasCloseButton: true,
    buttons: ['primary'],
    buttonLabel: 'Allright',
    description: 'Single CTA with centered content'
  },
  {
    id: 2,
    name: 'Template 2',
    theme: 'dark',
    layout: 'left',
    hasCloseButton: true,
    buttons: ['secondary', 'primary'],
    buttonLayout: 'horizontal',
    buttonLabel: 'Allright',
    description: 'Two buttons with left-aligned content'
  },
  {
    id: 3,
    name: 'Template 3',
    theme: 'light',
    layout: 'left',
    hasCloseButton: true,
    buttons: ['primary', 'secondary'],
    buttonLayout: 'horizontal',
    buttonLabel: 'Allright',
    description: 'Two buttons left-aligned horizontal'
  },
  {
    id: 4,
    name: 'Template 4',
    theme: 'dark',
    layout: 'centered',
    hasCloseButton: true,
    buttons: ['secondary', 'primary'],
    buttonLayout: 'horizontal',
    buttonLabel: 'Allright',
    description: 'Two buttons centered on dark background'
  }
]

// Fullscreen Templates
const fullscreenTemplates = [
  { id: 1, name: 'Welcome', theme: 'blue', layout: 'centered', buttons: ['primary'], description: 'Welcome screen with single CTA' },
  { id: 2, name: 'Onboarding', theme: 'purple', layout: 'centered', buttons: ['primary', 'secondary'], description: 'Onboarding with skip option' },
  { id: 3, name: 'Feature Tour', theme: 'dark', layout: 'centered', buttons: ['primary'], description: 'Feature highlight screen' },
  { id: 4, name: 'Promotion', theme: 'orange', layout: 'centered', buttons: ['primary', 'secondary'], description: 'Promotional fullscreen' },
]

// Drawer Templates
const drawerTemplates = [
  { id: 1, name: 'Menu', theme: 'light', layout: 'left', buttons: [], description: 'Navigation menu drawer' },
  { id: 2, name: 'Settings', theme: 'light', layout: 'left', buttons: ['primary'], description: 'Settings panel drawer' },
  { id: 3, name: 'Filters', theme: 'light', layout: 'left', buttons: ['primary', 'secondary'], description: 'Filter options drawer' },
  { id: 4, name: 'Details', theme: 'dark', layout: 'left', buttons: ['primary'], description: 'Detail view drawer' },
]

// Bottom Sheet Templates
const bottomsheetTemplates = [
  { id: 1, name: 'Actions', theme: 'light', layout: 'centered', buttons: [], description: 'Action sheet with options' },
  { id: 2, name: 'Confirmation', theme: 'light', layout: 'centered', buttons: ['primary', 'secondary'], description: 'Confirm action sheet' },
  { id: 3, name: 'Info', theme: 'light', layout: 'left', buttons: ['primary'], description: 'Information bottom sheet' },
  { id: 4, name: 'Form', theme: 'light', layout: 'left', buttons: ['primary', 'secondary'], description: 'Input form bottom sheet' },
]

// Carousel Templates
const carouselTemplates = [
  { id: 1, name: 'Onboarding', theme: 'blue', layout: 'centered', buttons: ['primary'], description: 'Onboarding carousel' },
  { id: 2, name: 'Feature Tour', theme: 'purple', layout: 'centered', buttons: ['primary', 'secondary'], description: 'Feature highlights carousel' },
  { id: 3, name: 'Tips', theme: 'light', layout: 'centered', buttons: ['primary'], description: 'Tips and tricks carousel' },
  { id: 4, name: 'Gallery', theme: 'dark', layout: 'centered', buttons: [], description: 'Image gallery carousel' },
]

// Snackbar Templates
const snackbarTemplates = [
  { id: 1, name: 'Info', theme: 'dark', layout: 'left', buttons: [], description: 'Information snackbar' },
  { id: 2, name: 'Success', theme: 'success', layout: 'left', buttons: [], description: 'Success message snackbar' },
  { id: 3, name: 'Warning', theme: 'warning', layout: 'left', buttons: ['secondary'], description: 'Warning with action' },
  { id: 4, name: 'Error', theme: 'error', layout: 'left', buttons: ['secondary'], description: 'Error notification snackbar' },
]

// Banner Templates
const bannerTemplates = [
  { id: 1, name: 'Announcement', theme: 'blue', layout: 'left', buttons: [], description: 'Announcement banner' },
  { id: 2, name: 'Promotion', theme: 'orange', layout: 'left', buttons: ['secondary'], description: 'Promotional banner' },
  { id: 3, name: 'Update', theme: 'purple', layout: 'left', buttons: ['secondary'], description: 'App update banner' },
  { id: 4, name: 'Alert', theme: 'error', layout: 'left', buttons: ['secondary'], description: 'Alert notification banner' },
]

// Get templates by popup type
const getTemplatesByType = (popupType) => {
  switch (popupType) {
    case 'overlay': return overlayTemplates
    case 'fullscreen': return fullscreenTemplates
    case 'drawer': return drawerTemplates
    case 'bottomsheet': return bottomsheetTemplates
    case 'carousel': return carouselTemplates
    case 'snackbar': return snackbarTemplates
    case 'banner': return bannerTemplates
    case 'smarttip':
    case 'beacon':
      return overlayTemplates
    default: return overlayTemplates
  }
}

/** Open configure step with title + defaults when editing an existing dashboard row. */
function getMobileStudioEditInitialState(editItem) {
  if (!editItem || editItem.isFolder) return null
  const name = (editItem.name && String(editItem.name).trim()) || ''
  switch (editItem.type) {
    case 'Popup': {
      const templates = getTemplatesByType('overlay')
      return {
        creationStep: 'configure',
        selectedPopupType: 'overlay',
        selectedTemplate: templates[0]?.id ?? null,
        overlayTitle: name,
        widgetSubtypeId: null,
        isDevicePaired: true,
        latchedElementLabel: null,
        widgetLatchedElementId: null,
      }
    }
    case 'Smart Tip': {
      const templates = getTemplatesByType('smarttip')
      return {
        creationStep: 'configure',
        selectedPopupType: 'smarttip',
        selectedTemplate: templates[0]?.id ?? null,
        overlayTitle: name || 'Smart tip',
        widgetSubtypeId: 'anchored',
        isDevicePaired: true,
        latchedElementLabel: 'Search Bar',
        widgetLatchedElementId: 'search',
      }
    }
    case 'Beacon': {
      const templates = getTemplatesByType('beacon')
      return {
        creationStep: 'configure',
        selectedPopupType: 'beacon',
        selectedTemplate: templates[0]?.id ?? null,
        overlayTitle: name || 'Beacon',
        widgetSubtypeId: 'pulse',
        isDevicePaired: true,
        latchedElementLabel: 'Search Bar',
        widgetLatchedElementId: 'search',
      }
    }
    default:
      return null
  }
}

const MOBILE_STUDIO_SNAPSHOT_V = 1

const MOBILE_EDITOR_DEFAULT_CONTENT = {
  title: 'Enter title here',
  description: 'Consistency is key in design; it builds trust and familiarity with users.',
}

function mobileStudioStaticDefaults() {
  return {
    activeTab: 'design',
    selectedScreen: null,
    isPairing: false,
    appVersion: '',
    widgetAnchorMode: null,
    showWidgetDetailsPanel: false,
    widgetDetailDescription: '',
    widgetDetailTags: '',
    widgetDetailKeywords: '',
    appearanceExpanded: true,
    positionExpanded: false,
    controlsExpanded: false,
    selectedPosition: 'center',
    dontShowAgain: false,
    screenReaderTitle: '',
    paddingUniform: true,
    paddingValue: 28,
    borderRadiusUniform: true,
    borderRadiusValue: 20,
    overlayType: 'dim',
    showTemplateIcon: false,
    whereExpanded: false,
    whenExpanded: false,
    whoExpanded: false,
    whereConditions: [{ id: 1, showOn: '' }],
    whenStartConditions: [defaultWhenStartCondition(1)],
    whoConditions: [{ id: 1, identifyBy: '' }],
    whenFrequencyMode: 'set-number',
    whenFrequencyCount: 1,
    isSelectingIdentifier: false,
    selectedIdentifiers: [],
    isRichTextEditorOpen: false,
    activeEditorField: null,
    actionType: 'primary',
    selectedFlow: 'Start flow',
    editorPosition: { top: 0, left: 0 },
    editorContent: { ...MOBILE_EDITOR_DEFAULT_CONTENT },
  }
}

function MOBILE_STUDIO_DEFAULTS(popupType) {
  const base = mobileStudioStaticDefaults()
  const isPreset = popupType === 'beacon' || popupType === 'smarttip'
  return {
    ...base,
    creationStep: isPreset ? 'choose-widget-subtype' : popupType ? 'choose-template' : 'choose-type',
    selectedPopupType: popupType,
    selectedTemplate: null,
    isDevicePaired: false,
    overlayTitle: '',
    widgetSubtypeId: null,
    latchedElementLabel: null,
    widgetLatchedElementId: null,
  }
}

function getMobileResolvedInitial(editItem, popupType) {
  const snap = editItem?.creationSnapshot
  if (snap?.kind === 'mobile' && snap.v === MOBILE_STUDIO_SNAPSHOT_V) {
    const pt = snap.selectedPopupType ?? null
    const base = MOBILE_STUDIO_DEFAULTS(pt)
    const editorContent = snap.editorContent
      ? { ...base.editorContent, ...snap.editorContent }
      : base.editorContent
    return {
      ...base,
      ...snap,
      editorContent,
      whereConditions: snap.whereConditions?.length ? snap.whereConditions : base.whereConditions,
      whenStartConditions: normalizeWhenStartConditions(
        snap.whenStartConditions?.length ? snap.whenStartConditions : base.whenStartConditions
      ),
      whoConditions: snap.whoConditions?.length ? snap.whoConditions : base.whoConditions,
      whenFrequencyMode: snap.whenFrequencyMode ?? base.whenFrequencyMode,
      whenFrequencyCount:
        snap.whenFrequencyCount != null && snap.whenFrequencyCount >= 1
          ? snap.whenFrequencyCount
          : base.whenFrequencyCount,
      selectedIdentifiers: Array.isArray(snap.selectedIdentifiers) ? snap.selectedIdentifiers : base.selectedIdentifiers,
    }
  }
  const te = getMobileStudioEditInitialState(editItem)
  if (te) {
    const base = MOBILE_STUDIO_DEFAULTS(te.selectedPopupType)
    return {
      ...base,
      ...te,
      editorContent: {
        ...base.editorContent,
        title: te.overlayTitle || base.editorContent.title,
      },
    }
  }
  return MOBILE_STUDIO_DEFAULTS(popupType)
}

function CaptureIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 8V6C4 4.89543 4.89543 4 6 4H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 4H14C15.1046 4 16 4.89543 16 6V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 12V14C16 15.1046 15.1046 16 14 16H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 16H6C4.89543 16 4 15.1046 4 14V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

/** Smart tip rendered on the phone when user taps Add Help Tip (and after anchor pick). */
function SmartTipPhoneOverlay({ variant, title, visible, anchorMetrics = null }) {
  if (!visible) return null
  const text = (title && String(title).trim()) || 'Smart tip'
  const v = variant || 'anchored'
  const ctx = anchorMetrics != null
  const posCenter = ctx
    ? { left: `${anchorMetrics.xPct}%`, top: `${anchorMetrics.yCenterPct}%`, transform: 'translate(-50%, -50%)' }
    : undefined
  const posBelow = ctx
    ? {
        left: `${anchorMetrics.xPct}%`,
        top: `${anchorMetrics.yBelowPct}%`,
        transform: 'translate(-50%, 0)',
        width: 'calc(100% - 16px)',
        maxWidth: 320,
        boxSizing: 'border-box',
      }
    : undefined

  if (v === 'inline') {
    return (
      <div
        className={`ms-smart-tip-overlay ms-smart-tip-overlay--inline${ctx ? ' ms-smart-tip-overlay--contextual' : ''}`}
        style={posBelow}
        role="presentation"
      >
        <div className="ms-smart-tip-inline-bar">
          <span className="ms-smart-tip-inline-text">{text}</span>
        </div>
      </div>
    )
  }

  if (v === 'tooltip') {
    return (
      <div
        className={`ms-smart-tip-overlay ms-smart-tip-overlay--tooltip${ctx ? ' ms-smart-tip-overlay--contextual' : ''}`}
        style={posCenter}
        role="presentation"
      >
        <div className="ms-smart-tip-tooltip-chip">
          <span className="ms-smart-tip-tooltip-text">{text}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`ms-smart-tip-overlay ms-smart-tip-overlay--anchored${ctx ? ' ms-smart-tip-overlay--contextual' : ''}`}
      style={posCenter}
      role="presentation"
    >
      <div className="ms-smart-tip-anchored-stack">
        <span className="ms-smart-tip-anchor-dot" aria-hidden />
        <div className="ms-smart-tip-bubble-card">
          <span className="ms-smart-tip-bubble-title">{text}</span>
        </div>
      </div>
    </div>
  )
}

/** Beacon pulse/dot preview on phone during Add Beacon pick (parity with smart tip overlay). */
function BeaconPhoneOverlay({ variant, visible, anchorMetrics = null }) {
  if (!visible) return null
  const v = variant || 'pulse'
  const ctx = anchorMetrics != null
  const style = ctx
    ? { left: `${anchorMetrics.xPct}%`, top: `${anchorMetrics.yCenterPct}%`, transform: 'translate(-50%, -50%)' }
    : undefined
  return (
    <div
      className={`ms-beacon-overlay${ctx ? ' ms-beacon-overlay--contextual' : ''}`}
      style={style}
      role="presentation"
    >
      <span className={`ms-beacon-preview ms-beacon-preview--${v}`} aria-hidden />
    </div>
  )
}

// Phone Preview Content - renders different layouts based on screen type
function PhonePreviewContent({
  screen,
  isSelectingIdentifier,
  isSelectingWidgetAnchor = false,
  isSelectingVisibilityWhen = false,
  hoveredElement,
  selectedElementIds = [],
  onElementHover,
  onElementSelect,
}) {
  if (!screen) {
    return (
      <div className="empty-preview">
        <div className="empty-icon">🍔</div>
        <p>Select a screen to preview</p>
      </div>
    )
  }

  const { layout, headerTitle, accentColor, content } = screen
  const canPickOnCanvas = isSelectingIdentifier || isSelectingWidgetAnchor || isSelectingVisibilityWhen

  // Helper to create selectable element props
  const selectableProps = (elementId, elementType, elementName) => ({
    className: `${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === elementId ? 'element-hovered' : ''} ${selectedElementIds.includes(elementId) ? 'element-selected' : ''}`,
    onMouseEnter: () => onElementHover?.(elementId),
    onMouseLeave: () => onElementHover?.(null),
    onClick: canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.(elementId, elementType, elementName); } : undefined,
    'data-selectable': canPickOnCanvas ? 'true' : undefined
  })

  return (
    <div className={`phone-preview-wrapper ${canPickOnCanvas ? 'selecting-mode' : ''}`}>
      {/* Food Home Screen */}
      {layout === 'food-home' && (
        <div className="preview-body food-home">
          <div 
            className={`food-header ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'header' ? 'element-hovered' : ''} ${selectedElementIds.includes('header') ? 'element-selected' : ''}`}
            data-ms-anchor-id="header"
            style={{ background: accentColor }}
            onMouseEnter={() => onElementHover?.('header')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('header', 'header', 'Food Header'); } : undefined}
          >
            <div className="location-bar">
              <span className="location-icon">📍</span>
              <div className="location-text">
                <span className="deliver-to">Deliver to</span>
                <span className="address">{content.address}</span>
              </div>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
          <div className="food-content">
            <p 
              className={`greeting ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'greeting' ? 'element-hovered' : ''} ${selectedElementIds.includes('greeting') ? 'element-selected' : ''}`}
              data-ms-anchor-id="greeting"
              onMouseEnter={() => onElementHover?.('greeting')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('greeting', 'text', 'Greeting Text'); } : undefined}
            >
              {content.greeting}
            </p>
            <div 
              className={`search-bar-preview ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'search' ? 'element-hovered' : ''} ${selectedElementIds.includes('search') ? 'element-selected' : ''}`}
              data-ms-anchor-id="search"
              onMouseEnter={() => onElementHover?.('search')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('search', 'input', 'Search Bar'); } : undefined}
            >
              <span>🔍</span>
              <span className="search-placeholder">Search for dishes, restaurants...</span>
            </div>
            <div className="categories-row">
              {content.categories.map((cat, i) => (
                <div 
                  key={i} 
                  className={`category-item ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === `cat-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`cat-${i}`) ? 'element-selected' : ''}`}
                  data-ms-anchor-id={`cat-${i}`}
                  onMouseEnter={() => onElementHover?.(`cat-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.(`cat-${i}`, 'category', cat.name); } : undefined}
                >
                  <span className="cat-emoji">{cat.emoji}</span>
                  <span className="cat-name">{cat.name}</span>
                </div>
              ))}
            </div>
            <p className="section-label">Popular near you</p>
            <div className="restaurant-list">
              {content.featured.map((rest, i) => (
                <div 
                  key={i} 
                  className={`restaurant-card ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === `rest-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`rest-${i}`) ? 'element-selected' : ''}`}
                  data-ms-anchor-id={`rest-${i}`}
                  onMouseEnter={() => onElementHover?.(`rest-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.(`rest-${i}`, 'card', rest.name); } : undefined}
                >
                  <div className="rest-image">🍽️</div>
                  <div className="rest-info">
                    <span className="rest-name">{rest.name}</span>
                    <span className="rest-cuisine">{rest.cuisine}</span>
                    <div className="rest-meta">
                      <span className="rest-rating">⭐ {rest.rating}</span>
                      <span className="rest-time">• {rest.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Detail Screen */}
      {layout === 'food-restaurant' && (
        <div className="preview-body food-restaurant">
          <div 
            className={`rest-banner ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'banner' ? 'element-hovered' : ''} ${selectedElementIds.includes('banner') ? 'element-selected' : ''}`}
            data-ms-anchor-id="banner"
            style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #ff6b7a 100%)` }}
            onMouseEnter={() => onElementHover?.('banner')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('banner', 'banner', 'Restaurant Banner'); } : undefined}
          >
            <span className="banner-emoji">{content.banner}</span>
          </div>
          <div className="rest-detail-content">
            <h3 
              className={`rest-detail-name ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'rest-name' ? 'element-hovered' : ''} ${selectedElementIds.includes('rest-name') ? 'element-selected' : ''}`}
              data-ms-anchor-id="rest-name"
              onMouseEnter={() => onElementHover?.('rest-name')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('rest-name', 'text', 'Restaurant Name'); } : undefined}
            >
              {content.name}
            </h3>
            <div className="rest-detail-meta">
              <span>⭐ {content.rating} ({content.reviews})</span>
              <span>• {content.time}</span>
              <span>• Min ${content.minOrder}</span>
            </div>
            <div className="menu-section">
              <p className="menu-title">Menu</p>
              {content.menu.map((item, i) => (
                <div 
                  key={i} 
                  className={`menu-item-card ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === `menu-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`menu-${i}`) ? 'element-selected' : ''}`}
                  data-ms-anchor-id={`menu-${i}`}
                  onMouseEnter={() => onElementHover?.(`menu-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.(`menu-${i}`, 'card', item.name); } : undefined}
                >
                  <div className="menu-item-info">
                    <span className="menu-item-name">{item.name}</span>
                    <span className="menu-item-desc">{item.desc}</span>
                    <span className="menu-item-price">{item.price}</span>
                  </div>
                  <button className="add-btn" style={{ background: accentColor }}>+</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart Screen */}
      {layout === 'food-cart' && (
        <div className="preview-body food-cart">
          <div 
            className={`cart-header-bar ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'cart-header' ? 'element-hovered' : ''} ${selectedElementIds.includes('cart-header') ? 'element-selected' : ''}`}
            data-ms-anchor-id="cart-header"
            style={{ background: accentColor }}
            onMouseEnter={() => onElementHover?.('cart-header')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('cart-header', 'header', 'Cart Header'); } : undefined}
          >
            <span className="cart-title">{headerTitle}</span>
          </div>
          <div className="cart-content">
            <div className="cart-restaurant">
              <span>🍕</span>
              <span>{content.restaurant}</span>
            </div>
            <div className="cart-items">
              {content.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`cart-item ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === `cart-item-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`cart-item-${i}`) ? 'element-selected' : ''}`}
                  data-ms-anchor-id={`cart-item-${i}`}
                  onMouseEnter={() => onElementHover?.(`cart-item-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.(`cart-item-${i}`, 'item', item.name); } : undefined}
                >
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-qty">Qty: {item.qty}</span>
                  </div>
                  <span className="cart-item-price">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{content.subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{content.delivery}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{content.total}</span>
              </div>
            </div>
            <button 
              className={`checkout-btn ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'checkout-btn' ? 'element-hovered' : ''} ${selectedElementIds.includes('checkout-btn') ? 'element-selected' : ''}`}
              data-ms-anchor-id="checkout-btn"
              style={{ background: accentColor }}
              onMouseEnter={() => onElementHover?.('checkout-btn')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('checkout-btn', 'button', 'Place Order Button'); } : undefined}
            >
              Place Order • {content.total}
            </button>
          </div>
        </div>
      )}

      {/* Order Tracking Screen */}
      {layout === 'food-tracking' && (
        <div className="preview-body food-tracking">
          <div 
            className={`tracking-header ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'tracking-header' ? 'element-hovered' : ''} ${selectedElementIds.includes('tracking-header') ? 'element-selected' : ''}`}
            data-ms-anchor-id="tracking-header"
            style={{ background: accentColor }}
            onMouseEnter={() => onElementHover?.('tracking-header')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('tracking-header', 'header', 'Tracking Header'); } : undefined}
          >
            <span className="order-id">{content.orderId}</span>
            <span className="eta-badge">{content.eta} away</span>
          </div>
          <div className="tracking-content">
            <div 
              className={`tracking-map ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'tracking-map' ? 'element-hovered' : ''} ${selectedElementIds.includes('tracking-map') ? 'element-selected' : ''}`}
              data-ms-anchor-id="tracking-map"
              onMouseEnter={() => onElementHover?.('tracking-map')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('tracking-map', 'map', 'Tracking Map'); } : undefined}
            >
              <div className="map-placeholder">
                <span className="map-icon">🗺️</span>
                <div className="delivery-indicator">
                  <span className="bike-icon">🛵</span>
                </div>
              </div>
            </div>
            <div 
              className={`tracking-status ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'tracking-status' ? 'element-hovered' : ''} ${selectedElementIds.includes('tracking-status') ? 'element-selected' : ''}`}
              data-ms-anchor-id="tracking-status"
              onMouseEnter={() => onElementHover?.('tracking-status')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('tracking-status', 'text', 'Order Status'); } : undefined}
            >
              <p className="status-text">{content.status}</p>
              <p className="driver-info">Your rider: {content.driver}</p>
            </div>
            <div className="tracking-steps">
              {content.steps.map((step, i) => (
                <div 
                  key={i} 
                  className={`track-step ${step.done ? 'done' : ''} ${step.current ? 'current' : ''} ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === `step-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`step-${i}`) ? 'element-selected' : ''}`}
                  data-ms-anchor-id={`step-${i}`}
                  onMouseEnter={() => onElementHover?.(`step-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.(`step-${i}`, 'step', step.label); } : undefined}
                >
                  <div className="step-dot" style={{ background: step.done ? accentColor : '#ddd' }}></div>
                  <span className="step-label">{step.label}</span>
                  {i < content.steps.length - 1 && (
                    <div className="step-line" style={{ background: step.done ? accentColor : '#ddd' }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Screen */}
      {layout === 'food-profile' && (
        <div className="preview-body food-profile">
          <div 
            className={`profile-banner ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'profile-banner' ? 'element-hovered' : ''} ${selectedElementIds.includes('profile-banner') ? 'element-selected' : ''}`}
            data-ms-anchor-id="profile-banner"
            style={{ background: accentColor }}
            onMouseEnter={() => onElementHover?.('profile-banner')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('profile-banner', 'banner', 'Profile Banner'); } : undefined}
          >
            <div className="profile-avatar-large">
              {content.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="profile-name-large">{content.name}</span>
            <span className="profile-orders">{content.orders} orders placed</span>
          </div>
          <div className="profile-content">
            <div 
              className={`profile-info-card ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'profile-info' ? 'element-hovered' : ''} ${selectedElementIds.includes('profile-info') ? 'element-selected' : ''}`}
              data-ms-anchor-id="profile-info"
              onMouseEnter={() => onElementHover?.('profile-info')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('profile-info', 'card', 'Profile Info Card'); } : undefined}
            >
              <div className="info-row">
                <span className="info-icon">📱</span>
                <span>{content.phone}</span>
              </div>
              <div className="info-row">
                <span className="info-icon">✉️</span>
                <span>{content.email}</span>
              </div>
            </div>
            <div className="profile-menu-list">
              {content.menuItems.map((item, i) => (
                <div 
                  key={i} 
                  className={`profile-menu-item ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === `profile-menu-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`profile-menu-${i}`) ? 'element-selected' : ''}`}
                  data-ms-anchor-id={`profile-menu-${i}`}
                  onMouseEnter={() => onElementHover?.(`profile-menu-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.(`profile-menu-${i}`, 'menu-item', item.label); } : undefined}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                  <span className="menu-arrow">›</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Screen */}
      {layout === 'food-search' && (
        <div className="preview-body food-search">
          <div 
            className={`search-header ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === 'search-header' ? 'element-hovered' : ''} ${selectedElementIds.includes('search-header') ? 'element-selected' : ''}`}
            data-ms-anchor-id="search-header"
            style={{ background: accentColor }}
            onMouseEnter={() => onElementHover?.('search-header')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.('search-header', 'header', 'Search Header'); } : undefined}
          >
            <div className="search-input-container">
              <span>🔍</span>
              <input type="text" placeholder="Search for food..." readOnly />
            </div>
          </div>
          <div className="search-content">
            <div className="recent-searches">
              <p className="search-section-title">Recent Searches</p>
              <div className="recent-tags">
                {content.recent.map((term, i) => (
                  <span 
                    key={i} 
                    className={`recent-tag ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === `recent-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`recent-${i}`) ? 'element-selected' : ''}`}
                    data-ms-anchor-id={`recent-${i}`}
                    onMouseEnter={() => onElementHover?.(`recent-${i}`)}
                    onMouseLeave={() => onElementHover?.(null)}
                    onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.(`recent-${i}`, 'tag', term); } : undefined}
                  >
                    🕐 {term}
                  </span>
                ))}
              </div>
            </div>
            <div className="popular-categories">
              <p className="search-section-title">Popular Categories</p>
              <div className="popular-grid">
                {content.popular.map((cat, i) => (
                  <div 
                    key={i} 
                    className={`popular-item ${canPickOnCanvas ? 'selectable-element' : ''} ${hoveredElement === `popular-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`popular-${i}`) ? 'element-selected' : ''}`}
                    data-ms-anchor-id={`popular-${i}`}
                    style={{ borderColor: accentColor }}
                    onMouseEnter={() => onElementHover?.(`popular-${i}`)}
                    onMouseLeave={() => onElementHover?.(null)}
                    onClick={canPickOnCanvas ? (e) => { e.stopPropagation(); onElementSelect?.(`popular-${i}`, 'category', cat.name); } : undefined}
                  >
                    <span className="popular-emoji">{cat.emoji}</span>
                    <span className="popular-name">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mini preview for the screen cards - Food Delivery App
function MiniScreenPreview({ screen }) {
  const { layout, accentColor } = screen

  return (
    <div className="mini-preview">
      {/* Mini Home Screen */}
      {layout === 'food-home' && (
        <>
          <div className="mini-header" style={{ background: accentColor }}>
            <div className="mini-location-dot"></div>
          </div>
          <div className="mini-body">
            <div className="mini-search-bar"></div>
            <div className="mini-categories">
              <div className="mini-cat-item">🍕</div>
              <div className="mini-cat-item">🍔</div>
              <div className="mini-cat-item">🍣</div>
              <div className="mini-cat-item">🌮</div>
            </div>
            <div className="mini-rest-card">
              <div className="mini-rest-img" style={{ background: '#ffeee0' }}>🍽️</div>
              <div className="mini-rest-lines">
                <div className="mini-line"></div>
                <div className="mini-line short"></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mini Restaurant Screen */}
      {layout === 'food-restaurant' && (
        <>
          <div className="mini-banner" style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #ff6b7a 100%)` }}>
            <span className="mini-emoji">🍕</span>
          </div>
          <div className="mini-body">
            <div className="mini-line"></div>
            <div className="mini-line short"></div>
            <div className="mini-menu-items">
              <div className="mini-menu-row">
                <div className="mini-menu-text"></div>
                <div className="mini-add-btn" style={{ background: accentColor }}></div>
              </div>
              <div className="mini-menu-row">
                <div className="mini-menu-text"></div>
                <div className="mini-add-btn" style={{ background: accentColor }}></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mini Cart Screen */}
      {layout === 'food-cart' && (
        <>
          <div className="mini-header" style={{ background: accentColor }}></div>
          <div className="mini-body">
            <div className="mini-cart-items">
              <div className="mini-cart-row">
                <div className="mini-line"></div>
                <div className="mini-price"></div>
              </div>
              <div className="mini-cart-row">
                <div className="mini-line"></div>
                <div className="mini-price"></div>
              </div>
            </div>
            <div className="mini-divider"></div>
            <div className="mini-total-row">
              <div className="mini-line short"></div>
              <div className="mini-price"></div>
            </div>
            <div className="mini-checkout-btn" style={{ background: accentColor }}></div>
          </div>
        </>
      )}

      {/* Mini Tracking Screen */}
      {layout === 'food-tracking' && (
        <>
          <div className="mini-header" style={{ background: accentColor }}>
            <div className="mini-eta-badge"></div>
          </div>
          <div className="mini-body">
            <div className="mini-map">
              <span className="mini-map-emoji">🗺️</span>
              <span className="mini-bike">🛵</span>
            </div>
            <div className="mini-tracking-steps">
              <div className="mini-step done" style={{ background: accentColor }}></div>
              <div className="mini-step-line done" style={{ background: accentColor }}></div>
              <div className="mini-step done" style={{ background: accentColor }}></div>
              <div className="mini-step-line done" style={{ background: accentColor }}></div>
              <div className="mini-step current" style={{ borderColor: accentColor }}></div>
              <div className="mini-step-line"></div>
              <div className="mini-step"></div>
            </div>
          </div>
        </>
      )}

      {/* Mini Profile Screen */}
      {layout === 'food-profile' && (
        <>
          <div className="mini-profile-banner" style={{ background: accentColor }}>
            <div className="mini-avatar-circle"></div>
          </div>
          <div className="mini-body">
            <div className="mini-info-card">
              <div className="mini-line"></div>
              <div className="mini-line short"></div>
            </div>
            <div className="mini-menu-items">
              <div className="mini-menu-item"></div>
              <div className="mini-menu-item"></div>
              <div className="mini-menu-item"></div>
            </div>
          </div>
        </>
      )}

      {/* Mini Search Screen */}
      {layout === 'food-search' && (
        <>
          <div className="mini-header" style={{ background: accentColor }}>
            <div className="mini-search-input"></div>
          </div>
          <div className="mini-body">
            <div className="mini-section-title"></div>
            <div className="mini-tags">
              <div className="mini-tag"></div>
              <div className="mini-tag"></div>
            </div>
            <div className="mini-section-title"></div>
            <div className="mini-popular-grid">
              <div className="mini-popular-item">🍛</div>
              <div className="mini-popular-item">🍝</div>
              <div className="mini-popular-item">🥗</div>
              <div className="mini-popular-item">🍦</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Generate random identifier name
function generateIdentifierName() {
  const prefixes = ['btn', 'txt', 'img', 'card', 'header', 'input', 'label', 'icon']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}_${suffix}`
}

// Popup types for selection
const POPUP_TYPES = [
  { id: 'overlay', label: 'Overlay', description: 'A modal dialog that appears in the center' },
  { id: 'fullscreen', label: 'Fullscreen', description: 'Takes up the entire screen' },
  { id: 'drawer', label: 'Drawer', description: 'Slides in from the side' },
  { id: 'bottomsheet', label: 'Bottom Sheet', description: 'Slides up from the bottom' },
  { id: 'carousel', label: 'Carousel', description: 'Swipeable content cards' },
  { id: 'snackbar', label: 'Snackbar', description: 'Brief message at the bottom' },
  { id: 'banner', label: 'Banner', description: 'Notification at top or bottom' },
]

/** Smart Tip / Beacon subtype grids — parity with V2 `WF_WIDGET_TYPE_CATALOG` (studio-overlay-v2.js). */
const SMART_TIP_WIDGET_TYPES = [
  { id: 'anchored', label: 'Anchored tip', layout: 'center' },
  { id: 'inline', label: 'Inline tip', layout: 'banner' },
  { id: 'tooltip', label: 'Tooltip', layout: 'snackbar' },
]

const BEACON_WIDGET_TYPES = [
  { id: 'pulse', label: 'Pulse', layout: 'center' },
  { id: 'ring', label: 'Ring', layout: 'fullscreen' },
  { id: 'dot', label: 'Dot', layout: 'snackbar' },
  { id: 'badge', label: 'Badge', layout: 'banner' },
  { id: 'spotlight', label: 'Spotlight', layout: 'carousel' },
  { id: 'nudge', label: 'Nudge', layout: 'drawer' },
]

function MobileStudio({ onClose, onSave, popupType = null, editItem = null }) {
  const init = getMobileResolvedInitial(editItem, popupType)

  const [creationStep, setCreationStep] = useState(init.creationStep)
  const [selectedPopupType, setSelectedPopupType] = useState(init.selectedPopupType)
  const [activeTab, setActiveTab] = useState(init.activeTab)
  const [selectedScreen, setSelectedScreen] = useState(init.selectedScreen)
  const [isDevicePaired, setIsDevicePaired] = useState(init.isDevicePaired)
  const [isPairing, setIsPairing] = useState(init.isPairing)
  const [appVersion, setAppVersion] = useState(init.appVersion)
  const [overlayTitle, setOverlayTitle] = useState(init.overlayTitle)
  const [snackbarMessage, setSnackbarMessage] = useState(null)

  /** Smart Tip / Beacon anchor panel (V2 `showSmartTipAnchorPanel` / `showBeaconAnchorPanel`). */
  const [widgetSubtypeId, setWidgetSubtypeId] = useState(init.widgetSubtypeId)
  const [widgetAnchorMode, setWidgetAnchorMode] = useState(null) // null | 'smarttip' | 'beacon'
  const [latchedElementLabel, setLatchedElementLabel] = useState(init.latchedElementLabel)
  /** Stable mock element id for widget anchor (beacon / smart tip) — drives contextual preview position. */
  const [widgetLatchedElementId, setWidgetLatchedElementId] = useState(init.widgetLatchedElementId)
  const [widgetAnchorMetrics, setWidgetAnchorMetrics] = useState(null)
  const phonePreviewStackRef = useRef(null)
  const [showWidgetDetailsPanel, setShowWidgetDetailsPanel] = useState(init.showWidgetDetailsPanel)
  const [widgetDetailDescription, setWidgetDetailDescription] = useState(init.widgetDetailDescription)
  const [widgetDetailTags, setWidgetDetailTags] = useState(init.widgetDetailTags)
  const [widgetDetailKeywords, setWidgetDetailKeywords] = useState(init.widgetDetailKeywords)

  // Customizations tab accordions
  const [appearanceExpanded, setAppearanceExpanded] = useState(init.appearanceExpanded)
  const [positionExpanded, setPositionExpanded] = useState(init.positionExpanded)
  const [controlsExpanded, setControlsExpanded] = useState(init.controlsExpanded)

  // Position state
  const [selectedPosition, setSelectedPosition] = useState(init.selectedPosition)

  // Controls state
  const [dontShowAgain, setDontShowAgain] = useState(init.dontShowAgain)
  const [screenReaderTitle, setScreenReaderTitle] = useState(init.screenReaderTitle)

  // Appearance options state
  const [paddingUniform, setPaddingUniform] = useState(init.paddingUniform)
  const [paddingValue, setPaddingValue] = useState(init.paddingValue)
  const [borderRadiusUniform, setBorderRadiusUniform] = useState(init.borderRadiusUniform)
  const [borderRadiusValue, setBorderRadiusValue] = useState(init.borderRadiusValue)
  const [overlayType, setOverlayType] = useState(init.overlayType)

  // Template icon visibility
  const [showTemplateIcon, setShowTemplateIcon] = useState(init.showTemplateIcon)

  // Visibility rules sub-accordions
  const [whereExpanded, setWhereExpanded] = useState(init.whereExpanded)
  const [whenExpanded, setWhenExpanded] = useState(init.whenExpanded)
  const [whoExpanded, setWhoExpanded] = useState(init.whoExpanded)
  const [whereConditions, setWhereConditions] = useState(init.whereConditions)
  const [openWhereDropdownId, setOpenWhereDropdownId] = useState(null)
  const [whenStartConditions, setWhenStartConditions] = useState(
    () => normalizeWhenStartConditions(init.whenStartConditions)
  )
  const [openWhenDropdownId, setOpenWhenDropdownId] = useState(null)
  const [whenFrequencyMode, setWhenFrequencyMode] = useState(init.whenFrequencyMode || 'set-number')
  const [whenFrequencyCount, setWhenFrequencyCount] = useState(
    init.whenFrequencyCount != null && init.whenFrequencyCount >= 1 ? init.whenFrequencyCount : 1
  )
  const [visibilityWhenPickConditionId, setVisibilityWhenPickConditionId] = useState(null)
  const [whoConditions, setWhoConditions] = useState(init.whoConditions)
  const [openWhoDropdownId, setOpenWhoDropdownId] = useState(null)

  const [isSelectingIdentifier, setIsSelectingIdentifier] = useState(init.isSelectingIdentifier)
  const [selectedIdentifiers, setSelectedIdentifiers] = useState(init.selectedIdentifiers)
  const [hoveredElement, setHoveredElement] = useState(null)

  const [selectedTemplate, setSelectedTemplate] = useState(init.selectedTemplate)

  const [isRichTextEditorOpen, setIsRichTextEditorOpen] = useState(init.isRichTextEditorOpen)
  const [editorContent, setEditorContent] = useState(init.editorContent)
  const [activeEditorField, setActiveEditorField] = useState(init.activeEditorField)
  const [actionType, setActionType] = useState(init.actionType)
  const [selectedFlow, setSelectedFlow] = useState(init.selectedFlow)
  const [editorPosition, setEditorPosition] = useState(init.editorPosition)

  const buildMobileSnapshot = () => ({
    kind: 'mobile',
    v: MOBILE_STUDIO_SNAPSHOT_V,
    creationStep,
    activeTab,
    selectedPopupType,
    selectedTemplate,
    overlayTitle,
    editorContent,
    widgetSubtypeId,
    latchedElementLabel,
    widgetLatchedElementId,
    widgetDetailDescription,
    widgetDetailTags,
    widgetDetailKeywords,
    isDevicePaired,
    selectedScreen,
    dontShowAgain,
    positionExpanded,
    selectedPosition,
    whereExpanded,
    whenExpanded,
    whoExpanded,
    whereConditions,
    whenStartConditions,
    whoConditions,
    whenFrequencyMode,
    whenFrequencyCount,
    appearanceExpanded,
    controlsExpanded,
    paddingUniform,
    paddingValue,
    borderRadiusUniform,
    borderRadiusValue,
    overlayType,
    showTemplateIcon,
    screenReaderTitle,
    selectedIdentifiers,
    appVersion,
    showWidgetDetailsPanel,
    isPairing,
    isSelectingIdentifier,
    selectedFlow,
    actionType,
  })

  // Get display name based on content type
  const getContentTypeName = (type) => {
    const typeNames = {
      'overlay': 'Overlay',
      'fullscreen': 'Fullscreen',
      'drawer': 'Drawer',
      'bottomsheet': 'Bottom Sheet',
      'carousel': 'Carousel',
      'snackbar': 'Snackbar',
      'banner': 'Banner',
      'beacon': 'Beacon',
      'smarttip': 'Smart Tip'
    }
    return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }
  
  const popupTypeName = getContentTypeName(selectedPopupType || 'overlay')
  const isPopupType = !['beacon', 'smarttip'].includes(selectedPopupType)
  const isWidgetFlow = selectedPopupType === 'beacon' || selectedPopupType === 'smarttip'
  const positionToggleLabel =
    selectedPopupType === 'smarttip'
      ? 'Position Help Tip'
      : selectedPopupType === 'beacon'
        ? 'Position Beacon'
        : 'Position Popup'
  const positionToggleTitle =
    selectedPopupType === 'smarttip'
      ? 'Position the help tip on screen'
      : selectedPopupType === 'beacon'
        ? 'Position the beacon on screen'
        : 'Position the popup on screen'
  const placeholderTitle = isWidgetFlow ? `Untitled ${popupTypeName}` : 'Untitled Popup'

  const handleSelectWidgetSubtype = (subtypeId) => {
    setWidgetSubtypeId(subtypeId)
    const defaultText = selectedPopupType === 'smarttip' ? 'testing smart tips' : 'testing beacon'
    setOverlayTitle((prev) => (prev && prev.trim() ? prev : defaultText))
    setLatchedElementLabel(null)
    setWidgetLatchedElementId(null)
    setShowWidgetDetailsPanel(false)
    setCreationStep('anchor-panel')
  }

  const handleWidgetAnchorBackToSubtypeGrid = () => {
    setShowWidgetDetailsPanel(false)
    setWidgetAnchorMode(null)
    setHoveredElement(null)
    setWidgetLatchedElementId(null)
    setLatchedElementLabel(null)
    setCreationStep('choose-widget-subtype')
  }

  const handleStartWidgetAnchorPick = () => {
    if (!isDevicePaired) {
      setSnackbarMessage('Pair your device to select an element on screen')
      return
    }
    setWidgetAnchorMode(selectedPopupType === 'smarttip' ? 'smarttip' : 'beacon')
    setHoveredElement(null)
  }

  const cancelWidgetAnchorPick = () => {
    setWidgetAnchorMode(null)
    setHoveredElement(null)
  }

  const closeWidgetDetailsSubpanel = () => setShowWidgetDetailsPanel(false)

  const handleSaveWidgetFromAnchorPanel = () => {
    const name = overlayTitle.trim()
    if (!name) {
      setSnackbarMessage('Enter a title in the header')
      return
    }
    const type = selectedPopupType === 'smarttip' ? 'Smart Tip' : 'Beacon'
    if (typeof onSave === 'function') {
      onSave({
        name,
        type,
        id: editItem?.id,
        creationSnapshot: buildMobileSnapshot(),
      })
    }
    onClose()
  }
  
  // Handle popup type selection
  const handleSelectPopupType = (typeId) => {
    setSelectedPopupType(typeId)
    setCreationStep('choose-template')
  }
  
  // Handle template selection
  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId)
    setCreationStep('configure')
  }
  
  // Handle back navigation in creation flow
  const handleCreationBack = () => {
    if (showWidgetDetailsPanel) {
      setShowWidgetDetailsPanel(false)
      return
    }
    if (creationStep === 'configure') {
      if (isWidgetFlow) {
        setCreationStep('anchor-panel')
        setSelectedTemplate(null)
      } else {
        setCreationStep('choose-template')
        setSelectedTemplate(null)
      }
    } else if (creationStep === 'choose-template') {
      setCreationStep('choose-type')
      setSelectedPopupType(null)
    } else if (creationStep === 'anchor-panel') {
      handleWidgetAnchorBackToSubtypeGrid()
    } else if (creationStep === 'choose-widget-subtype') {
      onClose()
    } else {
      onClose()
    }
  }
  
  // Find the currently selected screen data
  const currentScreen = appScreens.find(s => s.id === selectedScreen)
  
  // Demo screen for paired device (first screen as default)
  const pairedDeviceScreen = isDevicePaired ? appScreens[0] : null

  // Auto-select first template when switching to design/customizations tab
  useEffect(() => {
    if (
      creationStep === 'configure' &&
      activeTab === 'design' &&
      !selectedTemplate &&
      overlayTemplates.length > 0
    ) {
      setSelectedTemplate(overlayTemplates[0].id)
    }
  }, [activeTab, creationStep, selectedTemplate])

  // Close "Show on" dropdown when clicking outside
  useEffect(() => {
    if (openWhereDropdownId === null) return
    const handleClickOutside = (e) => {
      if (e.target.closest('.where-showon-dropdown') == null) {
        setOpenWhereDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openWhereDropdownId])

  // Close "When" cause dropdown when clicking outside
  useEffect(() => {
    if (openWhenDropdownId === null) return
    const handleClickOutside = (e) => {
      if (e.target.closest('.when-cause-dropdown') == null) {
        setOpenWhenDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openWhenDropdownId])

  // Close "Who" identify dropdown when clicking outside
  useEffect(() => {
    if (openWhoDropdownId === null) return
    const handleClickOutside = (e) => {
      if (e.target.closest('.who-identify-dropdown') == null) {
        setOpenWhoDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openWhoDropdownId])

  useEffect(() => {
    if (!snackbarMessage) return
    const t = setTimeout(() => setSnackbarMessage(null), 5000)
    return () => clearTimeout(t)
  }, [snackbarMessage])

  /** Map beacon / smart-tip preview to the hovered (pick mode) or latched mock element in the phone stack. */
  useLayoutEffect(() => {
    const root = phonePreviewStackRef.current
    const pickTarget =
      (widgetAnchorMode && hoveredElement) || widgetLatchedElementId || null
    if (!root || !pickTarget || !isDevicePaired || !isWidgetFlow) {
      setWidgetAnchorMetrics(null)
      return
    }
    const measure = () => {
      const el = root.querySelector(`[data-ms-anchor-id="${pickTarget}"]`)
      if (!el) {
        setWidgetAnchorMetrics(null)
        return
      }
      const stackRect = root.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      if (stackRect.width <= 0 || stackRect.height <= 0) {
        setWidgetAnchorMetrics(null)
        return
      }
      const xPct = ((elRect.left - stackRect.left + elRect.width / 2) / stackRect.width) * 100
      const yCenterPct = ((elRect.top - stackRect.top + elRect.height / 2) / stackRect.height) * 100
      const yBelowPct = Math.min(
        98,
        ((elRect.bottom - stackRect.top + 8) / stackRect.height) * 100
      )
      setWidgetAnchorMetrics({ xPct, yCenterPct, yBelowPct })
    }
    measure()
    let ro = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure)
      ro.observe(root)
    }
    window.addEventListener('resize', measure)
    const t = window.setTimeout(measure, 60)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', measure)
      window.clearTimeout(t)
    }
  }, [
    widgetAnchorMode,
    hoveredElement,
    widgetLatchedElementId,
    isDevicePaired,
    isWidgetFlow,
    pairedDeviceScreen?.id,
    creationStep,
    selectedPopupType,
  ])
  
  // Handle pair device click with 2 second loader
  const handlePairDevice = () => {
    setIsPairing(true)
    setTimeout(() => {
      setIsPairing(false)
      setIsDevicePaired(true)
      setSelectedScreen(appScreens[0]?.id || null)
    }, 2000)
  }

  // Handle Add Identifier button click
  const handleAddIdentifierClick = () => {
    if (!selectedScreen) {
      alert('Please select an app screen first')
      return
    }
    setIsSelectingIdentifier(true)
    setIdentifiersExpanded(true)
  }

  // Handle element selection in the phone preview
  const handleElementSelect = (elementId, elementType, elementName) => {
    if (visibilityWhenPickConditionId != null) {
      const label = elementName || elementId
      setWhenStartConditions((prev) =>
        prev.map((c) => (c.id === visibilityWhenPickConditionId ? { ...c, targetLabel: label } : c))
      )
      setVisibilityWhenPickConditionId(null)
      setHoveredElement(null)
      setSnackbarMessage('Element selected for screen detection')
      return
    }
    if (widgetAnchorMode) {
      const mode = widgetAnchorMode
      const label = elementName || elementId
      setLatchedElementLabel(label)
      setWidgetLatchedElementId(elementId)
      setWidgetAnchorMode(null)
      setHoveredElement(null)
      setShowWidgetDetailsPanel(false)
      // V2: wf-flow-element-selected smartTipAnchor / beaconAnchor → showPopupConfigPanel()
      const templates = getTemplatesByType(selectedPopupType)
      const firstTpl = templates[0] ?? overlayTemplates[0]
      if (firstTpl) setSelectedTemplate(firstTpl.id)
      setCreationStep('configure')
      setActiveTab('design')
      const titleText = overlayTitle.trim() || (mode === 'smarttip' ? 'Smart tip' : 'Beacon')
      setEditorContent((prev) => ({
        ...prev,
        title: titleText,
        description: mode === 'smarttip' ? `Anchored to ${label}` : `Latched to ${label}`,
      }))
      setSnackbarMessage(
        mode === 'smarttip' ? `Smart tip anchored to ${label}` : `Beacon latched to ${label}`
      )
      return
    }
    if (!isSelectingIdentifier) return
    const newIdentifier = {
      id: Date.now(),
      name: generateIdentifierName(),
      elementId,
      elementType,
      elementName
    }
    setSelectedIdentifiers([...selectedIdentifiers, newIdentifier])
    setHoveredElement(null)
  }
  
  // Get list of selected element IDs
  const selectedElementIds = selectedIdentifiers.map(i => i.elementId)

  // Handle element hover
  const handleElementHover = (elementId) => {
    if (isSelectingIdentifier || widgetAnchorMode || visibilityWhenPickConditionId != null) {
      setHoveredElement(elementId)
    }
  }

  // Remove identifier
  const handleRemoveIdentifier = (id) => {
    setSelectedIdentifiers(selectedIdentifiers.filter(i => i.id !== id))
  }

  return (
    <div className="mobile-studio">
      {/* Phone Preview Area */}
      <div className="studio-preview-area">
        <div className="phone-frame">
          <div className="phone-screen">
            <div className="phone-status-bar">
              <span>9:41</span>
              <div className="status-icons">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.95 3 3 6.95 3 12a9 9 0 0 0 9 9c5.05 0 9-3.95 9-9s-3.95-9-9-9zm4.2 12.78l-1.42 1.42L12 14.41l-2.78 2.79-1.42-1.42L10.59 13l-2.79-2.78 1.42-1.42L12 11.59l2.78-2.79 1.42 1.42L13.41 13l2.79 2.78z" opacity="0"/><path d="M1 9l2 2c2.88-2.88 6.79-4 10.5-3.5 1.9.25 3.72.94 5.25 2 .15.11.3.22.44.33L21 8c-2.91-2.42-6.58-3.73-10.5-3.96C6.46 3.77 3.29 5.5 1 9zm6 6l2 2c1.13-1.13 2.57-1.78 4.09-1.96 1.1-.13 2.22.04 3.25.53l1.63-1.63c-1.41-.88-3.03-1.37-4.73-1.4-2.24-.05-4.39.75-6.24 2.46zM5 11l2 2c1.88-1.88 4.37-2.79 6.87-2.65 1.37.08 2.72.45 3.96 1.1l1.7-1.7c-1.55-.96-3.3-1.57-5.12-1.75C11.17 7.72 7.65 8.65 5 11z"/></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="7" width="18" height="12" rx="2" ry="2" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="20" y="10" width="2" height="6" rx="1" fill="currentColor"/><rect x="4" y="9" width="14" height="8" rx="1" fill="currentColor"/></svg>
              </div>
            </div>
            <div className={`phone-content ${isDevicePaired ? 'device-paired' : ''}`}>
              {isPairing ? (
                // Loading state while pairing
                <div className="phone-pairing-loader">
                  <div className="pairing-spinner"></div>
                  <p className="pairing-text">Pairing with your device...</p>
                </div>
              ) : isDevicePaired ? (
                <div className="phone-preview-stack" ref={phonePreviewStackRef}>
                  <PhonePreviewContent 
                    screen={pairedDeviceScreen} 
                    isSelectingIdentifier={isSelectingIdentifier}
                    isSelectingWidgetAnchor={Boolean(widgetAnchorMode)}
                    isSelectingVisibilityWhen={visibilityWhenPickConditionId != null}
                    hoveredElement={hoveredElement}
                    selectedElementIds={selectedElementIds}
                    onElementHover={handleElementHover}
                    onElementSelect={handleElementSelect}
                  />
                  <SmartTipPhoneOverlay
                    variant={widgetSubtypeId}
                    title={overlayTitle}
                    anchorMetrics={widgetAnchorMetrics}
                    visible={
                      selectedPopupType === 'smarttip' &&
                      creationStep === 'anchor-panel' &&
                      !showWidgetDetailsPanel &&
                      (widgetAnchorMode === 'smarttip' || Boolean(latchedElementLabel))
                    }
                  />
                  <BeaconPhoneOverlay
                    variant={widgetSubtypeId}
                    anchorMetrics={widgetAnchorMetrics}
                    visible={
                      selectedPopupType === 'beacon' &&
                      creationStep === 'anchor-panel' &&
                      !showWidgetDetailsPanel &&
                      (widgetAnchorMode === 'beacon' || Boolean(latchedElementLabel))
                    }
                  />
                  {creationStep === 'configure' && selectedTemplate && selectedPopupType === 'beacon' && (
                    <div className="phone-widget-config-layer" aria-hidden>
                      <BeaconPhoneOverlay
                        variant={widgetSubtypeId}
                        anchorMetrics={widgetAnchorMetrics}
                        visible
                      />
                    </div>
                  )}
                  {creationStep === 'configure' && selectedTemplate && selectedPopupType === 'smarttip' && (
                    <div className="phone-widget-config-layer" aria-hidden>
                      <SmartTipPhoneOverlay
                        variant={widgetSubtypeId || 'anchored'}
                        title={editorContent.title}
                        anchorMetrics={widgetAnchorMetrics}
                        visible
                      />
                    </div>
                  )}
                </div>
              ) : (
                // Pairing UI on phone screen when not paired
                <div className="phone-pair-screen">
                  <div className="pair-illustration-phone">
                    <div className="pair-phone-icon-container">
                      <div className="pair-phone-back"></div>
                      <div className="pair-phone-front"></div>
                      <div className="pair-phone-bluetooth">
                        <Bluetooth size={20} strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                  <p className="pair-phone-text">Pair your mobile app to create content</p>
                  <button 
                    className="pair-phone-cta"
                    onClick={handlePairDevice}
                  >
                    <Bluetooth size={16} />
                    <span>Pair device</span>
                  </button>
                </div>
              )}
            </div>

            {widgetAnchorMode && (
              <div className="widget-anchor-select-hint">
                <span>
                  {widgetAnchorMode === 'smarttip'
                    ? 'Select element to anchor smart tip'
                    : 'Select element to latch beacon'}
                </span>
                <button type="button" className="widget-anchor-select-cancel" onClick={cancelWidgetAnchorPick}>
                  Cancel
                </button>
              </div>
            )}
            
            {/* Popup Preview - Render based on selected popup type */}
            {creationStep === 'configure' && selectedTemplate && (() => {
              if (selectedPopupType === 'beacon' || selectedPopupType === 'smarttip') {
                return null
              }

              const templates = getTemplatesByType(selectedPopupType);
              const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];
              if (!currentTemplate) return null;

              // Render different popup types
              const renderPopupContent = () => (
                <>
                  {/* Close Button */}
                  <button className="overlay-close-btn" onClick={() => setSelectedTemplate(null)}>
                    <svg width="5" height="5" viewBox="0 0 5 5" fill="none">
                      <path d="M3.8 1.2L1.2 3.8M1.2 1.2L3.8 3.8" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {/* Title */}
                  <h4 className={`overlay-title ${currentTemplate?.layout || 'centered'}`}>
                    {editorContent.title}
                  </h4>
                  
                  {/* Description */}
                  <p className={`overlay-desc ${currentTemplate?.layout || 'centered'}`}>
                    {editorContent.description}
                  </p>
                  
                  {/* Buttons */}
                  {currentTemplate?.buttons?.length > 0 && (
                    <div className={`overlay-buttons ${currentTemplate?.layout || 'centered'} ${currentTemplate?.buttonLayout || 'vertical'}`}>
                      {currentTemplate.buttons.map((btnType, i) => (
                        <button key={i} className={`overlay-btn ${btnType} ${currentTemplate?.theme || 'light'}`}>
                          {btnType === 'primary' ? 'Confirm' : 'Cancel'}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );

              // Overlay (centered modal)
              if (selectedPopupType === 'overlay') {
                return (
                  <div className="phone-overlay-container">
                    <div className="phone-scrim"></div>
                    <div className={`phone-popup-overlay ${currentTemplate?.theme || 'light'}`}>
                      {renderPopupContent()}
                    </div>
                  </div>
                );
              }

              // Fullscreen
              if (selectedPopupType === 'fullscreen') {
                return (
                  <div className="phone-overlay-container phone-fullscreen-container">
                    <div className={`phone-popup-fullscreen ${currentTemplate?.theme || 'blue'}`}>
                      {renderPopupContent()}
                    </div>
                  </div>
                );
              }

              // Drawer (from right)
              if (selectedPopupType === 'drawer') {
                return (
                  <div className="phone-overlay-container">
                    <div className="phone-scrim"></div>
                    <div className={`phone-popup-drawer ${currentTemplate?.theme || 'light'}`}>
                      {renderPopupContent()}
                    </div>
                  </div>
                );
              }

              // Bottom Sheet
              if (selectedPopupType === 'bottomsheet') {
                return (
                  <div className="phone-overlay-container">
                    <div className="phone-scrim"></div>
                    <div className={`phone-popup-bottomsheet ${currentTemplate?.theme || 'light'}`}>
                      <div className="bottomsheet-handle"></div>
                      {renderPopupContent()}
                    </div>
                  </div>
                );
              }

              // Carousel
              if (selectedPopupType === 'carousel') {
                return (
                  <div className="phone-overlay-container">
                    <div className="phone-scrim"></div>
                    <div className={`phone-popup-carousel ${currentTemplate?.theme || 'blue'}`}>
                      {renderPopupContent()}
                      <div className="carousel-dots">
                        <span className="carousel-dot active"></span>
                        <span className="carousel-dot"></span>
                        <span className="carousel-dot"></span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Snackbar
              if (selectedPopupType === 'snackbar') {
                return (
                  <div className="phone-overlay-container phone-snackbar-container">
                    <div className={`phone-popup-snackbar ${currentTemplate?.theme || 'dark'}`}>
                      <span className="snackbar-text">{editorContent.title}</span>
                      {currentTemplate?.buttons?.length > 0 && (
                        <button className="snackbar-action">Action</button>
                      )}
                    </div>
                  </div>
                );
              }

              // Banner
              if (selectedPopupType === 'banner') {
                return (
                  <div className="phone-overlay-container phone-banner-container">
                    <div className={`phone-popup-banner ${currentTemplate?.theme || 'blue'}`}>
                      <span className="banner-text">{editorContent.title}</span>
                      {currentTemplate?.buttons?.length > 0 && (
                        <button className="banner-action">View</button>
                      )}
                      <button className="banner-close">×</button>
                    </div>
                  </div>
                );
              }

              // Default fallback (overlay style)
              return (
                <div className="phone-overlay-container">
                  <div className="phone-scrim"></div>
                  <div className={`phone-popup-overlay ${currentTemplate?.theme || 'light'}`}>
                    {renderPopupContent()}
                  </div>
                </div>
              );
            })()}
            
            {/* Rich Text Editor - Overlay positioned near selected element */}
            {isRichTextEditorOpen && activeTab === 'design' && (
              <div 
                className="rich-text-editor-overlay" 
                style={{ 
                  position: 'absolute',
                  top: `${editorPosition.top}px`,
                  left: `${editorPosition.left}px`,
                  zIndex: 1000,
                  pointerEvents: 'auto'
                }}
              >
                <div className="rich-text-editor-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              {/* Editor Header with Close Button */}
              <div className="editor-header-inline">
                <span className="editor-header-title">Edit {activeEditorField === 'title' ? 'Title' : 'Description'}</span>
                <button 
                  className="editor-close-btn-inline"
                  onClick={() => setIsRichTextEditorOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              {/* Action Section */}
              <div className="editor-action-section">
                <button className="editor-add-btn">
                  <Plus size={16} />
                </button>
                <span className="editor-label">Action</span>
                <div className="editor-dropdown">
                  <span className="dropdown-text">{selectedFlow}</span>
                  <ChevronDown size={16} />
                </div>
                <div className="editor-select-flow">
                  <span className="select-flow-text">Select Flow</span>
                  <Pencil size={14} />
                </div>
                <button className="editor-delete-btn">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Type Section */}
              <div className="editor-type-section">
                <span className="editor-label">Type</span>
                <div className="editor-type-buttons">
                  <button 
                    className={`editor-type-btn ${actionType === 'primary' ? 'active' : ''}`}
                    onClick={() => setActionType('primary')}
                  >
                    Primary
                  </button>
                  <button 
                    className={`editor-type-btn ${actionType === 'secondary' ? 'active' : ''}`}
                    onClick={() => setActionType('secondary')}
                  >
                    Secondary
                  </button>
                </div>
                <div className="editor-config-icons">
                  <button className="config-icon-btn" title="Color">
                    <Droplet size={16} />
                  </button>
                  <button className="config-icon-btn" title="Border">
                    <Square size={16} />
                  </button>
                  <button className="config-icon-btn dropdown" title="Alignment">
                    <AlignCenter size={16} />
                    <ChevronDown size={12} />
                  </button>
                  <button className="config-icon-btn dropdown" title="Spacing">
                    <ArrowUpDown size={16} />
                    <ChevronDown size={12} />
                  </button>
                </div>
              </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="studio-panel">
        {/* Content */}
        <div className="studio-content">
          {/* Smart Tip / Beacon: choose subtype (V2 popup type grid) */}
          {creationStep === 'choose-widget-subtype' && isWidgetFlow && (
            <div className="creation-step-content">
              <div className="step-header">
                <h3 className="step-title">
                  Choose {selectedPopupType === 'smarttip' ? 'smart tip' : 'beacon'} type
                </h3>
                <p className="step-description">
                  Select how this {popupTypeName.toLowerCase()} appears on screen
                </p>
              </div>
              <div className="popup-type-grid">
                {(selectedPopupType === 'smarttip' ? SMART_TIP_WIDGET_TYPES : BEACON_WIDGET_TYPES).map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className="popup-type-card"
                    onClick={() => handleSelectWidgetSubtype(type.id)}
                  >
                    <div className="popup-type-preview">
                      <div className={`popup-type-phone popup-type-phone--${type.layout}`}>
                        <div className={`widget-subtype-glyph widget-subtype-glyph--${selectedPopupType} widget-subtype-glyph--${type.id}`} aria-hidden />
                      </div>
                    </div>
                    <span className="popup-type-label">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Smart Tip / Beacon: anchor setup (V2 smart tip / beacon anchor panel) */}
          {creationStep === 'anchor-panel' && isWidgetFlow && (
            <div className="widget-anchor-panel-wrap">
              {showWidgetDetailsPanel ? (
                <>
                  <div className="widget-anchor-l2-toolbar">
                    <button
                      type="button"
                      className="back-button"
                      onClick={closeWidgetDetailsSubpanel}
                      aria-label="Back"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="widget-anchor-l2-title">{popupTypeName} details</span>
                  </div>
                  <div className="widget-anchor-details-form">
                    <div className="widget-anchor-details-row">
                      <label htmlFor="widget-detail-desc">Description (optional)</label>
                      <textarea
                        id="widget-detail-desc"
                        rows={3}
                        className="widget-anchor-details-input"
                        value={widgetDetailDescription}
                        onChange={(e) => setWidgetDetailDescription(e.target.value)}
                      />
                    </div>
                    <div className="widget-anchor-details-row">
                      <label htmlFor="widget-detail-tags">Tags (optional)</label>
                      <input
                        id="widget-detail-tags"
                        type="text"
                        className="widget-anchor-details-input"
                        value={widgetDetailTags}
                        onChange={(e) => setWidgetDetailTags(e.target.value)}
                      />
                    </div>
                    <div className="widget-anchor-details-row">
                      <label htmlFor="widget-detail-keywords">Keywords (optional)</label>
                      <input
                        id="widget-detail-keywords"
                        type="text"
                        className="widget-anchor-details-input"
                        value={widgetDetailKeywords}
                        onChange={(e) => setWidgetDetailKeywords(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="widget-anchor-panel" data-widget-subtype={widgetSubtypeId || undefined}>
                  {latchedElementLabel && (
                    <p className="widget-anchor-latched">
                      {selectedPopupType === 'smarttip' ? 'Anchored to' : 'Latched to'}:{' '}
                      <strong>{latchedElementLabel}</strong>
                    </p>
                  )}
                  <button type="button" className="widget-anchor-details-btn" onClick={() => setShowWidgetDetailsPanel(true)}>
                    Details
                  </button>
                  <button type="button" className="widget-anchor-add-btn" onClick={handleStartWidgetAnchorPick}>
                    <span className="widget-anchor-add-plus" aria-hidden>+</span>
                    <span>{selectedPopupType === 'smarttip' ? 'Add Help Tip' : 'Add Beacon'}</span>
                    <span className="widget-anchor-add-caret" aria-hidden>⌄</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Choose Popup Type */}
          {creationStep === 'choose-type' && !isWidgetFlow && (
            <div className="creation-step-content">
              <div className="step-header">
                <h3 className="step-title">Choose popup type</h3>
                <p className="step-description">Select the type of popup you want to create</p>
              </div>
              <div className="popup-type-grid">
                {POPUP_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className={`popup-type-card ${selectedPopupType === type.id ? 'selected' : ''}`}
                    onClick={() => handleSelectPopupType(type.id)}
                  >
                    <div className="popup-type-preview">
                      <div className={`popup-type-phone popup-type-phone--${type.id}`}>
                        {(type.id === 'overlay' || type.id === 'carousel') && (
                          <div className="popup-type-scrim"></div>
                        )}
                        <div className="popup-type-element">
                          {type.id === 'carousel' && (
                            <>
                              <div className="carousel-card"></div>
                              <div className="carousel-card"></div>
                              <div className="carousel-card"></div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="popup-type-label">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Choose Template */}
          {creationStep === 'choose-template' && (
            <div className="creation-step-content">
              <div className="step-header">
                <div className="step-title-row">
                  <button className="step-back-icon" onClick={handleCreationBack}>
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="step-title">Choose template</h3>
                </div>
                <p className="step-description">Select a template for your {popupTypeName.toLowerCase()}</p>
              </div>
              <div className="template-grid">
                {getTemplatesByType(selectedPopupType).map((template) => (
                  <button
                    key={template.id}
                    className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <div className={`template-preview template-preview--${template.theme}`}>
                      <div className="template-preview-content">
                        <div className="template-preview-title"></div>
                        <div className="template-preview-text"></div>
                        <div className="template-preview-buttons">
                          {template.buttons?.map((btn, i) => (
                            <div key={i} className={`template-preview-btn template-preview-btn--${btn}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="template-label">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Configuration & Visibility Rules */}
          {creationStep === 'configure' && (
            <>
              {/* Tabs inside side panel */}
              <div className="panel-tabs">
                <button 
                  className={`panel-tab ${activeTab === 'design' ? 'active' : ''}`}
                  onClick={() => {
                    if (!selectedTemplate && overlayTemplates.length > 0) {
                      setSelectedTemplate(overlayTemplates[0].id)
                    }
                    setActiveTab('design')
                    setIsSelectingIdentifier(false)
                    setHoveredElement(null)
                    setVisibilityWhenPickConditionId(null)
                  }}
                >
                  Configuration
                </button>
                <button 
                  className={`panel-tab ${activeTab === 'visibility' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('visibility')
                    setIsSelectingIdentifier(false)
                    setHoveredElement(null)
                    setVisibilityWhenPickConditionId(null)
                  }}
                >
                  Visibility Rules
                </button>
              </div>

              {/* Configuration Tab Content - V2 Style */}
              {activeTab === 'design' && (
              <div className="popup-config-body">
                {/* Don't show me again toggle */}
                <div className="config-toggle-row">
                  <span className="config-toggle-label">Don't show me again</span>
                  <label className="config-switch">
                    <input 
                      type="checkbox" 
                      className="config-switch-input" 
                      checked={dontShowAgain}
                      onChange={() => setDontShowAgain(!dontShowAgain)}
                    />
                    <span className="config-switch-track">
                      <span className="config-switch-thumb"></span>
                    </span>
                  </label>
                </div>

                <hr className="config-divider" />

                {/* Position (popup / help tip / beacon) toggle */}
                <div className="config-toggle-row">
                  <span className="config-toggle-label config-toggle-label--with-hint">
                    {positionToggleLabel}
                    <button type="button" className="config-info-btn" title={positionToggleTitle} aria-label="About position">
                      <Info size={14} />
                    </button>
                  </span>
                  <label className="config-switch">
                    <input 
                      type="checkbox" 
                      className="config-switch-input" 
                      checked={positionExpanded}
                      onChange={() => setPositionExpanded(!positionExpanded)}
                    />
                    <span className="config-switch-track">
                      <span className="config-switch-thumb"></span>
                    </span>
                  </label>
                </div>

                {/* Position grid when enabled */}
                {positionExpanded && (
                  <div className="config-position-grid-container">
                    <div className="config-position-grid">
                      {['top-left', 'top-center', 'top-right', 'middle-left', 'center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                        <button
                          key={pos}
                          className={`config-position-cell ${selectedPosition === pos ? 'selected' : ''}`}
                          onClick={() => setSelectedPosition(pos)}
                          aria-label={pos.replace('-', ' ')}
                          aria-pressed={selectedPosition === pos}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Visibility Rules Tab Content */}
              {activeTab === 'visibility' && (
            <div className="flow-config-accordions">
              <div className="studio-accordion flow-config-accordion-item">
                <button className="accordion-header" onClick={() => setWhereExpanded(!whereExpanded)}>
                  <span className="accordion-title">Where does the pop up appear?</span>
                  {whereExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {whereExpanded && (
                  <div className="accordion-body">
                    <p className="config-placeholder-text">Configure where the popup will appear in the app.</p>
                          <div className="where-conditions">
                            {whereConditions.map((cond) => (
                              <div key={cond.id} className="where-condition-card">
                                <div className="where-condition-header">
                                  <span className="where-condition-label">Condition {whereConditions.findIndex((c) => c.id === cond.id) + 1}</span>
                                  <button
                                    type="button"
                                    className="where-condition-delete"
                                    onClick={() => {
                                      if (whereConditions.length > 1) {
                                        setWhereConditions(whereConditions.filter((c) => c.id !== cond.id))
                                      }
                                    }}
                                    aria-label="Delete condition"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="where-condition-row">
                                  <label className="where-condition-show-label">Show on</label>
                                  <div className="where-condition-select-wrap">
                                    {(() => {
                                      const availableOptions = WHERE_SHOW_ON_OPTIONS.filter(
                                        (opt) =>
                                          opt.value === cond.showOn ||
                                          !whereConditions.some((c) => c.id !== cond.id && c.showOn === opt.value)
                                      )
                                      const selectedOption = WHERE_SHOW_ON_OPTIONS.find((o) => o.value === cond.showOn)
                                      const isOpen = openWhereDropdownId === cond.id
                                      return (
                                        <div className="where-showon-dropdown">
                                          <button
                                            type="button"
                                            className={`where-showon-trigger ${cond.showOn ? 'has-value' : ''}`}
                                            onClick={() => setOpenWhereDropdownId(isOpen ? null : cond.id)}
                                            aria-expanded={isOpen}
                                            aria-haspopup="listbox"
                                          >
                                            <span className="where-showon-trigger-text">
                                              {selectedOption ? selectedOption.label : 'Select'}
                                            </span>
                                            <ChevronDown size={16} className={`where-showon-chevron ${isOpen ? 'open' : ''}`} />
                                          </button>
                                          {isOpen && (
                                            <div className="where-showon-list" role="listbox">
                                              {availableOptions.map((opt) => {
                                                const Icon = opt.Icon
                                                return (
                                                  <button
                                                    key={opt.value}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={cond.showOn === opt.value}
                                                    className={`where-showon-option ${cond.showOn === opt.value ? 'selected' : ''}`}
                                                    onClick={() => {
                                                      setWhereConditions(whereConditions.map((c) =>
                                                        c.id === cond.id ? { ...c, showOn: opt.value } : c
                                                      ))
                                                      setOpenWhereDropdownId(null)
                                                    }}
                                                  >
                                                    <Icon size={18} className="where-showon-option-icon" />
                                                    <div className="where-showon-option-text">
                                                      <span className="where-showon-option-label">{opt.label}</span>
                                                      <span className="where-showon-option-desc">{opt.description}</span>
                                                    </div>
                                                  </button>
                                                )
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="where-add-condition-btn"
                              onClick={() => setWhereConditions([...whereConditions, { id: Date.now(), showOn: '' }])}
                            >
                              <Plus size={14} />
                              Add condition
                            </button>
                          </div>
                  </div>
                )}
              </div>

              <div className="studio-accordion flow-config-accordion-item">
                <button className="accordion-header" onClick={() => setWhenExpanded(!whenExpanded)}>
                  <span className="accordion-title">When does the pop up start and stop appearing?</span>
                  {whenExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {whenExpanded && (
                  <div className="accordion-body">
                    <p className="config-placeholder-text">Set the timing rules for when the popup starts and stops appearing.</p>
                    <div className="ms-popup-when-stack">
                      <h4 className="ms-popup-when-subheading">When does the pop up start appearing?</h4>
                      <div className="when-conditions">
                        {whenStartConditions.map((cond) => (
                          <div key={cond.id} className="when-condition-card">
                            <div className="when-condition-header">
                              <span className="when-condition-label">
                                Start condition {whenStartConditions.findIndex((c) => c.id === cond.id) + 1}
                              </span>
                              <button
                                type="button"
                                className="when-condition-delete"
                                onClick={() => {
                                  if (whenStartConditions.length > 1) {
                                    setWhenStartConditions(whenStartConditions.filter((c) => c.id !== cond.id))
                                    if (visibilityWhenPickConditionId === cond.id) {
                                      setVisibilityWhenPickConditionId(null)
                                      setHoveredElement(null)
                                    }
                                  }
                                }}
                                aria-label="Delete start condition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="when-condition-row">
                              <label className="when-condition-cause-label">What causes the popup to appear?</label>
                              <div className="when-condition-select-wrap">
                                <div className="when-cause-dropdown">
                                  {(() => {
                                    const availableOptions = WHEN_CAUSE_OPTIONS.filter(
                                      (opt) =>
                                        opt.value === cond.cause ||
                                        !whenStartConditions.some((c) => c.id !== cond.id && c.cause === opt.value)
                                    )
                                    const selectedOption = WHEN_CAUSE_OPTIONS.find((o) => o.value === cond.cause)
                                    const isOpen = openWhenDropdownId === cond.id
                                    return (
                                      <>
                                        <button
                                          type="button"
                                          className={`when-cause-trigger ${cond.cause ? 'has-value' : ''}`}
                                          onClick={() => setOpenWhenDropdownId(isOpen ? null : cond.id)}
                                          aria-expanded={isOpen}
                                          aria-haspopup="listbox"
                                        >
                                          <span className="when-cause-trigger-text">
                                            {selectedOption ? selectedOption.label : 'Select'}
                                          </span>
                                          <ChevronDown size={16} className={`when-cause-chevron ${isOpen ? 'open' : ''}`} />
                                        </button>
                                        {isOpen && (
                                          <div className="when-cause-list" role="listbox">
                                            {availableOptions.map((opt) => {
                                              const CauseIcon = opt.Icon
                                              return (
                                                <button
                                                  key={opt.value}
                                                  type="button"
                                                  role="option"
                                                  aria-selected={cond.cause === opt.value}
                                                  className={`when-cause-option ${cond.cause === opt.value ? 'selected' : ''}`}
                                                  onClick={() => {
                                                    setWhenStartConditions((prev) =>
                                                      prev.map((c) =>
                                                        c.id === cond.id
                                                          ? {
                                                              ...c,
                                                              cause: opt.value,
                                                              ...(opt.value === 'screen-detection'
                                                                ? {
                                                                    targetLabel: c.targetLabel || '',
                                                                    targetSelectValue: c.targetSelectValue || '',
                                                                    detectionTiming: c.detectionTiming || 'instant',
                                                                  }
                                                                : {
                                                                    targetLabel: '',
                                                                    targetSelectValue: '',
                                                                    detectionTiming: 'instant',
                                                                  }),
                                                            }
                                                          : c
                                                      )
                                                    )
                                                    setOpenWhenDropdownId(null)
                                                  }}
                                                >
                                                  {CauseIcon && <CauseIcon size={18} className="when-cause-option-icon" />}
                                                  <div className="when-cause-option-text">
                                                    <span className="when-cause-option-label">{opt.label}</span>
                                                    <span className="when-cause-option-desc">{opt.description}</span>
                                                  </div>
                                                </button>
                                              )
                                            })}
                                          </div>
                                        )}
                                      </>
                                    )
                                  })()}
                                </div>
                              </div>
                              {cond.cause === 'screen-detection' && (
                                <div className="ms-popup-when-screen-fields">
                                  <label className="ms-popup-when-screen-label">Element detection</label>
                                  <div className="ms-vis-display-rule-row">
                                    <div className="ms-vis-display-rule-dd ms-vis-display-rule-dd--highlight">
                                      <select
                                        className="ms-vis-display-rule-select"
                                        value={cond.targetSelectValue || ''}
                                        onChange={(e) => {
                                          const v = e.target.value
                                          setWhenStartConditions((prev) =>
                                            prev.map((c) => (c.id === cond.id ? { ...c, targetSelectValue: v } : c))
                                          )
                                        }}
                                      >
                                        <option value="">Select Element</option>
                                        <option value="primary">Primary target</option>
                                        <option value="secondary">Secondary target</option>
                                      </select>
                                    </div>
                                    {cond.targetLabel ? (
                                      <div className="ms-vis-display-rule-picked-row">
                                        <input
                                          type="text"
                                          className="ms-vis-display-rule-picked-input"
                                          readOnly
                                          value={cond.targetLabel}
                                        />
                                        <button
                                          type="button"
                                          className="ms-vis-display-rule-picked-delete"
                                          aria-label="Clear selected element"
                                          onClick={() => {
                                            setWhenStartConditions((prev) =>
                                              prev.map((c) => (c.id === cond.id ? { ...c, targetLabel: '' } : c))
                                            )
                                          }}
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        className="ms-vis-display-rule-pick-btn"
                                        onClick={() => {
                                          if (!isDevicePaired) {
                                            setSnackbarMessage('Pair your device to select an element on screen')
                                            return
                                          }
                                          setVisibilityWhenPickConditionId(cond.id)
                                          setSnackbarMessage('Tap an element on the phone preview')
                                        }}
                                      >
                                        Select
                                      </button>
                                    )}
                                  </div>
                                  <label className="ms-popup-when-screen-label" htmlFor={`ms-when-detect-${cond.id}`}>
                                    Detection timing
                                  </label>
                                  <div className="ms-vis-display-rule-dd">
                                    <select
                                      id={`ms-when-detect-${cond.id}`}
                                      className="ms-vis-display-rule-select"
                                      value={cond.detectionTiming || 'instant'}
                                      onChange={(e) => {
                                        const v = e.target.value
                                        setWhenStartConditions((prev) =>
                                          prev.map((c) =>
                                            c.id === cond.id ? { ...c, detectionTiming: v } : c
                                          )
                                        )
                                      }}
                                    >
                                      <option value="instant">Instant</option>
                                      <option value="stable-500ms">Stable for 500ms</option>
                                      <option value="stable-1000ms">Stable for 1 second</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="when-add-condition-btn"
                          onClick={() => {
                            setOpenWhenDropdownId(null)
                            setWhenStartConditions((prev) => [...prev, defaultWhenStartCondition(Date.now())])
                          }}
                        >
                          <Plus size={14} />
                          Add condition
                        </button>
                      </div>

                      <h4 className="ms-popup-when-subheading">When does the pop up stop appearing?</h4>
                      <div className="ms-popup-when-end-card">
                        <div className="ms-popup-when-end-card-head">
                          <span className="ms-popup-when-end-card-title">End condition</span>
                        </div>
                        <div className="ms-popup-when-end-card-body">
                          <div className="ms-popup-when-info-banner" role="status">
                            <span className="ms-popup-when-info-icon" aria-hidden="true">
                              <Info size={18} />
                            </span>
                            <p className="ms-popup-when-info-text">
                              The pop up won&apos;t appear unless all the start conditions are met.
                            </p>
                          </div>
                          <div className="ms-popup-when-field">
                            <label className="ms-popup-when-field-label" htmlFor="ms-when-freq-mode">
                              How many times should the pop up show up?
                            </label>
                            <select
                              id="ms-when-freq-mode"
                              className="ms-popup-when-freq-select"
                              value={whenFrequencyMode}
                              onChange={(e) => setWhenFrequencyMode(e.target.value)}
                            >
                              <option value="set-number">A set number of times</option>
                              <option value="once-session">Once per session</option>
                              <option value="unlimited">Whenever start conditions are met</option>
                            </select>
                          </div>
                          {whenFrequencyMode === 'set-number' && (
                            <div className="ms-popup-when-field">
                              <label className="ms-popup-when-field-label" htmlFor="ms-when-freq-count">
                                No of times
                              </label>
                              <input
                                id="ms-when-freq-count"
                                type="number"
                                className="ms-popup-when-freq-count-input"
                                min={1}
                                step={1}
                                value={whenFrequencyCount}
                                onChange={(e) => {
                                  const n = parseInt(e.target.value, 10)
                                  if (Number.isFinite(n) && n >= 1) setWhenFrequencyCount(n)
                                }}
                                onBlur={(e) => {
                                  const n = parseInt(e.target.value, 10)
                                  if (!Number.isFinite(n) || n < 1) setWhenFrequencyCount(1)
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="studio-accordion flow-config-accordion-item">
                <button className="accordion-header" onClick={() => setWhoExpanded(!whoExpanded)}>
                  <span className="accordion-title">Who does the pop up appear to?</span>
                  {whoExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {whoExpanded && (
                  <div className="accordion-body">
                    <p className="config-placeholder-text">Define the audience targeting rules for this popup.</p>
                          <div className="who-conditions">
                            {whoConditions.map((cond) => (
                              <div key={cond.id} className="who-condition-card">
                                <div className="who-condition-header">
                                  <span className="who-condition-label">Condition {whoConditions.findIndex((c) => c.id === cond.id) + 1}</span>
                                  <button
                                    type="button"
                                    className="who-condition-delete"
                                    onClick={() => {
                                      if (whoConditions.length > 1) {
                                        setWhoConditions(whoConditions.filter((c) => c.id !== cond.id))
                                      }
                                    }}
                                    aria-label="Delete condition"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="who-condition-row">
                                  <label className="who-condition-identify-label">How would you like to identify the user?</label>
                                  <div className="who-condition-select-wrap">
                                    <div className="who-identify-dropdown">
                                      {(() => {
                                        const availableOptions = WHO_IDENTIFY_OPTIONS.filter(
                                          (opt) =>
                                            opt.value === cond.identifyBy ||
                                            !whoConditions.some((c) => c.id !== cond.id && c.identifyBy === opt.value)
                                        )
                                        const selectedOption = WHO_IDENTIFY_OPTIONS.find((o) => o.value === cond.identifyBy)
                                        const isOpen = openWhoDropdownId === cond.id
                                        return (
                                          <>
                                            <button
                                              type="button"
                                              className={`who-identify-trigger ${cond.identifyBy ? 'has-value' : ''}`}
                                              onClick={() => setOpenWhoDropdownId(isOpen ? null : cond.id)}
                                              aria-expanded={isOpen}
                                              aria-haspopup="listbox"
                                            >
                                              <span className="who-identify-trigger-text">
                                                {selectedOption ? selectedOption.label : 'Select'}
                                              </span>
                                              <ChevronDown size={16} className={`who-identify-chevron ${isOpen ? 'open' : ''}`} />
                                            </button>
                                            {isOpen && (
                                              <div className="who-identify-list" role="listbox">
                                                {availableOptions.map((opt) => (
                                                  <button
                                                    key={opt.value}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={cond.identifyBy === opt.value}
                                                    className={`who-identify-option ${cond.identifyBy === opt.value ? 'selected' : ''}`}
                                                    onClick={() => {
                                                      setWhoConditions(whoConditions.map((c) =>
                                                        c.id === cond.id ? { ...c, identifyBy: opt.value } : c
                                                      ))
                                                      setOpenWhoDropdownId(null)
                                                    }}
                                                  >
                                                    <div className="who-identify-option-text">
                                                      <span className="who-identify-option-label">{opt.label}</span>
                                                      <span className="who-identify-option-desc">{opt.description}</span>
                                                    </div>
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </>
                                        )
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="who-add-condition-btn"
                              onClick={() => setWhoConditions([...whoConditions, { id: Date.now(), identifyBy: '' }])}
                            >
                              <Plus size={14} />
                              Add condition
                            </button>
                          </div>
                  </div>
                )}
              </div>
            </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Header - positioned absolutely at top */}
      <div className="studio-header">
        <div className="header-top">
          <div className="studio-breadcrumb">
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="breadcrumb-link">All content</a>
            <span className="breadcrumb-sep">/</span>
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="breadcrumb-link">Create content</a>
            {isPopupType && (
              <>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-text">Choose popup type</span>
              </>
            )}
            {isWidgetFlow && creationStep === 'choose-widget-subtype' && (
              <>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-text">Choose {popupTypeName.toLowerCase()} type</span>
              </>
            )}
            {isWidgetFlow && creationStep === 'anchor-panel' && (
              <>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-text">Set up</span>
              </>
            )}
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{popupTypeName}</span>
          </div>
          {creationStep === 'configure' || (creationStep === 'anchor-panel' && isWidgetFlow) ? (
            <>
              <div className="header-main">
                <button className="back-button" onClick={handleCreationBack}>
                  <ChevronLeft size={20} />
                </button>
                <input
                  type="text"
                  className={`studio-title-input ${overlayTitle ? 'has-value' : ''}`}
                  placeholder={placeholderTitle}
                  value={overlayTitle}
                  onChange={(e) => setOverlayTitle(e.target.value)}
                />
                <div className="header-right">
                  <div className="version-input">
                    <input 
                      type="text" 
                      placeholder="Add app version"
                      value={appVersion}
                      onChange={(e) => setAppVersion(e.target.value)}
                    />
                    <ChevronDown size={16} className="input-icon" />
                  </div>
                  <button className="preview-button">
                    <CaptureIcon />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

            </>
          ) : (
            <div className="header-main">
              <button
                className="back-button"
                onClick={
                  creationStep === 'choose-type' || creationStep === 'choose-widget-subtype' ? onClose : handleCreationBack
                }
              >
                <ChevronLeft size={20} />
              </button>
              <input
                type="text"
                className={`studio-title-input ${overlayTitle ? 'has-value' : ''}`}
                placeholder={placeholderTitle}
                value={overlayTitle}
                onChange={(e) => setOverlayTitle(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer: widget anchor actions on bottom layer; standard CTA for other steps */}
      {isWidgetFlow && creationStep === 'anchor-panel' && !showWidgetDetailsPanel && (
        <div className="studio-footer studio-footer--widget-anchor">
          <div className="widget-anchor-actions" role="group" aria-label="Widget actions">
            <button type="button" className="widget-anchor-discard" onClick={handleWidgetAnchorBackToSubtypeGrid}>
              Discard
            </button>
            <div className="widget-anchor-actions-right">
              <button type="button" className="widget-anchor-cancel" onClick={handleWidgetAnchorBackToSubtypeGrid}>
                Cancel
              </button>
              <button type="button" className="widget-anchor-save" onClick={handleSaveWidgetFromAnchorPanel}>
                {selectedPopupType === 'smarttip' ? 'Save Tip' : 'Save Beacon'}
              </button>
            </div>
          </div>
        </div>
      )}
      {!(isWidgetFlow && creationStep === 'anchor-panel') && (
        <div className="studio-footer">
          <div className="footer-actions">
            <button className="btn-discard" onClick={onClose}>
              Discard changes
            </button>
            <button
              className="btn-save"
              onClick={() => {
                const name = overlayTitle.trim()
                if (!name) {
                  setSnackbarMessage(
                    isWidgetFlow ? 'Enter a title in the header to save' : 'Pop-up cannot be saved without a title'
                  )
                  return
                }
                const saveType =
                  selectedPopupType === 'smarttip' ? 'Smart Tip' : selectedPopupType === 'beacon' ? 'Beacon' : 'Pop-up'
                if (typeof onSave === 'function') {
                  onSave({
                    name,
                    type: saveType,
                    id: editItem?.id,
                    creationSnapshot: buildMobileSnapshot(),
                  })
                }
                onClose()
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {snackbarMessage && (
        <div className="flow-snackbar studio-snackbar" role="alert">
          <span>{snackbarMessage}</span>
          <button type="button" className="flow-snackbar-dismiss" aria-label="Dismiss" onClick={() => setSnackbarMessage(null)}>×</button>
        </div>
      )}
    </div>
  )
}

export default MobileStudio
