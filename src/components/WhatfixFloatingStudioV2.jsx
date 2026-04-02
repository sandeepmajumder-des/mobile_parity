import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bluetooth,
  ChevronDown,
  Globe,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Paintbrush,
  Plus,
  Redo2,
  Star,
  Trash2,
  Undo2,
} from 'lucide-react'
import './WhatfixFloatingStudioV2.css'

const STUDIO_CSS_URL = '/studio-overlay-v2.css'
const STUDIO_JS_URL = '/studio-overlay-v2.js'

const PAIR_LOAD_MS = 2000

/** Dummy food listings — level-3 items grouped under level-2 sections. */
const FOOD_SECTIONS = [
  {
    id: 'popular',
    title: 'Popular near you',
    items: [
      {
        id: 'marios',
        name: "Mario's Pizza",
        meta: 'Italian · 25 min',
        price: '$$',
        emoji: '🍕',
        rating: 4.5,
        reviews: 234,
        minOrder: '$15',
        menu: [
          { name: 'Margherita', desc: 'Tomato, mozzarella, fresh basil', price: '$12.99' },
          { name: 'Pepperoni', desc: 'Classic pepperoni & cheese', price: '$14.99' },
          { name: 'Garlic bread', desc: 'Herb butter, crispy bake', price: '$5.99' },
        ],
      },
      {
        id: 'burger-barn',
        name: 'Burger Barn',
        meta: 'American · 20 min',
        price: '$',
        emoji: '🍔',
        rating: 4.3,
        reviews: 189,
        minOrder: '$10',
        menu: [
          { name: 'Classic cheeseburger', desc: 'Beef patty, cheddar, pickles', price: '$9.99' },
          { name: 'Crispy chicken', desc: 'Buttermilk fried chicken', price: '$10.99' },
          { name: 'Fries', desc: 'Sea salt, large', price: '$3.99' },
        ],
      },
    ],
  },
  {
    id: 'quick',
    title: 'Quick bites',
    items: [
      {
        id: 'tokyo-bowl',
        name: 'Tokyo Bowl',
        meta: 'Japanese · 15 min',
        price: '$$',
        emoji: '🍜',
        rating: 4.7,
        reviews: 112,
        minOrder: '$12',
        menu: [
          { name: 'Tonkotsu ramen', desc: 'Rich pork broth, chashu', price: '$13.99' },
          { name: 'Chicken teriyaki bowl', desc: 'Steamed rice, veg', price: '$11.99' },
        ],
      },
      {
        id: 'green-leaf',
        name: 'Green Leaf',
        meta: 'Salads · 12 min',
        price: '$',
        emoji: '🥗',
        rating: 4.4,
        reviews: 98,
        minOrder: '$8',
        menu: [
          { name: 'Caesar salad', desc: 'Romaine, parmesan, croutons', price: '$8.99' },
          { name: 'Grain bowl', desc: 'Quinoa, roasted veg, tahini', price: '$10.99' },
        ],
      },
    ],
  },
]

function getRestaurantById(id) {
  for (const section of FOOD_SECTIONS) {
    const found = section.items.find((item) => item.id === id)
    if (found) return found
  }
  return null
}

const WF2_TOUR_TIP_W = 224
const WF2_TOUR_TIP_H = 168
const WF2_TOUR_GAP = 8
const WF2_TOUR_PAD = 8
const WF2_TOUR_BEAK_INSET = 22

/**
 * Places a walkthrough tooltip under (or above) the anchor with a beak pointing at the
 * element center. Beak horizontal offset is clamped so it stays on the tooltip edge.
 */
function FlowTourTooltipCard({ pickTooltip, onDismiss }) {
  return (
    <div className="wf2-flow-tour-tooltip-card">
      <div className="wf2-flow-tour-head">
        <span className="wf2-flow-tour-step" aria-live="polite">
          {pickTooltip.stepNumber != null && pickTooltip.totalWithEnd != null
            ? `${pickTooltip.stepNumber}/${pickTooltip.totalWithEnd}`
            : '…'}
        </span>
        <button type="button" className="wf2-flow-tour-close" aria-label="Dismiss" onClick={onDismiss}>
          ×
        </button>
      </div>
      <p className="wf2-flow-tour-title">{pickTooltip.label}</p>
      <p className="wf2-flow-tour-desc">Optional note section</p>
      <div className="wf2-flow-tour-actions">
        <button type="button" className="wf2-flow-tour-next" onClick={onDismiss}>
          Next
        </button>
      </div>
    </div>
  )
}

function computeTourTooltipLayout(stageEl, targetEl, tipW = WF2_TOUR_TIP_W, tipH = WF2_TOUR_TIP_H) {
  const sr = stageEl.getBoundingClientRect()
  const er = targetEl.getBoundingClientRect()
  const relLeft = er.left - sr.left
  const relTop = er.top - sr.top
  const relW = er.width
  const relH = er.height
  const anchorCx = relLeft + relW / 2
  const pad = WF2_TOUR_PAD
  const gap = WF2_TOUR_GAP
  const inset = WF2_TOUR_BEAK_INSET

  let placement = 'below'
  let top = relTop + relH + gap
  if (top + tipH > sr.height - pad) {
    placement = 'above'
    top = relTop - tipH - gap
  }
  top = Math.max(pad, Math.min(top, sr.height - tipH - pad))

  let left = anchorCx - tipW / 2
  left = Math.max(pad, Math.min(left, sr.width - tipW - pad))

  let beakX = anchorCx - left
  beakX = Math.max(inset, Math.min(beakX, tipW - inset))

  return { left, top, width: tipW, beakX, placement }
}

