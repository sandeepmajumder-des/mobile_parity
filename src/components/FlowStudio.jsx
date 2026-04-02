import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronUp, ChevronDown, Eye, Settings, MapPin, Clock, Users,
  Bluetooth, Plus, Trash2, FileText, Globe, Route, Hash, Tag, Calendar, Monitor,
  MoreVertical, Flag, X,
} from 'lucide-react'
import { appScreens } from '../data/appScreens'
import './MobileStudio.css'
import './FlowStudio.css'


// Visibility options (same as popup – flow wording in labels)
const WHERE_SHOW_ON_OPTIONS = [
  { value: 'url', label: 'URL', description: 'Only the page with a specific URL', Icon: FileText },
  { value: 'domain', label: 'Domain', description: 'All pages that start with the current domain', Icon: Globe },
  { value: 'url-path', label: 'URL path', description: 'Pages with URLs that contain a particular path', Icon: Route },
  { value: 'url-parameter', label: 'URL parameter', description: 'Pages with a specified URL parameter', Icon: MapPin },
  { value: 'url-hash', label: 'URL hash value', description: 'Pages with specified URL hash value', Icon: Hash },
  { value: 'page-tags', label: 'Page tags', description: 'Pages that have the specified page tag', Icon: Tag },
]
const WHEN_CAUSE_OPTIONS = [
  { value: 'specific-date-range', label: 'Specific date range', description: 'Define a period during which the flow should appear', Icon: Calendar },
  { value: 'something-on-application', label: 'Something on the application', description: 'An event or state that triggers the flow', Icon: Monitor },
]
const WHO_IDENTIFY_OPTIONS = [
  { value: 'enterprise-attributes', label: 'Enterprise Attributes', description: 'Identify the user by enterprise-level attributes' },
  { value: 'user-attributes', label: 'User Attributes', description: 'Identify the user by user-level attributes' },
]

const FLOW_STUDIO_SNAPSHOT_V = 1

/** Defaults for new flow + merge base for saved snapshots (V1 dashboard). */
const FLOW_STUDIO_DEFAULTS = {
  activeTab: 'configuration',
  creationStage: 'details',
  flowPanelView: 'timeline',
  stepConfigId: null,
  activeStepId: null,
  isDevicePaired: false,
  isPairing: false,
  flowStepsExpanded: true,
  flowSteps: [],
  flowName: '',
  flowDescription: '',
  flowTags: '',
  flowKeywords: '',
  flowAppType: 'Android',
  appVersion: '',
  whereExpanded: false,
  whenExpanded: false,
  whoExpanded: false,
  whereConditions: [{ id: 1, showOn: '' }],
  whenStartConditions: [{ id: 1, cause: '' }],
  whoConditions: [{ id: 1, identifyBy: '' }],
  configAppearanceExpanded: false,
  configPositionExpanded: false,
  configStepCompletionExpanded: false,
  configAdditionalOptionsExpanded: false,
  flowWidgetType: 'tooltip',
  tooltipColor: '#1E3A5F',
  tooltipCloseColor: '#ffffff',
  tooltipPosition: 'bottom-left',
  completionMode: 'manual',
  stepCompletionRules: [{ id: 1, value: 'on-click-of-selected-element' }],
  optionalStep: false,
  showAsSpotlight: false,
}

function getFlowResolvedInitial(editItem) {
  const firstScreenId = appScreens[0]?.id ?? null
  const base = { ...FLOW_STUDIO_DEFAULTS, selectedScreen: firstScreenId }
  const snap = editItem?.creationSnapshot
  if (snap?.kind === 'flow' && snap.v === FLOW_STUDIO_SNAPSHOT_V) {
    return {
      ...base,
      ...snap,
      flowSteps: Array.isArray(snap.flowSteps) ? snap.flowSteps : [],
      whereConditions: snap.whereConditions?.length ? snap.whereConditions : base.whereConditions,
      whenStartConditions: snap.whenStartConditions?.length ? snap.whenStartConditions : base.whenStartConditions,
      whoConditions: snap.whoConditions?.length ? snap.whoConditions : base.whoConditions,
      stepCompletionRules: snap.stepCompletionRules?.length ? snap.stepCompletionRules : base.stepCompletionRules,
      selectedScreen: snap.selectedScreen ?? firstScreenId,
    }
  }
  const fromTableFlow = Boolean(editItem && !editItem.isFolder && editItem.type === 'Flow')
  if (fromTableFlow) {
    return {
      ...base,
      flowName: (editItem.name && String(editItem.name).trim()) || '',
      creationStage: 'builder',
      isDevicePaired: true,
    }
  }
  return base
}

const FLOW_WIDGET_OPTIONS = [
  {
    id: 'popups',
    label: 'Popups',
    description: 'Centered dialog over the app—great for confirmations and short messages.',
    visual: 'popups',
  },
  {
    id: 'bottom-sheet',
    label: 'Bottom sheet',
    description: 'Slides up from the bottom; ideal for actions, lists, and extra context.',
    visual: 'bottom-sheet',
  },
  {
    id: 'drawers',
    label: 'Drawers',
    description: 'Side panel that slides in—useful for navigation, filters, or settings.',
    visual: 'drawers',
  },
  {
    id: 'tooltip',
    label: 'Tooltip',
    description: 'Compact callout anchored to an element with optional steps.',
    visual: 'tooltip',
  },
  {
    id: 'beacon',
    label: 'Beacon',
    description: 'Pulsing hotspot that draws attention without blocking the UI.',
    visual: 'beacon',
  },
]

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

function FlowWidgetChooserVisual({ variant }) {
  return <span className={`flow-widget-chooser-thumb flow-widget-chooser-thumb--${variant}`} aria-hidden />
}

// Tooltip shown on the app screen for a step (label, description, Back/Next)
// Optional: backgroundColor, closeColor (theme from Configuration), stepIndicator ("2/5"), showClose (for preview)
// alignRight: when true, tooltip aligns to right edge of element so it stays inside phone frame
function FlowStepTooltip({ step, stepIndex, totalSteps, alignRight, backgroundColor, closeColor, stepIndicator, showClose }) {
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1
  const label = step.actionLabel && step.actionTarget ? `${step.actionLabel} ${step.actionTarget}` : step.actionTarget || 'Step'
  const style = backgroundColor ? { background: backgroundColor } : {}
  const closeStyle = closeColor ? { color: closeColor } : {}

  return (
    <div className={`flow-step-tooltip ${alignRight ? 'flow-step-tooltip-align-right' : ''} ${stepIndicator ? 'flow-step-tooltip-with-header' : ''}`} role="tooltip" style={style}>
      {stepIndicator && (
        <div className="flow-step-tooltip-header">
          <span className="flow-step-tooltip-step-indicator">{stepIndicator}</span>
          {showClose && (
            <button type="button" className="flow-step-tooltip-close" aria-label="Close" style={closeStyle}>
              <X size={16} />
            </button>
          )}
        </div>
      )}
      <div className="flow-step-tooltip-title">{label}</div>
      {step.description && <div className="flow-step-tooltip-desc">{step.description}</div>}
      <div className="flow-step-tooltip-ctas">
        {!isFirst && <button type="button" className="flow-step-tooltip-btn flow-step-tooltip-back">Back</button>}
        {!isLast && <button type="button" className="flow-step-tooltip-btn flow-step-tooltip-next">Next</button>}
      </div>
    </div>
  )
}