function RestaurantDetailScreen({ restaurant, onBack, flowSelectActive, onSelectTarget }) {
  return (
    <div className="wf2-food-app wf2-food-app--detail">
      <header className="wf2-food-detail-header">
        <button
          type="button"
          className="wf2-food-detail-back"
          data-wf2-el="Back"
          onClick={(e) => {
            if (flowSelectActive) {
              e.preventDefault()
              e.stopPropagation()
              onSelectTarget?.(e.currentTarget, 'Back')
              return
            }
            onBack()
          }}
          aria-label="Back to restaurants"
        >
          <ArrowLeft size={20} strokeWidth={2.25} />
        </button>
        <span className="wf2-food-detail-header-title">Restaurant</span>
        <span className="wf2-food-detail-header-spacer" aria-hidden />
      </header>

      <div className="wf2-food-detail-scroll">
        {/* Level 1 — Venue hero */}
        <div
          className="wf2-food-detail-hero"
          data-wf2-el={restaurant.name}
          onClick={(e) => {
            if (!flowSelectActive) return
            e.preventDefault()
            e.stopPropagation()
            onSelectTarget?.(e.currentTarget, `Restaurant: ${restaurant.name}`)
          }}
          role={flowSelectActive ? 'button' : undefined}
        >
          <div className="wf2-food-detail-hero-emoji" aria-hidden>
            {restaurant.emoji}
          </div>
          <h1 className="wf2-food-detail-name">{restaurant.name}</h1>
          <p className="wf2-food-detail-meta">{restaurant.meta}</p>
          <div className="wf2-food-detail-stats">
            <span className="wf2-food-detail-rating">
              <Star size={14} fill="currentColor" strokeWidth={0} aria-hidden />
              {restaurant.rating}
            </span>
            <span className="wf2-food-detail-dot" aria-hidden>
              ·
            </span>
            <span>{restaurant.reviews} reviews</span>
            <span className="wf2-food-detail-dot" aria-hidden>
              ·
            </span>
            <span>Min {restaurant.minOrder}</span>
          </div>
        </div>

        {/* Level 2 — Menu section */}
        <section className="wf2-food-detail-menu-section" aria-labelledby="wf2-menu-heading">
          <h2
            id="wf2-menu-heading"
            className="wf2-food-l2-title wf2-food-l2-title--detail"
            data-wf2-el="Menu"
            onClick={(e) => {
              if (!flowSelectActive) return
              e.preventDefault()
              e.stopPropagation()
              onSelectTarget?.(e.currentTarget, 'Menu section')
            }}
          >
            Menu
          </h2>
          {/* Level 3 — Dishes */}
          <ul className="wf2-food-menu-list">
            {restaurant.menu.map((dish) => (
              <li key={dish.name} className="wf2-food-menu-row">
                <div
                  className="wf2-food-menu-row-inner"
                  data-wf2-el={dish.name}
                  onClick={(e) => {
                    if (!flowSelectActive) return
                    e.preventDefault()
                    e.stopPropagation()
                    onSelectTarget?.(e.currentTarget, dish.name)
                  }}
                  role={flowSelectActive ? 'button' : undefined}
                >
                  <div className="wf2-food-menu-row-text">
                    <span className="wf2-food-menu-dish">{dish.name}</span>
                    <span className="wf2-food-menu-desc">{dish.desc}</span>
                  </div>
                  <span className="wf2-food-menu-price">{dish.price}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function FoodAppPreview({ flowSelectActive, onSelectTarget }) {
  const [detailRestaurantId, setDetailRestaurantId] = useState(null)
  const detailRestaurant = detailRestaurantId ? getRestaurantById(detailRestaurantId) : null

  if (detailRestaurant) {
    return (
      <RestaurantDetailScreen
        restaurant={detailRestaurant}
        onBack={() => setDetailRestaurantId(null)}
        flowSelectActive={flowSelectActive}
        onSelectTarget={onSelectTarget}
      />
    )
  }

  return (
    <div className="wf2-food-app">
      {/* Level 1 — App / screen header (brand + context) */}
      <header
        className="wf2-food-l1"
        data-wf2-el="App header"
        onClick={(e) => {
          if (!flowSelectActive) return
          e.preventDefault()
          e.stopPropagation()
          onSelectTarget?.(e.currentTarget, 'App header')
        }}
        role={flowSelectActive ? 'button' : undefined}
      >
        <div className="wf2-food-l1-top">
          <span className="wf2-food-logo">🍔</span>
          <div className="wf2-food-l1-text">
            <span className="wf2-food-brand">FoodieExpress</span>
            <span className="wf2-food-tagline">Order in minutes</span>
          </div>
        </div>
        <div
          className="wf2-food-l1-location"
          role="text"
          data-wf2-el="Deliver to"
          onClick={(e) => {
            if (!flowSelectActive) return
            e.preventDefault()
            e.stopPropagation()
            onSelectTarget?.(e.currentTarget, 'Deliver to')
          }}
        >
          <span className="wf2-food-pin" aria-hidden>📍</span>
          <span>Deliver to</span>
          <span className="wf2-food-l1-address">123 Main St · Apt 4B</span>
          <span className="wf2-food-chevron" aria-hidden>▼</span>
        </div>
      </header>

      <div className="wf2-food-scroll">
        {FOOD_SECTIONS.map((section) => (
          <section key={section.id} className="wf2-food-l2" aria-labelledby={`wf2-sec-${section.id}`}>
            {/* Level 2 — Section / category grouping */}
            <h2
              id={`wf2-sec-${section.id}`}
              className="wf2-food-l2-title"
              data-wf2-el={section.title}
              onClick={(e) => {
                if (!flowSelectActive) return
                e.preventDefault()
                e.stopPropagation()
                onSelectTarget?.(e.currentTarget, section.title)
              }}
            >
              {section.title}
            </h2>
            <ul className="wf2-food-l3-list">
              {section.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="wf2-food-l3-card"
                    data-wf2-el={item.name}
                    onClick={(e) => {
                      if (flowSelectActive) {
                        e.preventDefault()
                        e.stopPropagation()
                        onSelectTarget?.(e.currentTarget, item.name)
                        return
                      }
                      setDetailRestaurantId(item.id)
                    }}
                  >
                    <div className="wf2-food-l3-thumb" aria-hidden>
                      <span>{item.emoji}</span>
                    </div>
                    <div className="wf2-food-l3-body">
                      <span className="wf2-food-l3-name">{item.name}</span>
                      <span className="wf2-food-l3-meta">{item.meta}</span>
                    </div>
                    <span className="wf2-food-l3-price">{item.price}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function wf2TemplateVariant(templateId) {
  const m = String(templateId || '').match(/-(\d+)$/)
  const n = m ? Number(m[1]) : 1
  return Number.isFinite(n) && n >= 1 ? n : 1
}

function wf2TextFallback(value, fallback) {
  if (typeof value !== 'string') return fallback
  const stripped = value.replace(/<[^>]*>/g, '').trim()
  return stripped || fallback
}

const WF2_POPUP_STYLE_DEFAULTS = {
  bgColor: '#ffffff',
  textColor: '#111827',
  accentColor: '#c84900',
  borderColor: '#e5e7eb',
  radius: 12,
  shadow: true,
  compact: false,
  ctaStyle: 'solid',
}

function wf2ResolvePopupStyle(contentStyle, isDark) {
  const dark = {
    bgColor: '#0f172a',
    textColor: '#e5e7eb',
    accentColor: '#fb923c',
    borderColor: '#334155',
  }
  return {
    ...WF2_POPUP_STYLE_DEFAULTS,
    ...(isDark ? dark : {}),
    ...(contentStyle && typeof contentStyle === 'object' ? contentStyle : {}),
  }
}

function wf2WidgetLabel(widgetKind) {
  if (widgetKind === 'smart-tip') return 'Smart Tip'
  if (widgetKind === 'beacon') return 'Beacon'
  return 'Popup'
}

function wf2PreviewLayoutForWidget(widgetKind, typeId) {
  if (!typeId) return 'overlay'
  if (widgetKind === 'smart-tip') {
    if (typeId === 'inline') return 'banner'
    if (typeId === 'tooltip') return 'snackbar'
    return 'overlay'
  }
  if (widgetKind === 'beacon') {
    if (typeId === 'pulse') return 'overlay'
    if (typeId === 'ring') return 'fullscreen'
    if (typeId === 'dot') return 'snackbar'
    if (typeId === 'badge') return 'banner'
    if (typeId === 'spotlight') return 'carousel'
    if (typeId === 'nudge') return 'drawer'
  }
  return typeId
}

function wf2DefaultWidgetSelection(widgetKind) {
  if (widgetKind === 'smart-tip') {
    return { typeId: 'anchored', templateId: 'anchored-1' }
  }
  if (widgetKind === 'beacon') {
    return { typeId: 'pulse', templateId: 'pulse-1' }
  }
  return { typeId: 'overlay', templateId: 'overlay-1' }
}

function MobilePopupWidgetPreview({ popup, onContentChange }) {
  if (!popup || !popup.typeId) return null
  const widgetKind = popup.widgetKind || 'popup'
  if (widgetKind === 'beacon' && !(popup.anchorPosition && typeof popup.anchorPosition === 'object')) {
    return null
  }
  const type = wf2PreviewLayoutForWidget(widgetKind, popup.typeId)
  const widgetLabel = wf2WidgetLabel(widgetKind)
  const variant = wf2TemplateVariant(popup.templateId)
  const isDark = variant === 2
  const toneClass = isDark ? 'wf2-popup-widget--dark' : 'wf2-popup-widget--light'
  const alignClass = variant === 5 ? 'wf2-popup-widget--left' : variant === 6 ? 'wf2-popup-widget--right' : ''
  const withIcon = variant === 4
  const btnCount = variant === 4 ? 3 : variant === 3 ? 2 : 1
  const showDots = type === 'carousel'
  const c = popup.content || {}
  const popupStyle = wf2ResolvePopupStyle(c.style, isDark)
  const titleText = wf2TextFallback(c.title, popup.name || `${widgetLabel} preview`)
  const bodyText = wf2TextFallback(c.body, `Template: ${popup.templateId}`)
  const primaryText = wf2TextFallback(c.primaryCta, 'Learn more')
  const secondaryText = wf2TextFallback(c.secondaryCta, 'Later')
  const tertiaryText = wf2TextFallback(c.tertiaryCta, 'Dismiss')
  const [activeField, setActiveField] = useState(null)
  const [toolbarPos, setToolbarPos] = useState(null)
  const isCtaField = activeField === 'primaryCta' || activeField === 'secondaryCta' || activeField === 'tertiaryCta'

  const updateField = useCallback((field, html) => {
    onContentChange?.({ ...popup.content, [field]: html })
  }, [onContentChange, popup.content])

  const updateStyle = useCallback((patch) => {
    const nextStyle = { ...popupStyle, ...patch }
    onContentChange?.({ ...popup.content, style: nextStyle })
  }, [onContentChange, popup.content, popupStyle])

  const applyCommand = useCallback((cmd, value = null) => {
    document.execCommand(cmd, false, value)
  }, [])

  const cycle = (current, values) => values[(values.indexOf(current) + 1 + values.length) % values.length]

  const placeToolbarNear = useCallback((el) => {
    if (!(el instanceof HTMLElement)) return
    const r = el.getBoundingClientRect()
    const toolbarW = isCtaField ? 220 : 760
    const margin = 10
    let left = r.left
    if (left + toolbarW > window.innerWidth - margin) left = window.innerWidth - toolbarW - margin
    if (left < margin) left = margin
    let top = r.top - 44
    if (top < margin) top = r.bottom + 10
    setToolbarPos({ left, top })
  }, [isCtaField])

  useEffect(() => {
    if (!activeField) {
      setToolbarPos(null)
      return
    }
    const activeEl = document.querySelector(`[data-wf2-popup-field="${activeField}"]`)
    if (activeEl) placeToolbarNear(activeEl)
    const onReflow = () => {
      const el = document.querySelector(`[data-wf2-popup-field="${activeField}"]`)
      if (el) placeToolbarNear(el)
    }
    window.addEventListener('scroll', onReflow, true)
    window.addEventListener('resize', onReflow)
    return () => {
      window.removeEventListener('scroll', onReflow, true)
      window.removeEventListener('resize', onReflow)
    }
  }, [activeField, placeToolbarNear])

  useEffect(() => {
    if (!activeField) return
    const onDocMouseDown = (e) => {
      const phone = document.querySelector('.wf2-phone-screen')
      if (!phone) return
      if (phone.contains(e.target)) return
      setActiveField(null)
      setToolbarPos(null)
    }
    document.addEventListener('mousedown', onDocMouseDown, true)
    return () => document.removeEventListener('mousedown', onDocMouseDown, true)
  }, [activeField])

  const Editable = ({ tag = 'div', className, field, fallback, ariaLabel }) => {
    const Comp = tag
    const html = typeof c[field] === 'string' ? c[field] : fallback
    return (
      <Comp
        className={`${className} wf2-popup-editable ${activeField === field ? 'is-active' : ''}`}
        contentEditable
        suppressContentEditableWarning
        data-wf2-popup-field={field}
        dangerouslySetInnerHTML={{ __html: html }}
        aria-label={ariaLabel}
        onFocus={() => setActiveField(field)}
        onClick={(e) => placeToolbarNear(e.currentTarget)}
        onBlur={() => setActiveField(null)}
        onInput={(e) => {
          updateField(field, e.currentTarget.innerHTML)
          placeToolbarNear(e.currentTarget)
        }}
      />
    )
  }

  if (widgetKind === 'smart-tip') {
    return (
      <div className={`wf2-widget-layer wf2-widget-layer--smart-tip wf2-widget-layer--${type}`} aria-live="polite">
        {type === 'snackbar' ? (
          <div className="wf2-smart-tip-tooltip">
            <span className="wf2-smart-tip-target" aria-hidden />
            <div className="wf2-smart-tip-bubble">
              <span className="wf2-smart-tip-title">{titleText}</span>
            </div>
          </div>
        ) : type === 'banner' ? (
          <div className="wf2-smart-tip-inline">
            <span className="wf2-smart-tip-inline-text">{titleText}</span>
          </div>
        ) : (
          <div className="wf2-smart-tip-anchored">
            <span className="wf2-smart-tip-target" aria-hidden />
            <div className="wf2-smart-tip-bubble">
              <span className="wf2-smart-tip-title">{titleText}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (widgetKind === 'beacon') {
    const anchor = popup.anchorPosition && typeof popup.anchorPosition === 'object' ? popup.anchorPosition : null
    const beaconStyle = anchor
      ? { left: `${anchor.x}px`, top: `${anchor.y}px`, transform: 'translate(-50%, -50%)' }
      : undefined
    return (
      <div className={`wf2-widget-layer wf2-widget-layer--beacon wf2-widget-layer--${type}`} aria-live="polite">
        <span className={`wf2-beacon wf2-beacon--${popup.typeId}`} style={beaconStyle} aria-hidden />
      </div>
    )
  }

  return (
    <div className={`wf2-popup-layer wf2-popup-layer--${type} wf2-popup-layer--kind-${widgetKind.replace(/[^a-z0-9-]/gi, '').toLowerCase()}`} aria-live="polite">
      <div
        className={`wf2-popup-widget ${toneClass} ${alignClass} wf2-popup-density-${popupStyle.compact ? 'compact' : 'comfortable'} wf2-popup-cta-style-${popupStyle.ctaStyle}`}
        style={{
          '--wf2-popup-bg': popupStyle.bgColor,
          '--wf2-popup-fg': popupStyle.textColor,
          '--wf2-popup-accent': popupStyle.accentColor,
          '--wf2-popup-border': popupStyle.borderColor,
          '--wf2-popup-radius': `${popupStyle.radius}px`,
          '--wf2-popup-shadow': popupStyle.shadow ? '0 10px 24px rgba(0, 0, 0, 0.18)' : 'none',
        }}
      >
        {activeField && (isCtaField ? (
          <div
            className="wf2-popup-editor-toolbar wf2-popup-editor-toolbar--cta"
            role="toolbar"
            aria-label="CTA rich text editor"
            style={toolbarPos ? { left: `${toolbarPos.left}px`, top: `${toolbarPos.top}px` } : undefined}
          >
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('bold')}><b>B</b></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('italic')}><i>I</i></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('underline')}><u>U</u></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('foreColor', '#f97316')}><Paintbrush size={14} /></button>
            <button type="button" className="wf2-popup-editor-btn wf2-popup-editor-btn--size" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('fontSize', '3')}>
              14 <ChevronDown size={12} />
            </button>
            <span className="wf2-popup-editor-sep" />
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle({ ctaStyle: cycle(popupStyle.ctaStyle, ['solid', 'outline', 'soft']) })}>CTA</button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle({ compact: !popupStyle.compact })}>↕</button>
          </div>
        ) : (
          <div className="wf2-popup-editor-toolbar wf2-popup-editor-toolbar--full" role="toolbar" aria-label="Popup rich text editor" style={toolbarPos ? { left: `${toolbarPos.left}px`, top: `${toolbarPos.top}px` } : undefined}>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} title="Insert block"><Plus size={13} /></button>
            <button type="button" className="wf2-popup-editor-btn wf2-popup-editor-btn--size" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('fontSize', '3')}>14 <ChevronDown size={12} /></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('foreColor', '#f97316')} title="Text color"><Paintbrush size={14} /></button>
            <span className="wf2-popup-editor-sep" />
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('bold')} title="Bold"><b>B</b></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('italic')} title="Italic"><i>I</i></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('underline')} title="Underline"><u>U</u></button>
            <span className="wf2-popup-editor-sep" />
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('insertUnorderedList')} title="Bulleted list"><List size={14} /></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('insertOrderedList')} title="Numbered list"><ListOrdered size={14} /></button>
            <span className="wf2-popup-editor-sep" />
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('justifyLeft')} title="Align left"><AlignLeft size={14} /></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('justifyCenter')} title="Align center"><AlignCenter size={14} /></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('justifyRight')} title="Align right"><AlignRight size={14} /></button>
            <span className="wf2-popup-editor-sep" />
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle({ bgColor: cycle(popupStyle.bgColor, ['#ffffff', '#f8fafc', '#fef3c7', '#0f172a']) })} title="Background">BG</button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle({ textColor: cycle(popupStyle.textColor, ['#111827', '#1f2937', '#e5e7eb']) })} title="Text color">Tx</button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle({ accentColor: cycle(popupStyle.accentColor, ['#c84900', '#2563eb', '#16a34a', '#d946ef']) })} title="Accent">Ac</button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle({ radius: cycle(popupStyle.radius, [6, 10, 12, 16, 22]) })} title="Corner radius">◰</button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle({ shadow: !popupStyle.shadow })} title="Shadow">◫</button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle({ compact: !popupStyle.compact })} title="Density">↕</button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle({ ctaStyle: cycle(popupStyle.ctaStyle, ['solid', 'outline', 'soft']) })} title="CTA style">CTA</button>
            <span className="wf2-popup-editor-sep" />
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => { const url = window.prompt('Enter link URL'); if (url) applyCommand('createLink', url) }} title="Link"><Link2 size={14} /></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('undo')} title="Undo"><Undo2 size={14} /></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('redo')} title="Redo"><Redo2 size={14} /></button>
            <button type="button" className="wf2-popup-editor-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('removeFormat')} title="Clear formatting"><Trash2 size={14} /></button>
          </div>
        ))}

        {(type === 'overlay' || type === 'fullscreen' || type === 'bottomsheet' || type === 'drawer') && (
          <>
            <div className="wf2-popup-head">
              {withIcon && <span className="wf2-popup-icon" aria-hidden>i</span>}
              <div className="wf2-popup-head-text">
                <Editable tag="p" className="wf2-popup-title" field="title" fallback={titleText} ariaLabel="Popup title" />
                <Editable tag="p" className="wf2-popup-copy" field="body" fallback={bodyText} ariaLabel="Popup body" />
              </div>
              <button type="button" className="wf2-popup-close" aria-label="Close">×</button>
            </div>
            <div className={`wf2-popup-actions wf2-popup-actions--${btnCount}`}>
              <button type="button" className="wf2-popup-btn wf2-popup-btn--ghost">
                <Editable tag="span" className="wf2-popup-btn-text" field="secondaryCta" fallback={secondaryText} ariaLabel="Secondary CTA" />
              </button>
              {btnCount >= 2 && (
                <button type="button" className="wf2-popup-btn wf2-popup-btn--primary">
                  <Editable tag="span" className="wf2-popup-btn-text" field="primaryCta" fallback={primaryText} ariaLabel="Primary CTA" />
                </button>
              )}
              {btnCount >= 3 && (
                <button type="button" className="wf2-popup-btn wf2-popup-btn--ghost">
                  <Editable tag="span" className="wf2-popup-btn-text" field="tertiaryCta" fallback={tertiaryText} ariaLabel="Tertiary CTA" />
                </button>
              )}
            </div>
          </>
        )}

        {type === 'carousel' && (
          <>
            <div className="wf2-popup-carousel-row">
              <article className="wf2-popup-carousel-card">
                <Editable tag="h4" className="wf2-popup-carousel-title" field="title" fallback={titleText} ariaLabel="Carousel title" />
                <Editable tag="p" className="wf2-popup-carousel-copy" field="body" fallback={bodyText} ariaLabel="Carousel body" />
              </article>
              <article className="wf2-popup-carousel-card wf2-popup-carousel-card--fade" aria-hidden>
                <h4>Card 2</h4>
              </article>
            </div>
            {showDots && <div className="wf2-popup-carousel-dots"><span /><span className="is-on" /><span /></div>}
          </>
        )}

        {type === 'snackbar' && (
          <div className="wf2-popup-snackbar-inner">
            {withIcon && <span className="wf2-popup-icon" aria-hidden>✓</span>}
            <Editable tag="span" className="wf2-popup-snack-text" field="title" fallback={titleText} ariaLabel="Snackbar text" />
            {variant !== 3 && <button type="button" className="wf2-popup-snack-action"><Editable tag="span" className="wf2-popup-btn-text" field="primaryCta" fallback={primaryText} ariaLabel="Snackbar action" /></button>}
          </div>
        )}

        {type === 'banner' && (
          <div className="wf2-popup-banner-inner">
            {withIcon && <span className="wf2-popup-icon" aria-hidden>★</span>}
            <Editable tag="span" className="wf2-popup-banner-text" field="title" fallback={titleText} ariaLabel="Banner text" />
            {variant !== 5 && <button type="button" className="wf2-popup-snack-action"><Editable tag="span" className="wf2-popup-btn-text" field="secondaryCta" fallback={secondaryText} ariaLabel="Banner action" /></button>}
          </div>
        )}
      </div>
    </div>
  )
}

function PhonePreview() {
  const [phase, setPhase] = useState('pair')
  const [flowSelectActive, setFlowSelectActive] = useState(false)
  const [flowSelectMode, setFlowSelectMode] = useState('step')
  const [pickTooltip, setPickTooltip] = useState(null)
  const [popupPreview, setPopupPreview] = useState(null)
  const stageRef = useRef(null)

  useEffect(() => {
    if (phase !== 'loading') return undefined
    const t = window.setTimeout(() => setPhase('app'), PAIR_LOAD_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  useEffect(() => {
    const onFlowStep = (e) => {
      const active = Boolean(e.detail?.active)
      setFlowSelectActive(active)
      if (active) {
        setPickTooltip(null)
        const nextMode = e.detail?.mode
        setFlowSelectMode(
          nextMode === 'displayRule' || nextMode === 'smartTipAnchor' || nextMode === 'beaconAnchor'
            ? nextMode
            : 'step'
        )
        if (nextMode === 'beaconAnchor') {
          setPopupPreview((prev) =>
            prev && prev.widgetKind === 'beacon' ? { ...prev, anchorPosition: null } : prev
          )
        }
      } else {
        setFlowSelectMode('step')
      }
    }
    window.addEventListener('wf-flow-step-select', onFlowStep)
    return () => window.removeEventListener('wf-flow-step-select', onFlowStep)
  }, [])

  useEffect(() => {
    const clearLatch = () => setPickTooltip(null)
    window.addEventListener('wf-flow-studio-reset', clearLatch)
    return () => window.removeEventListener('wf-flow-studio-reset', clearLatch)
  }, [])

  useEffect(() => {
    const onWidgetSelected = (e) => {
      const widgetKind = e.detail?.widgetKind || 'popup'
      const widgetLabel = wf2WidgetLabel(widgetKind)
      const defaults = wf2DefaultWidgetSelection(widgetKind)
      setPopupPreview((prev) => ({
        name: prev?.widgetKind === widgetKind && prev?.name ? prev.name : `Untitled ${widgetLabel}`,
        widgetKind,
        typeId: prev?.widgetKind === widgetKind && prev?.typeId ? prev.typeId : defaults.typeId,
        templateId:
          prev?.widgetKind === widgetKind && prev?.templateId ? prev.templateId : defaults.templateId,
        content:
          prev?.widgetKind === widgetKind && prev?.content
            ? prev.content
            : {
                title: `${widgetLabel} preview`,
                body: `Template: ${defaults.templateId}`,
                primaryCta: 'Learn more',
                secondaryCta: 'Later',
                tertiaryCta: 'Dismiss',
              },
      }))
    }
    const onTemplatePicked = (e) => {
      const widgetKind = e.detail?.widgetKind || 'popup'
      const widgetLabel = wf2WidgetLabel(widgetKind)
      const typeId = e.detail?.typeId
      const templateId = e.detail?.templateId
      if (!typeId || !templateId) return
      setPopupPreview((prev) => ({
        name: prev?.name || `Untitled ${widgetLabel}`,
        widgetKind,
        typeId,
        templateId,
        anchorPosition: e.detail?.anchorPosition || prev?.anchorPosition || null,
        content: prev?.content || {
          title: prev?.name || `${widgetLabel} preview`,
          body: `Template: ${templateId}`,
          primaryCta: 'Learn more',
          secondaryCta: 'Later',
          tertiaryCta: 'Dismiss',
        },
      }))
    }
    const onPopupSaved = (e) => {
      const widgetKind = e.detail?.widgetKind || 'popup'
      const widgetLabel = wf2WidgetLabel(widgetKind)
      const typeId = e.detail?.typeId
      const templateId = e.detail?.templateId
      if (!typeId || !templateId) return
      setPopupPreview((prev) => ({
        name: e.detail?.name || `Untitled ${widgetLabel}`,
        widgetKind,
        typeId,
        templateId,
        anchorPosition: e.detail?.anchorPosition || prev?.anchorPosition || null,
        content: e.detail?.content || null,
      }))
    }
    const onWidgetSaved = (e) => {
      const widgetKind = e.detail?.widgetKind || 'popup'
      const widgetLabel = wf2WidgetLabel(widgetKind)
      const typeId = e.detail?.typeId
      const templateId = e.detail?.templateId
      if (!typeId || !templateId) return
      setPopupPreview((prev) => ({
        name: e.detail?.name || `Untitled ${widgetLabel}`,
        widgetKind,
        typeId,
        templateId,
        anchorPosition: e.detail?.anchorPosition || prev?.anchorPosition || null,
        content: e.detail?.content || null,
      }))
    }
    const onPopupContentUpdated = (e) => {
      const typeId = e.detail?.typeId
      const templateId = e.detail?.templateId
      if (!typeId || !templateId) return
      const widgetKind = e.detail?.widgetKind
      setPopupPreview((prev) => ({
        name: e.detail?.name || prev?.name || `Untitled ${wf2WidgetLabel(widgetKind || prev?.widgetKind || 'popup')}`,
        widgetKind: widgetKind || prev?.widgetKind || 'popup',
        typeId,
        templateId,
        anchorPosition: e.detail?.anchorPosition || prev?.anchorPosition || null,
        content: e.detail?.content || prev?.content || null,
      }))
    }
    const onWidgetTemplatePicked = onTemplatePicked
    window.addEventListener('wf-popup-template-selected', onTemplatePicked)
    window.addEventListener('wf-widget-template-selected', onWidgetTemplatePicked)
    window.addEventListener('wf-popup-saved', onPopupSaved)
    window.addEventListener('wf-widget-saved', onWidgetSaved)
    window.addEventListener('wf-popup-content-updated', onPopupContentUpdated)
    window.addEventListener('wf-widget-selected', onWidgetSelected)
    return () => {
      window.removeEventListener('wf-popup-template-selected', onTemplatePicked)
      window.removeEventListener('wf-widget-template-selected', onWidgetTemplatePicked)
      window.removeEventListener('wf-popup-saved', onPopupSaved)
      window.removeEventListener('wf-widget-saved', onWidgetSaved)
      window.removeEventListener('wf-popup-content-updated', onPopupContentUpdated)
      window.removeEventListener('wf-widget-selected', onWidgetSelected)
    }
  }, [])

  useEffect(() => {
    const onPickMeta = (e) => {
      const { label, pickToken, stepNumber, totalWithEnd } = e.detail || {}
      if (label == null) return
      setPickTooltip((prev) => {
        if (!prev || prev.label !== label) return prev
        if (pickToken != null && prev.pickToken !== pickToken) return prev
        return { ...prev, stepNumber, totalWithEnd }
      })
    }
    window.addEventListener('wf-flow-pick-meta', onPickMeta)
    return () => window.removeEventListener('wf-flow-pick-meta', onPickMeta)
  }, [])

  const dismissTourTooltip = useCallback(() => {
    setPickTooltip(null)
  }, [])

  const handlePopupCanvasContentChange = useCallback((content) => {
    setPopupPreview((prev) => {
      if (!prev?.typeId || !prev?.templateId) return prev
      const next = { ...prev, content: { ...content } }
      window.dispatchEvent(
        new CustomEvent('wf-popup-content-updated', {
          detail: {
            name: next.name || 'Untitled Popup',
            widgetKind: next.widgetKind || 'popup',
            typeId: next.typeId,
            templateId: next.templateId,
            content: next.content,
          },
        })
      )
      return next
    })
  }, [])

  /** Step pick: tour tooltip + flow step. Display rule pick: element only (no new step). */
  const openPickAt = useCallback(
    (targetEl, label) => {
      const stage = stageRef.current
      if (!stage || !flowSelectActive || !(targetEl instanceof HTMLElement)) return
      const pickToken = Date.now() + Math.random()
      if (flowSelectMode === 'displayRule') {
        window.dispatchEvent(
          new CustomEvent('wf-flow-element-selected', {
            detail: { label, pickToken, mode: flowSelectMode }
          })
        )
        return
      }
      if (flowSelectMode === 'beaconAnchor') {
        setPickTooltip(null)
        const targetRect = targetEl.getBoundingClientRect()
        const stageRect = stage.getBoundingClientRect()
        const anchorPosition = {
          x: targetRect.left - stageRect.left + targetRect.width / 2,
          y: targetRect.top - stageRect.top + targetRect.height / 2
        }
        setPopupPreview((prev) => ({
          ...(prev || {}),
          name: prev?.name || 'Untitled Beacon',
          widgetKind: 'beacon',
          typeId: 'pulse',
          templateId: 'pulse-1',
          anchorPosition,
          content: prev?.content || {
            title: 'Beacon',
            body: `Latched to ${label}`,
            primaryCta: 'Learn more',
            secondaryCta: 'Later',
            tertiaryCta: 'Dismiss'
          }
        }))
        window.dispatchEvent(
          new CustomEvent('wf-flow-element-selected', {
            detail: { label, pickToken, mode: 'beaconAnchor', anchorPosition }
          })
        )
        return
      }
      const layout = computeTourTooltipLayout(stage, targetEl)
      setPickTooltip({
        label,
        pickToken,
        left: layout.left,
        top: layout.top,
        width: layout.width,
        beakX: layout.beakX,
        placement: layout.placement,
        stepNumber: undefined,
        totalWithEnd: undefined
      })
      if (flowSelectMode === 'smartTipAnchor') {
        window.dispatchEvent(
          new CustomEvent('wf-flow-element-selected', {
            detail: { label, pickToken, mode: 'smartTipAnchor' }
          })
        )
        return
      }
      window.dispatchEvent(
        new CustomEvent('wf-flow-element-selected', { detail: { label, pickToken, mode: 'step' } })
      )
    },
    [flowSelectActive, flowSelectMode]
  )

  const bodyClass =
    phase === 'pair'
      ? 'wf2-phone-body wf2-phone-body--pair'
      : phase === 'loading'
        ? 'wf2-phone-body wf2-phone-body--loading'
        : 'wf2-phone-body wf2-phone-body--app'

  const stageSelectClass =
    flowSelectActive && phase === 'app' ? 'wf2-phone-stage wf2--flow-select' : 'wf2-phone-stage'

  return (
    <div className="wf2-phone">
      <div className="wf2-phone-notch" />
      <div className="wf2-phone-screen">
        <div className="wf2-phone-status">
          <span>9:41</span>
          <span>5G 100%</span>
        </div>
        <div className={stageSelectClass} ref={stageRef}>
          <div className={bodyClass}>
            {phase === 'pair' && (
              <>
                <img
                  className="wf2-pair-visual"
                  src="/pair-device-visual.png"
                  alt=""
                  width={140}
                  height={140}
                  decoding="async"
                />
                <p className="wf2-pair-subtext">Pair your mobile app to create content</p>
                <button
                  type="button"
                  className="wf2-pair-cta"
                  onClick={() => setPhase('loading')}
                >
                  <Bluetooth size={18} strokeWidth={2.25} aria-hidden />
                  <span>Pair device</span>
                </button>
              </>
            )}
            {phase === 'loading' && (
              <div className="wf2-pair-loading" role="status" aria-live="polite">
                <Loader2 className="wf2-pair-loading-icon" size={36} strokeWidth={2.5} aria-hidden />
                <p className="wf2-pair-loading-text">Pairing with your device…</p>
              </div>
            )}
            {phase === 'app' && (
              <FoodAppPreview flowSelectActive={flowSelectActive} onSelectTarget={openPickAt} />
            )}
          </div>
          {phase === 'app' && popupPreview && popupPreview.widgetKind !== 'smart-tip' && (
            <MobilePopupWidgetPreview popup={popupPreview} onContentChange={handlePopupCanvasContentChange} />
          )}
          {pickTooltip && (
            <div
              className={`wf2-flow-tour-tooltip wf2-flow-tour-tooltip--${pickTooltip.placement || 'below'}`}
              style={{
                left: pickTooltip.left,
                top: pickTooltip.top,
                width: pickTooltip.width,
                '--wf2-tour-beak-x': `${pickTooltip.beakX ?? pickTooltip.width / 2}px`
              }}
              role="dialog"
              aria-label="Flow step"
            >
              {(pickTooltip.placement || 'below') === 'above' ? (
                <>
                  <FlowTourTooltipCard pickTooltip={pickTooltip} onDismiss={dismissTourTooltip} />
                  <div className="wf2-flow-tour-tooltip-beak" aria-hidden />
                </>
              ) : (
                <>
                  <div className="wf2-flow-tour-tooltip-beak" aria-hidden />
                  <FlowTourTooltipCard pickTooltip={pickTooltip} onDismiss={dismissTourTooltip} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WhatfixFloatingStudioV2() {
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [isStudioReady, setIsStudioReady] = useState(false)

  useEffect(() => {
    const cssId = 'whatfix-studio-v2-css'
    const scriptId = 'whatfix-studio-v2-js'

    let cssEl = document.getElementById(cssId)
    if (!cssEl) {
      cssEl = document.createElement('link')
      cssEl.id = cssId
      cssEl.rel = 'stylesheet'
      cssEl.href = STUDIO_CSS_URL
      document.head.appendChild(cssEl)
    }

    const markReady = () => setIsStudioReady(typeof window.toggleStudio === 'function')

    let scriptEl = document.getElementById(scriptId)
    if (!scriptEl) {
      scriptEl = document.createElement('script')
      scriptEl.id = scriptId
      scriptEl.src = STUDIO_JS_URL
      scriptEl.async = true
      scriptEl.onload = markReady
      document.body.appendChild(scriptEl)
    } else {
      markReady()
    }

    return undefined
  }, [])

  const handleExtensionClick = () => {
    if (typeof window.toggleStudio !== 'function') {
      // In case the script is still loading, do a short retry.
      setTimeout(() => {
        if (typeof window.toggleStudio === 'function') {
          window.toggleStudio()
          setIsStudioOpen((prev) => !prev)
        }
      }, 150)
      return
    }
    window.toggleStudio()
    setIsStudioOpen((prev) => !prev)
  }

  return (
    <main className="wf2-root">
      <div className="wf2-browser-shell">
        <div className="wf2-browser-top">
          <div className="wf2-browser-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="wf2-browser-url">
            <Globe size={14} />
            <span>https://demo.whatfix.app/mobile-studio-preview</span>
          </div>
          <div className="wf2-extension-tray">
            <button
              id="whatfix-extension"
              type="button"
              title="Whatfix Studio"
              className={`wf2-extension-btn ${isStudioOpen ? 'active' : ''}`}
              onClick={handleExtensionClick}
            >
              W
            </button>
          </div>
        </div>

        <div className="wf2-browser-canvas">
          <div className="wf2-canvas-label">
            V2 Demo - Fake browser with Whatfix extension
          </div>
          <PhonePreview />
        </div>

        {!isStudioReady && <p className="wf2-loading-note">Loading Whatfix Studio extension...</p>}
      </div>
    </main>
  )
}