// Minimal phone preview for flow: home and restaurant with selectable elements
function FlowPhonePreview({ screen, selectingForStepId, hoveredElement, flowSteps, activeStepId, onElementSelect, onElementHover, tooltipColor, tooltipCloseColor }) {
  if (!screen) {
    return (
      <div className="empty-preview">
        <p>Select a screen to add steps</p>
      </div>
    )
  }
  const { layout, accentColor, content, headerTitle } = screen
  const selectedIds = flowSteps.filter(s => s.screenId === screen.id).map(s => s.elementId)
  const isActiveElement = (elementId) =>
    Boolean(activeStepId && flowSteps.some(s => s.screenId === screen.id && s.elementId === elementId && s.id === activeStepId))

  const getStepInfo = (elementId) => {
    // While adding or reselecting a step, hide latched step tooltips so the screen is free to tap.
    if (selectingForStepId) return null
    const step = flowSteps.find(s => s.screenId === screen.id && s.elementId === elementId)
    if (!step || activeStepId == null || step.id !== activeStepId) return null
    const stepIndex = flowSteps.findIndex(s => s.id === step.id)
    return { step, stepIndex, totalSteps: flowSteps.length }
  }

  /* When a step card is selected, only that step's element gets highlight + tooltip; others get no green */
  const showSelectedOnElement = (elementId) => !activeStepId || isActiveElement(elementId)
  const sel = (elementId, elementName) => ({
    className: `selectable-element ${hoveredElement === elementId ? 'element-hovered' : ''} ${selectedIds.includes(elementId) && showSelectedOnElement(elementId) ? 'element-selected' : ''} ${isActiveElement(elementId) ? 'element-active' : ''}`,
    onMouseEnter: () => onElementHover?.(elementId),
    onMouseLeave: () => onElementHover?.(null),
    onClick: selectingForStepId ? (e) => { e.stopPropagation(); onElementSelect?.(elementId, elementName); } : undefined,
  })

  return (
    <div className={`phone-preview-wrapper flow-preview ${selectingForStepId ? 'selecting-mode' : ''}`}>
      {layout === 'food-home' && (
        <div className="preview-body food-home">
          <div className="flow-element-with-tooltip-wrap">
            <div className="food-header" style={{ background: accentColor }} {...sel('header', 'Food Header')}>
              <div className="location-bar">
                <span className="location-icon">📍</span>
                <div className="location-text">
                  <span className="deliver-to">Deliver to</span>
                  <span className="address">{content.address}</span>
                </div>
              </div>
            </div>
            {getStepInfo('header') && <FlowStepTooltip step={getStepInfo('header').step} stepIndex={getStepInfo('header').stepIndex} totalSteps={getStepInfo('header').totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
          </div>
          <div className="food-content">
            <div className="flow-element-with-tooltip-wrap">
              <p className="greeting" {...sel('greeting', 'Greeting Text')}>{content.greeting}</p>
              {getStepInfo('greeting') && <FlowStepTooltip step={getStepInfo('greeting').step} stepIndex={getStepInfo('greeting').stepIndex} totalSteps={getStepInfo('greeting').totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
            </div>
            <div className="flow-element-with-tooltip-wrap">
              <div className="search-bar-preview" {...sel('search', 'Search Bar')}>
                <span>🔍</span>
                <span className="search-placeholder">Search for dishes, restaurants...</span>
              </div>
              {getStepInfo('search') && <FlowStepTooltip step={getStepInfo('search').step} stepIndex={getStepInfo('search').stepIndex} totalSteps={getStepInfo('search').totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
            </div>
            <div className="categories-row">
              {content.categories.map((cat, i) => {
                const stepInfo = getStepInfo(`cat-${i}`)
                return (
                  <div key={i} className="flow-element-with-tooltip-wrap">
                    <div className="category-item" {...sel(`cat-${i}`, cat.name)}>
                      <span className="cat-emoji">{cat.emoji}</span>
                      <span className="cat-name">{cat.name}</span>
                    </div>
                    {stepInfo && <FlowStepTooltip key={stepInfo.step.id} step={stepInfo.step} stepIndex={stepInfo.stepIndex} totalSteps={stepInfo.totalSteps} alignRight={i >= Math.floor((content.categories?.length || 4) / 2)} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
                  </div>
                )
              })}
            </div>
            <p className="section-label">Popular near you</p>
            <div className="restaurant-list">
              {content.featured.map((rest, i) => {
                const stepInfo = getStepInfo(`rest-${i}`)
                return (
                  <div key={i} className="flow-element-with-tooltip-wrap">
                    <div className="restaurant-card" {...sel(`rest-${i}`, rest.name)}>
                      <div className="rest-image">🍽️</div>
                      <div className="rest-info">
                        <span className="rest-name">{rest.name}</span>
                        <span className="rest-cuisine">{rest.cuisine}</span>
                      </div>
                    </div>
                    {stepInfo && <FlowStepTooltip step={stepInfo.step} stepIndex={stepInfo.stepIndex} totalSteps={stepInfo.totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      {layout === 'food-restaurant' && (
        <div className="preview-body food-restaurant">
          <div className="flow-element-with-tooltip-wrap">
            <div className="rest-banner" style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #ff6b7a 100%)` }} {...sel('banner', 'Restaurant Banner')}>
              <span className="banner-emoji">{content.banner}</span>
            </div>
            {getStepInfo('banner') && <FlowStepTooltip step={getStepInfo('banner').step} stepIndex={getStepInfo('banner').stepIndex} totalSteps={getStepInfo('banner').totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
          </div>
          <div className="rest-detail-content">
            <div className="flow-element-with-tooltip-wrap">
              <h3 className="rest-detail-name" {...sel('rest-name', 'Restaurant Name')}>{content.name}</h3>
              {getStepInfo('rest-name') && <FlowStepTooltip step={getStepInfo('rest-name').step} stepIndex={getStepInfo('rest-name').stepIndex} totalSteps={getStepInfo('rest-name').totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
            </div>
            <div className="rest-detail-meta">
              <span>⭐ {content.rating} ({content.reviews})</span>
              <span>• {content.time}</span>
            </div>
            <div className="menu-section">
              <p className="menu-title">Menu</p>
              {content.menu.map((item, i) => {
                const stepInfo = getStepInfo(`menu-${i}`)
                return (
                  <div key={i} className="flow-element-with-tooltip-wrap">
                    <div className="menu-item-card" {...sel(`menu-${i}`, item.name)}>
                      <div className="menu-item-info">
                        <span className="menu-item-name">{item.name}</span>
                        <span className="menu-item-price">{item.price}</span>
                      </div>
                      <button className="add-btn" style={{ background: accentColor }}>+</button>
                    </div>
                    {stepInfo && <FlowStepTooltip step={stepInfo.step} stepIndex={stepInfo.stepIndex} totalSteps={stepInfo.totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      {layout === 'food-cart' && (
        <div className="preview-body food-cart">
          <div className="flow-element-with-tooltip-wrap">
            <div className="cart-header-bar" style={{ background: accentColor }} {...sel('cart-header', 'Cart Header')}>
              <span className="cart-title">{headerTitle}</span>
            </div>
            {getStepInfo('cart-header') && <FlowStepTooltip step={getStepInfo('cart-header').step} stepIndex={getStepInfo('cart-header').stepIndex} totalSteps={getStepInfo('cart-header').totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
          </div>
          <div className="cart-content">
            <div className="cart-restaurant"><span>🍕</span><span>{content.restaurant}</span></div>
            {content.items.map((item, i) => {
              const stepInfo = getStepInfo(`cart-item-${i}`)
              return (
                <div key={i} className="flow-element-with-tooltip-wrap">
                  <div className="cart-item" {...sel(`cart-item-${i}`, item.name)}>
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-qty">Qty: {item.qty}</span>
                    </div>
                    <span className="cart-item-price">{item.price}</span>
                  </div>
                  {stepInfo && <FlowStepTooltip step={stepInfo.step} stepIndex={stepInfo.stepIndex} totalSteps={stepInfo.totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
                </div>
              )
            })}
            <div className="flow-element-with-tooltip-wrap">
              <button className="checkout-btn" style={{ background: accentColor }} {...sel('checkout-btn', 'Place Order Button')}>
                Place Order • {content.total}
              </button>
              {getStepInfo('checkout-btn') && <FlowStepTooltip step={getStepInfo('checkout-btn').step} stepIndex={getStepInfo('checkout-btn').stepIndex} totalSteps={getStepInfo('checkout-btn').totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
            </div>
          </div>
        </div>
      )}
      {layout === 'food-tracking' && (
        <div className="preview-body food-tracking">
          <div className="flow-element-with-tooltip-wrap">
            <div className="tracking-header" style={{ background: accentColor }} {...sel('tracking-header', 'Tracking Header')}>
              <span className="order-id">{content.orderId}</span>
              <span className="eta-badge">{content.eta} away</span>
            </div>
            {getStepInfo('tracking-header') && <FlowStepTooltip step={getStepInfo('tracking-header').step} stepIndex={getStepInfo('tracking-header').stepIndex} totalSteps={getStepInfo('tracking-header').totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
          </div>
          <div className="tracking-content">
            <div className="flow-element-with-tooltip-wrap">
              <div className="tracking-map" {...sel('tracking-map', 'Tracking Map')}>
                <div className="map-placeholder"><span className="map-icon">🗺️</span></div>
              </div>
              {getStepInfo('tracking-map') && <FlowStepTooltip step={getStepInfo('tracking-map').step} stepIndex={getStepInfo('tracking-map').stepIndex} totalSteps={getStepInfo('tracking-map').totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
            </div>
            <div className="flow-element-with-tooltip-wrap">
              <div className="tracking-status" {...sel('tracking-status', 'Order Status')}>
                <p className="status-text">{content.status}</p>
              </div>
              {getStepInfo('tracking-status') && <FlowStepTooltip step={getStepInfo('tracking-status').step} stepIndex={getStepInfo('tracking-status').stepIndex} totalSteps={getStepInfo('tracking-status').totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
            </div>
            <div className="tracking-steps">
              {content.steps.map((step, i) => {
                const stepInfo = getStepInfo(`step-${i}`)
                return (
                  <div key={i} className="flow-element-with-tooltip-wrap">
                    <div className={`track-step ${step.done ? 'done' : ''} ${step.current ? 'current' : ''}`} {...sel(`step-${i}`, step.label)}>
                      <div className="step-dot" style={{ background: step.done ? accentColor : '#ddd' }}></div>
                      <span className="step-label">{step.label}</span>
                    </div>
                    {stepInfo && <FlowStepTooltip step={stepInfo.step} stepIndex={stepInfo.stepIndex} totalSteps={stepInfo.totalSteps} backgroundColor={tooltipColor} closeColor={tooltipCloseColor} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      {!['food-home', 'food-restaurant', 'food-cart', 'food-tracking'].includes(layout) && (
        <div className="preview-body">
          <p className="config-placeholder-text">Screen “{screen.name}” – select an element on Home or Restaurant for steps.</p>
        </div>
      )}
    </div>
  )
}

function FlowStudio({ onClose, onSave, editItem = null }) {
  const flowInit = getFlowResolvedInitial(editItem)
  const [activeTab, setActiveTab] = useState(flowInit.activeTab)
  const [creationStage, setCreationStage] = useState(flowInit.creationStage)
  /** V2-style: timeline first; Configuration/Visibility only after clicking a step */
  const [flowPanelView, setFlowPanelView] = useState(flowInit.flowPanelView)
  const [stepConfigId, setStepConfigId] = useState(flowInit.stepConfigId)
  const [isDevicePaired, setIsDevicePaired] = useState(flowInit.isDevicePaired)
  const [isPairing, setIsPairing] = useState(flowInit.isPairing)
  const [selectedScreen, setSelectedScreen] = useState(flowInit.selectedScreen)
  const [flowStepsExpanded, setFlowStepsExpanded] = useState(flowInit.flowStepsExpanded)
  const [flowSteps, setFlowSteps] = useState(flowInit.flowSteps)
  const [stepMenuOpenId, setStepMenuOpenId] = useState(null)
  const [editingStepId, setEditingStepId] = useState(null)
  const [editDraft, setEditDraft] = useState({ actionLabel: '', actionTarget: '', description: '' })
  const [activeStepId, setActiveStepId] = useState(flowInit.activeStepId)
  const [selectingForStepId, setSelectingForStepId] = useState(null)
  const [hoveredElement, setHoveredElement] = useState(null)
  const [flowName, setFlowName] = useState(flowInit.flowName)
  const [flowDescription, setFlowDescription] = useState(flowInit.flowDescription)
  const [flowTags, setFlowTags] = useState(flowInit.flowTags)
  const [flowKeywords, setFlowKeywords] = useState(flowInit.flowKeywords)
  /** Set from paired application (demo: Android) */
  const [flowAppType, setFlowAppType] = useState(flowInit.flowAppType)
  const [showFlowDetailsPanel, setShowFlowDetailsPanel] = useState(false)
  const [appVersion, setAppVersion] = useState(flowInit.appVersion)
  const [snackbarMessage, setSnackbarMessage] = useState(null)

  // Visibility (same structure as popup)
  const [whereExpanded, setWhereExpanded] = useState(flowInit.whereExpanded)
  const [whenExpanded, setWhenExpanded] = useState(flowInit.whenExpanded)
  const [whoExpanded, setWhoExpanded] = useState(flowInit.whoExpanded)
  const [whereConditions, setWhereConditions] = useState(flowInit.whereConditions)
  const [whenStartConditions, setWhenStartConditions] = useState(flowInit.whenStartConditions)
  const [whoConditions, setWhoConditions] = useState(flowInit.whoConditions)
  const [openWhereDropdownId, setOpenWhereDropdownId] = useState(null)
  const [openWhenDropdownId, setOpenWhenDropdownId] = useState(null)
  const [openWhoDropdownId, setOpenWhoDropdownId] = useState(null)

  // Configuration tab accordions
  const [configAppearanceExpanded, setConfigAppearanceExpanded] = useState(flowInit.configAppearanceExpanded)
  const [configPositionExpanded, setConfigPositionExpanded] = useState(flowInit.configPositionExpanded)
  const [configStepCompletionExpanded, setConfigStepCompletionExpanded] = useState(flowInit.configStepCompletionExpanded)
  const [configAdditionalOptionsExpanded, setConfigAdditionalOptionsExpanded] = useState(
    flowInit.configAdditionalOptionsExpanded
  )

  // Tooltip appearance (used by step tooltip and by Appearance preview)
  const [flowWidgetType, setFlowWidgetType] = useState(flowInit.flowWidgetType)
  const [flowWidgetPickerOpen, setFlowWidgetPickerOpen] = useState(false)
  const [tooltipColor, setTooltipColor] = useState(flowInit.tooltipColor)
  const [tooltipCloseColor, setTooltipCloseColor] = useState(flowInit.tooltipCloseColor)

  // Tooltip position: which of the 12 positions is selected (beak points toward center)
  const [tooltipPosition, setTooltipPosition] = useState(flowInit.tooltipPosition)
  // Step completion rules: manual | automated, and list of rules (dropdown values)
  const [completionMode, setCompletionMode] = useState(flowInit.completionMode)
  const [stepCompletionRules, setStepCompletionRules] = useState(flowInit.stepCompletionRules)
  const [openCompletionDropdownId, setOpenCompletionDropdownId] = useState(null)
  // Additional options: toggles and censor
  const [optionalStep, setOptionalStep] = useState(flowInit.optionalStep)
  const [showAsSpotlight, setShowAsSpotlight] = useState(flowInit.showAsSpotlight)
  const STEP_COMPLETION_RULE_OPTIONS = [
    { value: 'on-click-of-selected-element', label: 'On click of selected element' },
    { value: 'on-element-visible', label: 'On element visible' },
    { value: 'after-delay', label: 'After delay' },
    { value: 'on-form-submit', label: 'On form submit' },
  ]

  const POSITION_OPTIONS = [
    { id: 'top-left', grid: 'top-left', available: false },
    { id: 'top', grid: 'top', available: false },
    { id: 'top-right', grid: 'top-right', available: false },
    { id: 'left-top', grid: 'left-top', available: false },
    { id: 'left', grid: 'left', available: false },
    { id: 'left-bottom', grid: 'left-bottom', available: false },
    { id: 'right-top', grid: 'right-top', available: true },
    { id: 'right', grid: 'right', available: false },
    { id: 'right-bottom', grid: 'right-bottom', available: false },
    { id: 'bottom-left', grid: 'bottom-left', available: true },
    { id: 'bottom', grid: 'bottom', available: false },
    { id: 'bottom-right', grid: 'bottom-right', available: false },
  ]

  const currentScreen = appScreens.find(s => s.id === selectedScreen)

  useEffect(() => {
    if (!selectedScreen && appScreens.length > 0) setSelectedScreen(appScreens[0].id)
  }, [])

  useEffect(() => {
    if (
      creationStage !== 'builder' ||
      flowPanelView !== 'step-editor' ||
      stepConfigId == null ||
      flowSteps.some((s) => s.id === stepConfigId)
    ) {
      return
    }
    setFlowPanelView('timeline')
    setStepConfigId(null)
    setActiveStepId(null)
  }, [creationStage, flowPanelView, stepConfigId, flowSteps])


  useEffect(() => {
    if (openWhereDropdownId === null) return
    const handleClickOutside = (e) => {
      if (e.target.closest('.where-showon-dropdown') == null) setOpenWhereDropdownId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openWhereDropdownId])

  useEffect(() => {
    if (openWhenDropdownId === null) return
    const handleClickOutside = (e) => {
      if (e.target.closest('.when-cause-dropdown') == null) setOpenWhenDropdownId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openWhenDropdownId])

  useEffect(() => {
    if (openWhoDropdownId === null) return
    const handleClickOutside = (e) => {
      if (e.target.closest('.who-identify-dropdown') == null) setOpenWhoDropdownId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openWhoDropdownId])

  useEffect(() => {
    if (openCompletionDropdownId === null) return
    const handleClickOutside = (e) => {
      if (e.target.closest('.flow-completion-dropdown-wrap') == null) setOpenCompletionDropdownId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openCompletionDropdownId])

  useEffect(() => {
    if (stepMenuOpenId === null) return
    const handleClickOutside = (e) => {
      if (e.target.closest('.flow-step-menu-wrap') == null) setStepMenuOpenId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [stepMenuOpenId])

  useEffect(() => {
    if (!snackbarMessage) return
    const t = setTimeout(() => setSnackbarMessage(null), 5000)
    return () => clearTimeout(t)
  }, [snackbarMessage])

  // Handle pair device click with 2 second loader
  const handlePairDevice = () => {
    setIsPairing(true)
    setTimeout(() => {
      setIsPairing(false)
      setIsDevicePaired(true)
      setSelectedScreen(appScreens[0]?.id ?? null)
      setFlowAppType('Android')
    }, 2000)
  }

  const handleStartSelectElement = (stepId) => {
    setSelectingForStepId(stepId)
  }

  const handleElementSelect = (elementId, elementName) => {
    if (!selectingForStepId) return
    if (selectingForStepId === 'new') {
      const newId = Date.now()
      const newStep = {
        id: newId,
        screenId: selectedScreen,
        elementId,
        elementName,
        actionLabel: 'Click',
        actionTarget: elementName,
        description: `Tap or interact with ${elementName}.`,
      }
      setFlowSteps((prev) => [...prev, newStep])
      setActiveStepId(newId)
    } else {
      const step = flowSteps.find(s => s.id === selectingForStepId)
      if (step) {
        setFlowSteps(flowSteps.map(s => s.id === selectingForStepId ? { ...s, screenId: selectedScreen, elementId, elementName, actionTarget: elementName } : s))
      } else {
        setFlowSteps([...flowSteps, { id: selectingForStepId, screenId: selectedScreen, elementId, elementName, actionLabel: 'Click', actionTarget: elementName, description: '' }])
      }
      setActiveStepId(selectingForStepId)
    }
    setSelectingForStepId(null)
    setHoveredElement(null)
    setFlowPanelView('timeline')
    setStepConfigId(null)
  }

  const handleAddStep = () => {
    setShowFlowDetailsPanel(false)
    setCreationStage('builder')
    setFlowPanelView('timeline')
    setStepConfigId(null)
    if (!isDevicePaired) {
      setIsPairing(false)
      setIsDevicePaired(true)
      setSelectedScreen((prev) => prev ?? (appScreens[0]?.id ?? null))
      setFlowAppType('Android')
    }
  }

  const handleTimelineAddStep = () => {
    if (!isDevicePaired) {
      setIsPairing(false)
      setIsDevicePaired(true)
      setSelectedScreen((prev) => prev ?? (appScreens[0]?.id ?? null))
      setFlowAppType('Android')
    }
    setSelectingForStepId('new')
  }

  const openStepConfiguration = (stepId) => {
    setShowFlowDetailsPanel(false)
    setStepConfigId(stepId)
    setActiveStepId(stepId)
    setFlowPanelView('step-editor')
    setStepMenuOpenId(null)
  }

  const closeStepConfiguration = () => {
    setFlowPanelView('timeline')
    setStepConfigId(null)
    setActiveStepId(null)
  }

  const handleRemoveFlowStep = (id) => {
    setFlowSteps((prev) => prev.filter((s) => s.id !== id))
    setStepMenuOpenId(null)
    if (stepConfigId === id) {
      closeStepConfiguration()
    }
  }

  const handleStartEditStep = (step) => {
    setEditDraft({ actionLabel: step.actionLabel || '', actionTarget: step.actionTarget || '', description: step.description || '' })
    setEditingStepId(step.id)
    setStepMenuOpenId(null)
  }

  const handleSaveEditStep = () => {
    if (!editingStepId) return
    setFlowSteps(flowSteps.map(s => s.id === editingStepId ? { ...s, ...editDraft } : s))
    setEditingStepId(null)
  }

  const handleCancelEditStep = () => {
    setEditingStepId(null)
  }

  useEffect(() => {
    if (!flowWidgetPickerOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setFlowWidgetPickerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [flowWidgetPickerOpen])

  const closeFlowDetailsPanel = () => setShowFlowDetailsPanel(false)

  const renderFlowDetailsForm = (idSuffix) => (
    <div className="flow-step-edit-form">
      <div className="flow-step-edit-row">
        <label htmlFor={`flow-description${idSuffix}`}>Flow description (optional)</label>
        <textarea
          id={`flow-description${idSuffix}`}
          rows={3}
          className="flow-step-edit-input"
          value={flowDescription}
          onChange={(e) => setFlowDescription(e.target.value)}
        />
      </div>
      <div className="flow-step-edit-row">
        <label htmlFor={`flow-tags${idSuffix}`}>Tags (optional)</label>
        <input
          id={`flow-tags${idSuffix}`}
          type="text"
          className="flow-step-edit-input"
          value={flowTags}
          onChange={(e) => setFlowTags(e.target.value)}
        />
      </div>
      <div className="flow-step-edit-row">
        <label htmlFor={`flow-keywords${idSuffix}`}>Keywords (optional)</label>
        <input
          id={`flow-keywords${idSuffix}`}
          type="text"
          className="flow-step-edit-input"
          value={flowKeywords}
          onChange={(e) => setFlowKeywords(e.target.value)}
        />
      </div>
      <div className="flow-step-edit-row flow-step-edit-row--apptype">
        <label htmlFor={`flow-apptype${idSuffix}`}>App type</label>
        <input
          id={`flow-apptype${idSuffix}`}
          type="text"
          className="flow-step-edit-input flow-step-apptype-input"
          value={flowAppType}
          disabled
          readOnly
          aria-label="App type"
        />
        <p className="flow-apptype-hint">
          Automatically set from application while pairing.
        </p>
      </div>
    </div>
  )

  const renderFlowDetailsL2 = (idSuffix) => (
    <>
      <div className="flow-step-config-toolbar flow-details-l2-toolbar">
        <button
          type="button"
          className="back-button"
          onClick={closeFlowDetailsPanel}
          aria-label="Back to flow"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="flow-step-config-toolbar-title">Flow details</span>
      </div>
      {renderFlowDetailsForm(idSuffix)}
    </>
  )

  return (
    <div className="mobile-studio flow-studio">
      <div className="studio-preview-area">
        <div className="phone-frame">
          <div className="phone-screen">
            <div className="phone-status-bar">
              <span>9:41</span>
              <div className="status-icons">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
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
                <FlowPhonePreview
                  screen={currentScreen}
                  selectingForStepId={selectingForStepId}
                  hoveredElement={hoveredElement}
                  flowSteps={flowSteps}
                  activeStepId={activeStepId}
                  onElementSelect={handleElementSelect}
                  onElementHover={setHoveredElement}
                  tooltipColor={tooltipColor}
                  tooltipCloseColor={tooltipCloseColor}
                />
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
            {selectingForStepId && (
              <div className="flow-select-hint">
                <span>{selectingForStepId === 'new' ? 'Select an element on the screen to add a step' : 'Select an element on the screen for this step'}</span>
                <button type="button" className="flow-cancel-select" onClick={() => { setSelectingForStepId(null); setHoveredElement(null); }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="studio-panel">
        <div className="studio-content">
          {creationStage === 'details' ? (
            <div className="popup-config-body flow-studio-config-body">
              {showFlowDetailsPanel ? (
                renderFlowDetailsL2('')
              ) : (
                <>
                  <div className="flow-name-section">
                    <button
                      type="button"
                      className="flow-details-btn"
                      onClick={() => setShowFlowDetailsPanel(true)}
                    >
                      Details
                    </button>
                  </div>

                  <div className="flow-add-step-row-wrapper">
                    <button type="button" className="flow-add-step-block" onClick={handleAddStep}>
                      <Plus size={16} />
                      Add flow steps
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {flowPanelView === 'timeline' ? (
                <div className="popup-config-body flow-studio-config-body flow-studio-timeline-body">
                  {showFlowDetailsPanel ? (
                    renderFlowDetailsL2('-tl')
                  ) : (
                    <>
                  <button
                    type="button"
                    className="flow-details-btn"
                    onClick={() => setShowFlowDetailsPanel(true)}
                  >
                    Details
                  </button>

                  <h3 className="flow-steps-count-header">
                    {flowSteps.length === 1 ? '1 Step' : `${flowSteps.length} Steps`}
                  </h3>
                  <div className="flow-steps-sequence">
                    {flowSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flow-step-card ${activeStepId === step.id ? 'active' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => openStepConfiguration(step.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openStepConfiguration(step.id)
                          }
                        }}
                      >
                        <span className="flow-step-number-circle">{index + 1}</span>
                        <div className="flow-step-body">
                          <span className="flow-step-card-label">
                            {step.actionTarget || step.elementName || `Step ${index + 1}`}
                          </span>
                        </div>
                        <div
                          className="flow-step-menu-wrap"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="flow-step-menu-btn"
                            aria-label="Step options"
                            onClick={() => setStepMenuOpenId(stepMenuOpenId === step.id ? null : step.id)}
                          >
                            <MoreVertical size={18} />
                          </button>
                          {stepMenuOpenId === step.id && (
                            <div className="flow-step-menu-dropdown">
                              <button
                                type="button"
                                onClick={() => {
                                  handleStartSelectElement(step.id)
                                  setStepMenuOpenId(null)
                                }}
                              >
                                Change element
                              </button>
                              <button
                                type="button"
                                className="flow-step-menu-delete"
                                onClick={() => handleRemoveFlowStep(step.id)}
                              >
                                Remove step
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flow-add-step-row-wrapper">
                      <button type="button" className="flow-add-step-block" onClick={handleTimelineAddStep}>
                        <Plus size={16} />
                        Add Step
                      </button>
                    </div>
                    <div className="flow-end-message-card">
                      <span className="flow-step-number-circle flow-end-icon-wrap" aria-hidden>
                        <Flag size={14} />
                      </span>
                      <span className="flow-step-card-label">End Message</span>
                      <div className="flow-step-menu-wrap">
                        <button type="button" className="flow-step-menu-btn" aria-label="End message options">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="flow-step-config-toolbar">
                    <button
                      type="button"
                      className="back-button"
                      onClick={closeStepConfiguration}
                      aria-label="Back to flow steps"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="flow-step-config-toolbar-title">
                      {flowSteps.find((s) => s.id === stepConfigId)?.actionTarget ||
                        flowSteps.find((s) => s.id === stepConfigId)?.elementName ||
                        'Step'}
                    </span>
                  </div>
                  <div className="panel-tabs">
                    <button
                      type="button"
                      className={`panel-tab ${activeTab === 'configuration' ? 'active' : ''}`}
                      onClick={() => setActiveTab('configuration')}
                    >
                      Configuration
                    </button>
                    <button
                      type="button"
                      className={`panel-tab ${activeTab === 'visibility rules' ? 'active' : ''}`}
                      onClick={() => setActiveTab('visibility rules')}
                    >
                      Visibility Rules
                    </button>
                  </div>

          {activeTab === 'configuration' && (
            <div className="popup-config-body flow-studio-config-body">
            <div className="flow-config-accordions">
              <div className="studio-accordion flow-config-accordion-item">
                <button className="accordion-header" onClick={() => setConfigAppearanceExpanded(!configAppearanceExpanded)}>
                  <span className="accordion-title">Appearance</span>
                  {configAppearanceExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {configAppearanceExpanded && (
                  <div className="accordion-body">
                    {flowWidgetPickerOpen ? (
                      <div className="flow-widget-chooser" role="dialog" aria-modal="true" aria-labelledby="flow-widget-chooser-title">
                        <div className="flow-widget-chooser-header">
                          <button
                            type="button"
                            className="flow-widget-chooser-back"
                            aria-label="Back"
                            onClick={() => setFlowWidgetPickerOpen(false)}
                          >
                            <ChevronLeft size={22} strokeWidth={2.25} />
                          </button>
                          <h2 id="flow-widget-chooser-title" className="flow-widget-chooser-title">
                            Choose widget
                          </h2>
                        </div>
                        <ul className="flow-widget-chooser-list">
                          {FLOW_WIDGET_OPTIONS.map((opt) => (
                            <li key={opt.id}>
                              <button
                                type="button"
                                className={`flow-widget-chooser-card ${flowWidgetType === opt.id ? 'flow-widget-chooser-card--selected' : ''}`}
                                onClick={() => {
                                  setFlowWidgetType(opt.id)
                                  setFlowWidgetPickerOpen(false)
                                }}
                              >
                                <div className="flow-widget-chooser-thumb-wrap">
                                  <FlowWidgetChooserVisual variant={opt.visual} />
                                </div>
                                <div className="flow-widget-chooser-copy">
                                  <span className="flow-widget-chooser-name">{opt.label}</span>
                                  <span className="flow-widget-chooser-desc">{opt.description}</span>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="flow-appearance-tooltip-section">
                        <div className="flow-appearance-tooltip-header">
                          <span className="flow-appearance-tooltip-label">
                            {FLOW_WIDGET_OPTIONS.find((o) => o.id === flowWidgetType)?.label ?? 'Tooltip'}
                          </span>
                          <button
                            type="button"
                            className="flow-appearance-change-widget"
                            onClick={() => setFlowWidgetPickerOpen(true)}
                          >
                            Change widget
                          </button>
                        </div>
                        <div className="flow-appearance-preview-box">
                          <FlowStepTooltip
                            step={{ actionLabel: 'Description part of the tip', actionTarget: '', description: 'Optional note section' }}
                            stepIndex={0}
                            totalSteps={5}
                            stepIndicator="2/5"
                            showClose
                            backgroundColor={tooltipColor}
                            closeColor={tooltipCloseColor}
                          />
                        </div>
                        <div className="flow-appearance-color-row">
                          <label className="flow-appearance-color-label">Color</label>
                          <input type="color" value={tooltipColor} onChange={(e) => setTooltipColor(e.target.value)} className="flow-appearance-color-input" aria-label="Tooltip color" />
                        </div>
                        <div className="flow-appearance-color-row">
                          <label className="flow-appearance-color-label">Close (X) color</label>
                          <input type="color" value={tooltipCloseColor} onChange={(e) => setTooltipCloseColor(e.target.value)} className="flow-appearance-color-input" aria-label="Close icon color" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="studio-accordion flow-config-accordion-item">
                <button className="accordion-header" onClick={() => setConfigPositionExpanded(!configPositionExpanded)}>
                  <span className="accordion-title">Position</span>
                  {configPositionExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {configPositionExpanded && (
                  <div className="accordion-body">
                    <div className="flow-position-picker">
                      <div className="flow-position-grid">
                        {/* Top row */}
                        {['top-left', 'top', 'top-right'].map((id) => {
                          const opt = POSITION_OPTIONS.find((o) => o.id === id)
                          const selected = tooltipPosition === id
                          const available = opt?.available ?? false
                          return (
                            <button
                              key={id}
                              type="button"
                              className={`flow-position-cell flow-position-${id} ${selected ? 'flow-position-selected' : ''} ${available && !selected ? 'flow-position-available' : ''} ${!available ? 'flow-position-na' : ''}`}
                              onClick={() => available && setTooltipPosition(id)}
                              disabled={!available}
                              title={id}
                            >
                              <span className="flow-position-beak" />
                              {!available && <span className="flow-position-na-label">N/A</span>}
                            </button>
                          )
                        })}
                        {/* Left column */}
                        {['left-top', 'left', 'left-bottom'].map((id) => {
                          const opt = POSITION_OPTIONS.find((o) => o.id === id)
                          const selected = tooltipPosition === id
                          const available = opt?.available ?? false
                          return (
                            <button
                              key={id}
                              type="button"
                              className={`flow-position-cell flow-position-${id} ${selected ? 'flow-position-selected' : ''} ${available && !selected ? 'flow-position-available' : ''} ${!available ? 'flow-position-na' : ''}`}
                              onClick={() => available && setTooltipPosition(id)}
                              disabled={!available}
                              title={id}
                            >
                              <span className="flow-position-beak" />
                              {!available && <span className="flow-position-na-label">N/A</span>}
                            </button>
                          )
                        })}
                        {/* Center */}
                        <div className="flow-position-center" aria-hidden>
                          <span className="flow-position-center-label">SELECTED ELEMENTS</span>
                        </div>
                        {/* Right column */}
                        {['right-top', 'right', 'right-bottom'].map((id) => {
                          const opt = POSITION_OPTIONS.find((o) => o.id === id)
                          const selected = tooltipPosition === id
                          const available = opt?.available ?? false
                          return (
                            <button
                              key={id}
                              type="button"
                              className={`flow-position-cell flow-position-${id} ${selected ? 'flow-position-selected' : ''} ${available && !selected ? 'flow-position-available' : ''} ${!available ? 'flow-position-na' : ''}`}
                              onClick={() => available && setTooltipPosition(id)}
                              disabled={!available}
                              title={id}
                            >
                              <span className="flow-position-beak" />
                              {!available && <span className="flow-position-na-label">N/A</span>}
                            </button>
                          )
                        })}
                        {/* Bottom row */}
                        {['bottom-left', 'bottom', 'bottom-right'].map((id) => {
                          const opt = POSITION_OPTIONS.find((o) => o.id === id)
                          const selected = tooltipPosition === id
                          const available = opt?.available ?? false
                          return (
                            <button
                              key={id}
                              type="button"
                              className={`flow-position-cell flow-position-${id} ${selected ? 'flow-position-selected' : ''} ${available && !selected ? 'flow-position-available' : ''} ${!available ? 'flow-position-na' : ''}`}
                              onClick={() => available && setTooltipPosition(id)}
                              disabled={!available}
                              title={id}
                            >
                              <span className="flow-position-beak" />
                              {!available && <span className="flow-position-na-label">N/A</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="studio-accordion flow-config-accordion-item">
                <button className="accordion-header" onClick={() => setConfigStepCompletionExpanded(!configStepCompletionExpanded)}>
                  <span className="accordion-title">Step Completion Rules</span>
                  {configStepCompletionExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {configStepCompletionExpanded && (
                  <div className="accordion-body">
                    <div className="flow-completion-rules">
                      <div className="flow-completion-mode">
                        <label className="flow-completion-radio-wrap">
                          <input type="radio" name="completionMode" value="manual" checked={completionMode === 'manual'} onChange={() => setCompletionMode('manual')} className="flow-completion-radio" />
                          <span className="flow-completion-radio-label">Manual</span>
                        </label>
                        <label className="flow-completion-radio-wrap">
                          <input type="radio" name="completionMode" value="automated" checked={completionMode === 'automated'} onChange={() => setCompletionMode('automated')} className="flow-completion-radio" />
                          <span className="flow-completion-radio-label">Automated</span>
                        </label>
                      </div>
                      <div className="flow-completion-rule-section">
                        <label className="flow-completion-rule-label">Step Completion Rule :</label>
                        <div className="flow-completion-rule-list">
                          {stepCompletionRules.map((rule) => {
                            const selectedOption = STEP_COMPLETION_RULE_OPTIONS.find((o) => o.value === rule.value)
                            const isOpen = openCompletionDropdownId === rule.id
                            return (
                              <div key={rule.id} className="flow-completion-rule-row">
                                <div className="flow-completion-dropdown-wrap">
                                  <button
                                    type="button"
                                    className="flow-completion-dropdown-trigger"
                                    onClick={() => setOpenCompletionDropdownId(isOpen ? null : rule.id)}
                                    aria-expanded={isOpen}
                                  >
                                    <span className="flow-completion-dropdown-value">{selectedOption ? selectedOption.label : 'Select rule'}</span>
                                    <ChevronDown size={16} className={`flow-completion-chevron ${isOpen ? 'open' : ''}`} />
                                  </button>
                                  {isOpen && (
                                    <div className="flow-completion-dropdown-list" role="listbox">
                                      {STEP_COMPLETION_RULE_OPTIONS.map((opt) => (
                                        <button
                                          key={opt.value}
                                          type="button"
                                          role="option"
                                          aria-selected={rule.value === opt.value}
                                          className={`flow-completion-dropdown-option ${rule.value === opt.value ? 'selected' : ''}`}
                                          onClick={() => {
                                            setStepCompletionRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, value: opt.value } : r)))
                                            setOpenCompletionDropdownId(null)
                                          }}
                                        >
                                          {opt.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <button type="button" className="flow-completion-add-rule" onClick={() => setStepCompletionRules((prev) => [...prev, { id: Date.now(), value: 'on-click-of-selected-element' }])}>
                          <Plus size={14} />
                          Add Rule
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="studio-accordion flow-config-accordion-item">
                <button className="accordion-header" onClick={() => setConfigAdditionalOptionsExpanded(!configAdditionalOptionsExpanded)}>
                  <span className="accordion-title">Additional Options</span>
                  {configAdditionalOptionsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {configAdditionalOptionsExpanded && (
                  <div className="accordion-body flow-additional-options">
                    <div className="flow-additional-option-row">
                      <label className="flow-additional-option-label">Make this an optional step</label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={optionalStep}
                        className={`flow-toggle ${optionalStep ? 'on' : ''}`}
                        onClick={() => setOptionalStep((v) => !v)}
                      >
                        <span className="flow-toggle-knob" />
                      </button>
                    </div>
                    <div className="flow-additional-option-row">
                      <label className="flow-additional-option-label">Show as spotlight</label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={showAsSpotlight}
                        className={`flow-toggle ${showAsSpotlight ? 'on' : ''}`}
                        onClick={() => setShowAsSpotlight((v) => !v)}
                      >
                        <span className="flow-toggle-knob" />
                      </button>
                    </div>
                    <hr className="flow-additional-options-divider" />
                    <div className="flow-censor-section">
                      <div className="flow-censor-heading">
                        <span className="flow-censor-title">Censor sensitive info</span>
                        <span className="flow-censor-sublabel">Select areas to censor</span>
                      </div>
                      <button type="button" className="flow-censor-select-btn">Select</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
          )}

          {activeTab === 'visibility rules' && (
            <div className="flow-config-accordions">
              <div className="studio-accordion flow-config-accordion-item">
                <button className="accordion-header" onClick={() => setWhereExpanded(!whereExpanded)}>
                  <span className="accordion-title">Where does the flow appear</span>
                  {whereExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {whereExpanded && (
                  <div className="accordion-body">
                    <p className="config-placeholder-text">Configure where the flow will appear in the app.</p>
                          <div className="where-conditions">
                            {whereConditions.map((cond) => (
                              <div key={cond.id} className="where-condition-card">
                                <div className="where-condition-header">
                                  <span className="where-condition-label">Condition {whereConditions.findIndex(c => c.id === cond.id) + 1}</span>
                                  <button type="button" className="where-condition-delete" onClick={() => whereConditions.length > 1 && setWhereConditions(whereConditions.filter(c => c.id !== cond.id))} aria-label="Delete condition">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="where-condition-row">
                                  <label className="where-condition-show-label">Show on</label>
                                  <div className="where-condition-select-wrap">
                                    <div className="where-showon-dropdown">
                                      {(() => {
                                        const availableOptions = WHERE_SHOW_ON_OPTIONS.filter(opt => opt.value === cond.showOn || !whereConditions.some(c => c.id !== cond.id && c.showOn === opt.value))
                                        const selectedOption = WHERE_SHOW_ON_OPTIONS.find(o => o.value === cond.showOn)
                                        const isOpen = openWhereDropdownId === cond.id
                                        return (
                                          <>
                                            <button type="button" className={`where-showon-trigger ${cond.showOn ? 'has-value' : ''}`} onClick={() => setOpenWhereDropdownId(isOpen ? null : cond.id)} aria-expanded={isOpen}>
                                              <span className="where-showon-trigger-text">{selectedOption ? selectedOption.label : 'Select'}</span>
                                              <ChevronDown size={16} className={`where-showon-chevron ${isOpen ? 'open' : ''}`} />
                                            </button>
                                            {isOpen && (
                                              <div className="where-showon-list" role="listbox">
                                                {availableOptions.map((opt) => {
                                                  const Icon = opt.Icon
                                                  return (
                                                    <button key={opt.value} type="button" role="option" aria-selected={cond.showOn === opt.value} className={`where-showon-option ${cond.showOn === opt.value ? 'selected' : ''}`}
                                                      onClick={() => { setWhereConditions(whereConditions.map(c => c.id === cond.id ? { ...c, showOn: opt.value } : c)); setOpenWhereDropdownId(null); }}>
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
                                          </>
                                        )
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button type="button" className="where-add-condition-btn" onClick={() => setWhereConditions([...whereConditions, { id: Date.now(), showOn: '' }])}>
                              <Plus size={14} /> Add condition
                            </button>
                          </div>
                  </div>
                )}
              </div>

              <div className="studio-accordion flow-config-accordion-item">
                <button className="accordion-header" onClick={() => setWhenExpanded(!whenExpanded)}>
                  <span className="accordion-title">When does the flow start and stop appearing</span>
                  {whenExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {whenExpanded && (
                  <div className="accordion-body">
                    <p className="config-placeholder-text">Set the timing rules for when the flow starts and stops appearing.</p>
                          <div className="when-conditions">
                            {whenStartConditions.map((cond) => (
                              <div key={cond.id} className="when-condition-card">
                                <div className="when-condition-header">
                                  <span className="when-condition-label">Start condition {whenStartConditions.findIndex(c => c.id === cond.id) + 1}</span>
                                  <button type="button" className="when-condition-delete" onClick={() => whenStartConditions.length > 1 && setWhenStartConditions(whenStartConditions.filter(c => c.id !== cond.id))} aria-label="Delete"><Trash2 size={14} /></button>
                                </div>
                                <div className="when-condition-row">
                                  <label className="when-condition-cause-label">What causes the flow to appear?</label>
                                  <div className="when-condition-select-wrap">
                                    <div className="when-cause-dropdown">
                                      {(() => {
                                        const availableOptions = WHEN_CAUSE_OPTIONS.filter(opt => opt.value === cond.cause || !whenStartConditions.some(c => c.id !== cond.id && c.cause === opt.value))
                                        const selectedOption = WHEN_CAUSE_OPTIONS.find(o => o.value === cond.cause)
                                        const isOpen = openWhenDropdownId === cond.id
                                        return (
                                          <>
                                            <button type="button" className={`when-cause-trigger ${cond.cause ? 'has-value' : ''}`} onClick={() => setOpenWhenDropdownId(isOpen ? null : cond.id)}>
                                              <span className="when-cause-trigger-text">{selectedOption ? selectedOption.label : 'Select'}</span>
                                              <ChevronDown size={16} className={`when-cause-chevron ${isOpen ? 'open' : ''}`} />
                                            </button>
                                            {isOpen && (
                                              <div className="when-cause-list" role="listbox">
                                                {availableOptions.map((opt) => {
                                                  const CauseIcon = opt.Icon
                                                  return (
                                                    <button key={opt.value} type="button" role="option" className={`when-cause-option ${cond.cause === opt.value ? 'selected' : ''}`}
                                                      onClick={() => { setWhenStartConditions(whenStartConditions.map(c => c.id === cond.id ? { ...c, cause: opt.value } : c)); setOpenWhenDropdownId(null); }}>
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
                                </div>
                              </div>
                            ))}
                            <button type="button" className="when-add-condition-btn" onClick={() => setWhenStartConditions([...whenStartConditions, { id: Date.now(), cause: '' }])}>
                              <Plus size={14} /> Add condition
                            </button>
                          </div>
                  </div>
                )}
              </div>

              <div className="studio-accordion flow-config-accordion-item">
                <button className="accordion-header" onClick={() => setWhoExpanded(!whoExpanded)}>
                  <span className="accordion-title">Who does the flow appear to</span>
                  {whoExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {whoExpanded && (
                  <div className="accordion-body">
                    <p className="config-placeholder-text">Define the audience targeting rules for this flow.</p>
                          <div className="who-conditions">
                            {whoConditions.map((cond) => (
                              <div key={cond.id} className="who-condition-card">
                                <div className="who-condition-header">
                                  <span className="who-condition-label">Condition {whoConditions.findIndex(c => c.id === cond.id) + 1}</span>
                                  <button type="button" className="who-condition-delete" onClick={() => whoConditions.length > 1 && setWhoConditions(whoConditions.filter(c => c.id !== cond.id))} aria-label="Delete"><Trash2 size={14} /></button>
                                </div>
                                <div className="who-condition-row">
                                  <label className="who-condition-identify-label">How would you like to identify the user?</label>
                                  <div className="who-condition-select-wrap">
                                    <div className="who-identify-dropdown">
                                      {(() => {
                                        const availableOptions = WHO_IDENTIFY_OPTIONS.filter(opt => opt.value === cond.identifyBy || !whoConditions.some(c => c.id !== cond.id && c.identifyBy === opt.value))
                                        const selectedOption = WHO_IDENTIFY_OPTIONS.find(o => o.value === cond.identifyBy)
                                        const isOpen = openWhoDropdownId === cond.id
                                        return (
                                          <>
                                            <button type="button" className={`who-identify-trigger ${cond.identifyBy ? 'has-value' : ''}`} onClick={() => setOpenWhoDropdownId(isOpen ? null : cond.id)}>
                                              <span className="who-identify-trigger-text">{selectedOption ? selectedOption.label : 'Select'}</span>
                                              <ChevronDown size={16} className={`who-identify-chevron ${isOpen ? 'open' : ''}`} />
                                            </button>
                                            {isOpen && (
                                              <div className="who-identify-list" role="listbox">
                                                {availableOptions.map((opt) => (
                                                  <button key={opt.value} type="button" role="option" className={`who-identify-option ${cond.identifyBy === opt.value ? 'selected' : ''}`}
                                                    onClick={() => { setWhoConditions(whoConditions.map(c => c.id === cond.id ? { ...c, identifyBy: opt.value } : c)); setOpenWhoDropdownId(null); }}>
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
                            <button type="button" className="who-add-condition-btn" onClick={() => setWhoConditions([...whoConditions, { id: Date.now(), identifyBy: '' }])}>
                              <Plus size={14} /> Add condition
                            </button>
                          </div>
                  </div>
                )}
              </div>
            </div>
          )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="studio-header">
        <div className="header-top">
          <div className="studio-breadcrumb">
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="breadcrumb-link">All content</a>
            <span className="breadcrumb-sep">/</span>
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="breadcrumb-link">Create content</a>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{flowName.trim() || 'Untitled Flow'}</span>
          </div>
          <div className="header-main">
            <button className="back-button" onClick={onClose}><ChevronLeft size={20} /></button>
            <input
              type="text"
              className={`studio-title-input flow-studio-title-input ${flowName.trim() ? 'has-value' : ''}`}
              placeholder="Untitled Flow"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              aria-label="Flow name"
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
              <button type="button" className="preview-button">
                <CaptureIcon />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="studio-footer">
        <div className="footer-actions">
          <button type="button" className="btn-discard" onClick={onClose}>
            Discard changes
          </button>
          <button
            type="button"
            className="btn-save"
            onClick={() => {
              const name = flowName.trim()
              if (!name) {
                setSnackbarMessage('Flow cannot be saved without a title')
                return
              }
              if (typeof onSave === 'function') {
                onSave({
                  name,
                  type: 'Flow',
                  id: editItem?.id,
                  creationSnapshot: {
                    kind: 'flow',
                    v: FLOW_STUDIO_SNAPSHOT_V,
                    activeTab,
                    creationStage,
                    flowPanelView,
                    stepConfigId,
                    activeStepId,
                    isDevicePaired,
                    isPairing,
                    selectedScreen,
                    flowStepsExpanded,
                    flowSteps,
                    flowName: name,
                    flowDescription,
                    flowTags,
                    flowKeywords,
                    flowAppType,
                    appVersion,
                    whereExpanded,
                    whenExpanded,
                    whoExpanded,
                    whereConditions,
                    whenStartConditions,
                    whoConditions,
                    configAppearanceExpanded,
                    configPositionExpanded,
                    configStepCompletionExpanded,
                    configAdditionalOptionsExpanded,
                    flowWidgetType,
                    tooltipColor,
                    tooltipCloseColor,
                    tooltipPosition,
                    completionMode,
                    stepCompletionRules,
                    optionalStep,
                    showAsSpotlight,
                  },
                })
              }
              onClose()
            }}
          >
            Save
          </button>
        </div>
      </div>

      {snackbarMessage && (
        <div className="flow-snackbar" role="alert">
          <span>{snackbarMessage}</span>
          <button type="button" className="flow-snackbar-dismiss" aria-label="Dismiss" onClick={() => setSnackbarMessage(null)}>×</button>
        </div>
      )}
    </div>
  )
}

export default FlowStudio
