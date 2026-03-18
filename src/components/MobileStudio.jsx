import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronUp, ChevronDown, Eye, Settings, MapPin, Clock, Users, Info, Bluetooth, Plus, Trash2, Pencil, Droplet, Square, AlignCenter, ArrowUpDown, FileText, Globe, Route, Hash, Tag, Calendar, Monitor } from 'lucide-react'
import './MobileStudio.css'

// Where does the popup appear – Show on options (each can only be used in one condition)
const WHERE_SHOW_ON_OPTIONS = [
  { value: 'url', label: 'URL', description: 'Only the page with a specific URL', Icon: FileText },
  { value: 'domain', label: 'Domain', description: 'All pages that start with the current domain (example: whatfix.com)', Icon: Globe },
  { value: 'url-path', label: 'URL path', description: 'Pages with URLs that contain a particular path, typically for a section', Icon: Route },
  { value: 'url-parameter', label: 'URL parameter', description: 'Pages with a specified URL parameter (helpful for localization)', Icon: MapPin },
  { value: 'url-hash', label: 'URL hash value', description: 'Pages with specified URL hash value (usually for single-page apps)', Icon: Hash },
  { value: 'page-tags', label: 'Page tags', description: 'Pages that have the specified page tag', Icon: Tag },
]

// When does the popup start appearing – cause options (each can only be used in one start condition)
const WHEN_CAUSE_OPTIONS = [
  { value: 'specific-date-range', label: 'Specific date range', description: 'Define a period during which the popup should appear', Icon: Calendar },
  { value: 'something-on-application', label: 'Something on the application', description: 'An event or state within the application that triggers the popup to appear', Icon: Monitor },
]

// Who does the popup appear to – identify options (each can only be used in one condition)
const WHO_IDENTIFY_OPTIONS = [
  { value: 'enterprise-attributes', label: 'Enterprise Attributes', description: 'Identify the user by enterprise-level attributes' },
  { value: 'user-attributes', label: 'User Attributes', description: 'Identify the user by user-level attributes' },
]

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

// Phone Preview Content - renders different layouts based on screen type
function PhonePreviewContent({ screen, isSelectingIdentifier, hoveredElement, selectedElementIds = [], onElementHover, onElementSelect }) {
  if (!screen) {
    return (
      <div className="empty-preview">
        <div className="empty-icon">🍔</div>
        <p>Select a screen to preview</p>
      </div>
    )
  }

  const { layout, headerTitle, accentColor, content } = screen

  // Helper to create selectable element props
  const selectableProps = (elementId, elementType, elementName) => ({
    className: `${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === elementId ? 'element-hovered' : ''} ${selectedElementIds.includes(elementId) ? 'element-selected' : ''}`,
    onMouseEnter: () => onElementHover?.(elementId),
    onMouseLeave: () => onElementHover?.(null),
    onClick: isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.(elementId, elementType, elementName); } : undefined,
    'data-selectable': isSelectingIdentifier ? 'true' : undefined
  })

  return (
    <div className={`phone-preview-wrapper ${isSelectingIdentifier ? 'selecting-mode' : ''}`}>
      {/* Food Home Screen */}
      {layout === 'food-home' && (
        <div className="preview-body food-home">
          <div 
            className={`food-header ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'header' ? 'element-hovered' : ''} ${selectedElementIds.includes('header') ? 'element-selected' : ''}`}
            style={{ background: accentColor }}
            onMouseEnter={() => onElementHover?.('header')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('header', 'header', 'Food Header'); } : undefined}
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
              className={`greeting ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'greeting' ? 'element-hovered' : ''} ${selectedElementIds.includes('greeting') ? 'element-selected' : ''}`}
              onMouseEnter={() => onElementHover?.('greeting')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('greeting', 'text', 'Greeting Text'); } : undefined}
            >
              {content.greeting}
            </p>
            <div 
              className={`search-bar-preview ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'search' ? 'element-hovered' : ''} ${selectedElementIds.includes('search') ? 'element-selected' : ''}`}
              onMouseEnter={() => onElementHover?.('search')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('search', 'input', 'Search Bar'); } : undefined}
            >
              <span>🔍</span>
              <span className="search-placeholder">Search for dishes, restaurants...</span>
            </div>
            <div className="categories-row">
              {content.categories.map((cat, i) => (
                <div 
                  key={i} 
                  className={`category-item ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === `cat-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`cat-${i}`) ? 'element-selected' : ''}`}
                  onMouseEnter={() => onElementHover?.(`cat-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.(`cat-${i}`, 'category', cat.name); } : undefined}
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
                  className={`restaurant-card ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === `rest-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`rest-${i}`) ? 'element-selected' : ''}`}
                  onMouseEnter={() => onElementHover?.(`rest-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.(`rest-${i}`, 'card', rest.name); } : undefined}
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
            className={`rest-banner ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'banner' ? 'element-hovered' : ''} ${selectedElementIds.includes('banner') ? 'element-selected' : ''}`}
            style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #ff6b7a 100%)` }}
            onMouseEnter={() => onElementHover?.('banner')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('banner', 'banner', 'Restaurant Banner'); } : undefined}
          >
            <span className="banner-emoji">{content.banner}</span>
          </div>
          <div className="rest-detail-content">
            <h3 
              className={`rest-detail-name ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'rest-name' ? 'element-hovered' : ''} ${selectedElementIds.includes('rest-name') ? 'element-selected' : ''}`}
              onMouseEnter={() => onElementHover?.('rest-name')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('rest-name', 'text', 'Restaurant Name'); } : undefined}
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
                  className={`menu-item-card ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === `menu-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`menu-${i}`) ? 'element-selected' : ''}`}
                  onMouseEnter={() => onElementHover?.(`menu-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.(`menu-${i}`, 'card', item.name); } : undefined}
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
            className={`cart-header-bar ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'cart-header' ? 'element-hovered' : ''} ${selectedElementIds.includes('cart-header') ? 'element-selected' : ''}`}
            style={{ background: accentColor }}
            onMouseEnter={() => onElementHover?.('cart-header')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('cart-header', 'header', 'Cart Header'); } : undefined}
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
                  className={`cart-item ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === `cart-item-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`cart-item-${i}`) ? 'element-selected' : ''}`}
                  onMouseEnter={() => onElementHover?.(`cart-item-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.(`cart-item-${i}`, 'item', item.name); } : undefined}
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
              className={`checkout-btn ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'checkout-btn' ? 'element-hovered' : ''} ${selectedElementIds.includes('checkout-btn') ? 'element-selected' : ''}`}
              style={{ background: accentColor }}
              onMouseEnter={() => onElementHover?.('checkout-btn')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('checkout-btn', 'button', 'Place Order Button'); } : undefined}
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
            className={`tracking-header ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'tracking-header' ? 'element-hovered' : ''} ${selectedElementIds.includes('tracking-header') ? 'element-selected' : ''}`}
            style={{ background: accentColor }}
            onMouseEnter={() => onElementHover?.('tracking-header')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('tracking-header', 'header', 'Tracking Header'); } : undefined}
          >
            <span className="order-id">{content.orderId}</span>
            <span className="eta-badge">{content.eta} away</span>
          </div>
          <div className="tracking-content">
            <div 
              className={`tracking-map ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'tracking-map' ? 'element-hovered' : ''} ${selectedElementIds.includes('tracking-map') ? 'element-selected' : ''}`}
              onMouseEnter={() => onElementHover?.('tracking-map')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('tracking-map', 'map', 'Tracking Map'); } : undefined}
            >
              <div className="map-placeholder">
                <span className="map-icon">🗺️</span>
                <div className="delivery-indicator">
                  <span className="bike-icon">🛵</span>
                </div>
              </div>
            </div>
            <div 
              className={`tracking-status ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'tracking-status' ? 'element-hovered' : ''} ${selectedElementIds.includes('tracking-status') ? 'element-selected' : ''}`}
              onMouseEnter={() => onElementHover?.('tracking-status')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('tracking-status', 'text', 'Order Status'); } : undefined}
            >
              <p className="status-text">{content.status}</p>
              <p className="driver-info">Your rider: {content.driver}</p>
            </div>
            <div className="tracking-steps">
              {content.steps.map((step, i) => (
                <div 
                  key={i} 
                  className={`track-step ${step.done ? 'done' : ''} ${step.current ? 'current' : ''} ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === `step-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`step-${i}`) ? 'element-selected' : ''}`}
                  onMouseEnter={() => onElementHover?.(`step-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.(`step-${i}`, 'step', step.label); } : undefined}
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
            className={`profile-banner ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'profile-banner' ? 'element-hovered' : ''} ${selectedElementIds.includes('profile-banner') ? 'element-selected' : ''}`}
            style={{ background: accentColor }}
            onMouseEnter={() => onElementHover?.('profile-banner')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('profile-banner', 'banner', 'Profile Banner'); } : undefined}
          >
            <div className="profile-avatar-large">
              {content.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="profile-name-large">{content.name}</span>
            <span className="profile-orders">{content.orders} orders placed</span>
          </div>
          <div className="profile-content">
            <div 
              className={`profile-info-card ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'profile-info' ? 'element-hovered' : ''} ${selectedElementIds.includes('profile-info') ? 'element-selected' : ''}`}
              onMouseEnter={() => onElementHover?.('profile-info')}
              onMouseLeave={() => onElementHover?.(null)}
              onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('profile-info', 'card', 'Profile Info Card'); } : undefined}
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
                  className={`profile-menu-item ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === `profile-menu-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`profile-menu-${i}`) ? 'element-selected' : ''}`}
                  onMouseEnter={() => onElementHover?.(`profile-menu-${i}`)}
                  onMouseLeave={() => onElementHover?.(null)}
                  onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.(`profile-menu-${i}`, 'menu-item', item.label); } : undefined}
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
            className={`search-header ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === 'search-header' ? 'element-hovered' : ''} ${selectedElementIds.includes('search-header') ? 'element-selected' : ''}`}
            style={{ background: accentColor }}
            onMouseEnter={() => onElementHover?.('search-header')}
            onMouseLeave={() => onElementHover?.(null)}
            onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.('search-header', 'header', 'Search Header'); } : undefined}
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
                    className={`recent-tag ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === `recent-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`recent-${i}`) ? 'element-selected' : ''}`}
                    onMouseEnter={() => onElementHover?.(`recent-${i}`)}
                    onMouseLeave={() => onElementHover?.(null)}
                    onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.(`recent-${i}`, 'tag', term); } : undefined}
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
                    className={`popular-item ${isSelectingIdentifier ? 'selectable-element' : ''} ${hoveredElement === `popular-${i}` ? 'element-hovered' : ''} ${selectedElementIds.includes(`popular-${i}`) ? 'element-selected' : ''}`}
                    style={{ borderColor: accentColor }}
                    onMouseEnter={() => onElementHover?.(`popular-${i}`)}
                    onMouseLeave={() => onElementHover?.(null)}
                    onClick={isSelectingIdentifier ? (e) => { e.stopPropagation(); onElementSelect?.(`popular-${i}`, 'category', cat.name); } : undefined}
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

function MobileStudio({ onClose, onSave, popupType = 'overlay' }) {
  const [activeTab, setActiveTab] = useState('identify')
  const [selectedScreen, setSelectedScreen] = useState(null)
  const [connectSyncExpanded, setConnectSyncExpanded] = useState(true)
  const [pairDeviceExpanded, setPairDeviceExpanded] = useState(true)
  const [appScreensSubExpanded, setAppScreensSubExpanded] = useState(false)
  const [isDevicePaired, setIsDevicePaired] = useState(false)
  const [identifiersExpanded, setIdentifiersExpanded] = useState(false)
  const [appVersion, setAppVersion] = useState('')
  const [overlayTitle, setOverlayTitle] = useState('')
  const [snackbarMessage, setSnackbarMessage] = useState(null)
  
  // Customizations tab accordions
  const [appearanceExpanded, setAppearanceExpanded] = useState(true)
  const [positionExpanded, setPositionExpanded] = useState(false)
  const [controlsExpanded, setControlsExpanded] = useState(false)
  const [advancedControlsExpanded, setAdvancedControlsExpanded] = useState(false)
  
  // Position state
  const [selectedPosition, setSelectedPosition] = useState('center') // 'top-left', 'top-center', 'top-right', 'middle-left', 'center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'
  
  // Controls state
  const [showCloseButton, setShowCloseButton] = useState(true)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [screenReaderTitle, setScreenReaderTitle] = useState('')
  
  // Appearance options state
  const [backgroundType, setBackgroundType] = useState('color') // 'color' or 'image'
  const [backgroundColor, setBackgroundColor] = useState('#2E9EFA')
  const [paddingUniform, setPaddingUniform] = useState(true)
  const [paddingValue, setPaddingValue] = useState(28)
  const [borderRadiusUniform, setBorderRadiusUniform] = useState(true)
  const [borderRadiusValue, setBorderRadiusValue] = useState(20)
  const [overlayType, setOverlayType] = useState('dim') // 'dim' or 'blur'
  
  // Template icon visibility
  const [showTemplateIcon, setShowTemplateIcon] = useState(false)
  
  // Visibility rules sub-accordions
  const [whereExpanded, setWhereExpanded] = useState(false)
  const [whenExpanded, setWhenExpanded] = useState(false)
  const [whoExpanded, setWhoExpanded] = useState(false)
  // Where does the popup appear – conditions (Show on)
  const [whereConditions, setWhereConditions] = useState([{ id: 1, showOn: '' }])
  const [openWhereDropdownId, setOpenWhereDropdownId] = useState(null)
  // When does the popup start/stop – start conditions (What causes the popup to appear?)
  const [whenStartConditions, setWhenStartConditions] = useState([{ id: 1, cause: '' }])
  const [openWhenDropdownId, setOpenWhenDropdownId] = useState(null)
  // Who does the popup appear to – conditions (How would you like to identify the user?)
  const [whoConditions, setWhoConditions] = useState([{ id: 1, identifyBy: '' }])
  const [openWhoDropdownId, setOpenWhoDropdownId] = useState(null)
  
  // Identifier selection state
  const [isSelectingIdentifier, setIsSelectingIdentifier] = useState(false)
  const [selectedIdentifiers, setSelectedIdentifiers] = useState([])
  const [hoveredElement, setHoveredElement] = useState(null)
  
  // Template selection state
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  
  // Rich text editor state
  const [isRichTextEditorOpen, setIsRichTextEditorOpen] = useState(false)
  const [editorContent, setEditorContent] = useState({
    title: 'Enter title here',
    description: 'Consistency is key in design; it builds trust and familiarity with users.'
  })
  const [activeEditorField, setActiveEditorField] = useState(null) // 'title' or 'description'
  const [actionType, setActionType] = useState('primary') // 'primary' or 'secondary'
  const [selectedFlow, setSelectedFlow] = useState('Start flow')
  const [editorPosition, setEditorPosition] = useState({ top: 0, left: 0 })

  const popupTypeName = popupType.charAt(0).toUpperCase() + popupType.slice(1)
  const placeholderTitle = `Untitled ${popupType}`
  
  // Find the currently selected screen data
  const currentScreen = appScreens.find(s => s.id === selectedScreen)
  
  // Demo screen for paired device (first screen as default)
  const pairedDeviceScreen = isDevicePaired ? appScreens[0] : null

  // Auto-select first template when switching to design/customizations tab
  useEffect(() => {
    if (activeTab === 'design' && !selectedTemplate && overlayTemplates.length > 0) {
      setSelectedTemplate(overlayTemplates[0].id)
    }
  }, [activeTab])

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
  
  // Handle pair device click
  const handlePairDevice = () => {
    setIsDevicePaired(true)
    setSelectedScreen(appScreens[0]?.id || null)
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
    const newIdentifier = {
      id: Date.now(),
      name: generateIdentifierName(),
      elementId,
      elementType,
      elementName
    }
    setSelectedIdentifiers([...selectedIdentifiers, newIdentifier])
    // Don't exit selection mode - allow multiple selections
    setHoveredElement(null)
  }
  
  // Get list of selected element IDs
  const selectedElementIds = selectedIdentifiers.map(i => i.elementId)

  // Handle element hover
  const handleElementHover = (elementId) => {
    if (isSelectingIdentifier) {
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
              {isDevicePaired ? (
                <PhonePreviewContent 
                  screen={pairedDeviceScreen} 
                  isSelectingIdentifier={isSelectingIdentifier}
                  hoveredElement={hoveredElement}
                  selectedElementIds={selectedElementIds}
                  onElementHover={handleElementHover}
                  onElementSelect={handleElementSelect}
                />
              ) : currentScreen ? (
                <PhonePreviewContent 
                  screen={currentScreen} 
                  isSelectingIdentifier={isSelectingIdentifier}
                  hoveredElement={hoveredElement}
                  selectedElementIds={selectedElementIds}
                  onElementHover={handleElementHover}
                  onElementSelect={handleElementSelect}
                />
              ) : (
                <div className="add-screen-placeholder">
                  <p className="add-screen-text">Add screen</p>
                </div>
              )}
            </div>
            
            {/* Template Overlay with Scrim */}
            {(selectedTemplate || activeTab === 'design') && overlayTemplates.length > 0 && (() => {
              const currentTemplate = overlayTemplates.find(t => t.id === selectedTemplate) || overlayTemplates[0];
              if (!currentTemplate) return null;
              return (
                <div className="phone-overlay-container">
                  {/* Light Scrim */}
                  <div className="phone-scrim"></div>
                  
                  {/* Bottom Sheet Overlay */}
                  <div 
                    className={`phone-bottom-sheet ${currentTemplate?.theme || 'light'} ${activeTab === 'design' ? 'editable' : ''}`}
                    style={{ pointerEvents: 'all' }}
                  >
                    {/* Close Button */}
                    <button className="overlay-close-btn" onClick={() => setSelectedTemplate(null)}>
                      <svg width="5" height="5" viewBox="0 0 5 5" fill="none">
                        <path d="M3.8 1.2L1.2 3.8M1.2 1.2L3.8 3.8" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    {/* Whatfix Logo */}
                    {showTemplateIcon && (
                      <div className="overlay-icon">
                        <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
                          {/* Left flame */}
                          <path d="M8 32L8 12C8 12 4 16 4 22C4 28 8 32 8 32Z" fill="#F26522"/>
                          <path d="M8 32L14 8L8 20L8 32Z" fill="#F26522"/>
                          {/* Middle-left flame */}
                          <path d="M14 32L14 8L10 18L14 32Z" fill="#F58220"/>
                          <path d="M14 8L18 0L14 12L14 8Z" fill="#F58220"/>
                          {/* Middle flame */}
                          <path d="M18 32L22 0L18 16L18 32Z" fill="#F26522"/>
                          {/* Middle-right flame */}
                          <path d="M22 32L26 8L22 20L22 32Z" fill="#F58220"/>
                          <path d="M26 8L22 0L26 12L26 8Z" fill="#F58220"/>
                          {/* Right flame */}
                          <path d="M32 32L32 12C32 12 36 16 36 22C36 28 32 32 32 32Z" fill="#F26522"/>
                          <path d="M32 32L26 8L32 20L32 32Z" fill="#F26522"/>
                        </svg>
                      </div>
                    )}
                    
                    {/* Title */}
                    <h4 
                      className={`overlay-title ${currentTemplate?.layout || 'centered'} ${activeTab === 'design' ? 'editable-text' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (activeTab === 'design') {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const phoneFrame = e.currentTarget.closest('.phone-frame')
                          const phoneFrameRect = phoneFrame?.getBoundingClientRect()
                          
                          if (phoneFrameRect) {
                            // Position editor near the clicked element, centered below it
                            setEditorPosition({
                              top: rect.top - phoneFrameRect.top + rect.height + 8,
                              left: rect.left - phoneFrameRect.left + (rect.width / 2)
                            })
                          }
                          setIsRichTextEditorOpen(true)
                          setActiveEditorField('title')
                        }
                      }}
                      style={{ cursor: activeTab === 'design' ? 'pointer' : 'default', position: 'relative', zIndex: 102, pointerEvents: activeTab === 'design' ? 'auto' : 'none' }}
                    >
                      {editorContent.title}
                    </h4>
                    
                    {/* Description */}
                    <p 
                      className={`overlay-desc ${currentTemplate?.layout || 'centered'} ${activeTab === 'design' ? 'editable-text' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (activeTab === 'design') {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const phoneFrame = e.currentTarget.closest('.phone-frame')
                          const phoneFrameRect = phoneFrame?.getBoundingClientRect()
                          
                          if (phoneFrameRect) {
                            // Position editor near the clicked element, centered below it
                            setEditorPosition({
                              top: rect.top - phoneFrameRect.top + rect.height + 8,
                              left: rect.left - phoneFrameRect.left + (rect.width / 2)
                            })
                          }
                          setIsRichTextEditorOpen(true)
                          setActiveEditorField('description')
                        }
                      }}
                      style={{ cursor: activeTab === 'design' ? 'pointer' : 'default', position: 'relative', zIndex: 102, pointerEvents: activeTab === 'design' ? 'auto' : 'none' }}
                    >
                      {editorContent.description}
                    </p>
                    
                    {/* Buttons */}
                    <div className={`overlay-buttons ${currentTemplate?.layout || 'centered'} ${currentTemplate?.buttonLayout || 'vertical'}`}>
                      {currentTemplate?.buttons.map((btnType, i) => (
                        <button 
                          key={i} 
                          className={`overlay-btn ${btnType} ${currentTemplate?.theme || 'light'}`}
                        >
                          {btnType === 'primary' ? (currentTemplate?.buttonLabel || 'Allright') : 'Cancel'}
                        </button>
                      ))}
                    </div>
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
          {activeTab === 'identify' && (
            <>
              {/* Connect & Sync Accordion */}
              <div className="studio-accordion">
                <button 
                  className="accordion-header"
                  onClick={() => setConnectSyncExpanded(!connectSyncExpanded)}
                >
                  <span className="accordion-title">Connect & Sync</span>
                  {connectSyncExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {connectSyncExpanded && (
                  <div className="accordion-body">
                    {/* Pair Device Sub-Accordion */}
                    <div className="sub-accordion">
                      <button 
                        className="sub-accordion-header"
                        onClick={() => setPairDeviceExpanded(!pairDeviceExpanded)}
                      >
                        <div className="sub-accordion-title-row">
                          <Bluetooth size={16} className="sub-accordion-icon" />
                          <span className="sub-accordion-title">Pair device</span>
                        </div>
                        {pairDeviceExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {pairDeviceExpanded && (
                        <div className="sub-accordion-body">
                          <div className="sub-accordion-content-wrapper">
                            <div className="pair-device-content">
                              {/* Pairing Illustration */}
                              <div className="pair-device-illustration">
                                <div className="pair-illustration-container">
                                  <div className="pair-device-back"></div>
                                  <div className="pair-device-front"></div>
                                  <div className="pair-icon-overlay">
                                    <Bluetooth size={27} strokeWidth={2.5} />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Pair Device CTA */}
                              <button 
                                className="pair-device-cta"
                                onClick={handlePairDevice}
                                disabled={isDevicePaired}
                              >
                                <Bluetooth size={20} />
                                <span>{isDevicePaired ? 'Device Paired' : 'Pair device'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* App Screens Sub-Accordion */}
                    <div className="sub-accordion">
                      <button 
                        className="sub-accordion-header"
                        onClick={() => setAppScreensSubExpanded(!appScreensSubExpanded)}
                      >
                        <div className="sub-accordion-title-row">
                          <Eye size={16} className="sub-accordion-icon" />
                          <span className="sub-accordion-title">App screens</span>
                        </div>
                        {appScreensSubExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {appScreensSubExpanded && (
                        <div className="sub-accordion-body">
                          <div className="sub-accordion-content-wrapper">
                            <div className="screens-grid">
                              {appScreens.map((screen) => (
                                <div 
                                  key={screen.id}
                                  className={`screen-card ${selectedScreen === screen.id ? 'selected' : ''}`}
                                  onClick={() => {
                                    setSelectedScreen(screen.id)
                                    setIsDevicePaired(false) // Reset pairing when selecting a screen manually
                                  }}
                                >
                                  <div className="screen-preview">
                                    <MiniScreenPreview screen={screen} />
                                    <div className="screen-radio">
                                      <div className={`radio-circle ${selectedScreen === screen.id ? 'checked' : ''}`}>
                                        {selectedScreen === screen.id && <div className="radio-dot"></div>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="screen-info">
                                    <span className="screen-name">{screen.name}</span>
                                    <span className={`screen-time ${screen.isRecent ? 'recent' : ''}`}>
                                      {screen.time}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="accordion-divider"></div>
                  </div>
                )}
              </div>

              {/* Identifiers Accordion */}
              <div className="studio-accordion">
                <button 
                  className="accordion-header"
                  onClick={() => {
                    const newExpanded = !identifiersExpanded
                    setIdentifiersExpanded(newExpanded)
                    // Exit selection mode when collapsing the accordion
                    if (!newExpanded) {
                      setIsSelectingIdentifier(false)
                      setHoveredElement(null)
                    }
                  }}
                >
                  <span className="accordion-title">Identifiers</span>
                  {identifiersExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {identifiersExpanded && (
                  <div className="accordion-body">
                    <div className="identifiers-content">
                      {selectedIdentifiers.length === 0 ? (
                        <>
                          {/* Illustration - only show when no identifiers */}
                          <div className="identifiers-illustration">
                            <div className="illustration-documents">
                              <div className="doc-back"></div>
                              <div className="doc-front"></div>
                              <div className="search-icon-overlay">
                                <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="11.5" cy="11.5" r="9.5" stroke="#C74913" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M18.5 18.5L25 25" stroke="#C74913" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Heading */}
                          <h5 className="identifiers-heading">Identifiers</h5>
                          
                          {/* Description */}
                          <p className="identifiers-description">
                            Please select element on the app screen to add as an identifier for the popup
                          </p>
                        </>
                      ) : (
                        /* Selected Identifiers List */
                        <div className="identifiers-list">
                          {selectedIdentifiers.map((identifier) => (
                            <div key={identifier.id} className="identifier-item">
                              <div className="identifier-info">
                                <span className="identifier-name">{identifier.name}</span>
                                <span className="identifier-element">{identifier.elementName}</span>
                              </div>
                              <button 
                                className="identifier-remove-btn"
                                onClick={() => handleRemoveIdentifier(identifier.id)}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 4L4 12M4 4L12 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add Identifier Button */}
                      <button 
                        className={`add-identifier-btn ${isSelectingIdentifier ? 'selecting' : ''}`}
                        onClick={handleAddIdentifierClick}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 3V13M3 8H13" stroke="#E4590E" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>
                          {isSelectingIdentifier 
                            ? 'Select an element on the screen...' 
                            : selectedIdentifiers.length > 0 
                              ? 'Add More Identifiers' 
                              : 'Add Identifier'}
                        </span>
                      </button>
                      
                      {/* Cancel button when selecting */}
                      {isSelectingIdentifier && (
                        <button 
                          className="cancel-selection-btn"
                          onClick={() => {
                            setIsSelectingIdentifier(false)
                            setHoveredElement(null)
                          }}
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'design' && (
            <>
              <div key="customizations-content" style={{ width: '100%', minHeight: '200px', padding: '0' }}>
                {/* Debug: Verify this renders */}
                {console.log('Rendering Customizations content, activeTab:', activeTab)}
                {/* Appearance Accordion */}
                <div className="studio-accordion">
                <button 
                  className="accordion-header"
                  onClick={() => {
                    console.log('Appearance accordion clicked, current state:', appearanceExpanded)
                    setAppearanceExpanded(!appearanceExpanded)
                  }}
                >
                  <span className="accordion-title">Appearance</span>
                  {appearanceExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {appearanceExpanded && (
                  <div className="accordion-body appearance-body">
                    {/* Background Section */}
                    <div className="appearance-section">
                      <div className="appearance-row">
                        <div className="appearance-label-wrapper">
                          <span className="appearance-label-bold">Background</span>
                        </div>
                        <div className="toggle-button-group">
                          <button 
                            className={`toggle-button ${backgroundType === 'color' ? 'active' : ''}`}
                            onClick={() => setBackgroundType('color')}
                          >
                            Color
                          </button>
                          <button 
                            className={`toggle-button ${backgroundType === 'image' ? 'active' : ''}`}
                            onClick={() => setBackgroundType('image')}
                          >
                            Image
                          </button>
                        </div>
                      </div>
                      
                      {/* Color Input */}
                      <div className="appearance-row">
                        <div className="appearance-label-wrapper">
                          <span className="appearance-label">Color</span>
                        </div>
                        <div className="color-picker-input">
                          <div 
                            className="color-preview-gradient" 
                            style={{ 
                              background: `linear-gradient(to bottom, rgba(46,158,250,0.54), #f6566b)`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="appearance-divider"></div>

                    {/* Padding Section */}
                    <div className="appearance-section">
                      <div className="appearance-row">
                        <div className="appearance-label-wrapper">
                          <span className="appearance-label-bold">Padding</span>
                        </div>
                        <div className="appearance-switch-wrapper">
                          <span className="appearance-switch-label">Uniform</span>
                          <button 
                            className={`appearance-switch ${paddingUniform ? 'active' : ''}`}
                            onClick={() => setPaddingUniform(!paddingUniform)}
                          >
                            <span className="appearance-switch-knob"></span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Padding Slider */}
                      <div className="appearance-slider-section">
                        <span className="appearance-slider-label">All sides</span>
                        <div className="appearance-slider-wrapper">
                          <div className="appearance-slider-track">
                            <div 
                              className="appearance-slider-fill" 
                              style={{ width: `${(paddingValue / 100) * 100}%` }}
                            ></div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={paddingValue}
                              onChange={(e) => setPaddingValue(Number(e.target.value))}
                              className="appearance-slider-input"
                            />
                          </div>
                          <span className="appearance-slider-value">{paddingValue} px</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="appearance-divider"></div>

                    {/* Border Radius Section */}
                    <div className="appearance-section">
                      <div className="appearance-row">
                        <div className="appearance-label-wrapper">
                          <span className="appearance-label-bold">Border Radius</span>
                        </div>
                        <div className="appearance-switch-wrapper">
                          <span className="appearance-switch-label">Uniform</span>
                          <button 
                            className={`appearance-switch ${borderRadiusUniform ? 'active' : ''}`}
                            onClick={() => setBorderRadiusUniform(!borderRadiusUniform)}
                          >
                            <span className="appearance-switch-knob"></span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Border Radius Slider */}
                      <div className="appearance-slider-section">
                        <span className="appearance-slider-label">All sides</span>
                        <div className="appearance-slider-wrapper">
                          <div className="appearance-slider-track">
                            <div 
                              className="appearance-slider-fill" 
                              style={{ width: `${(borderRadiusValue / 100) * 100}%` }}
                            ></div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={borderRadiusValue}
                              onChange={(e) => setBorderRadiusValue(Number(e.target.value))}
                              className="appearance-slider-input"
                            />
                          </div>
                          <span className="appearance-slider-value">{borderRadiusValue} px</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="appearance-divider"></div>

                    {/* Overlay Section */}
                    <div className="appearance-section">
                      <div className="appearance-row">
                        <div className="appearance-label-wrapper">
                          <span className="appearance-label-bold">Overlay</span>
                        </div>
                        <div className="appearance-radio-group">
                          <label className="appearance-radio-option">
                            <input
                              type="radio"
                              name="overlay"
                              value="dim"
                              checked={overlayType === 'dim'}
                              onChange={(e) => setOverlayType(e.target.value)}
                              className="appearance-radio-input"
                            />
                            <span className="appearance-radio-label">Dim</span>
                          </label>
                          <label className="appearance-radio-option">
                            <input
                              type="radio"
                              name="overlay"
                              value="blur"
                              checked={overlayType === 'blur'}
                              onChange={(e) => setOverlayType(e.target.value)}
                              className="appearance-radio-input"
                            />
                            <span className="appearance-radio-label">Blur</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Position Accordion */}
              <div className="studio-accordion">
                <button 
                  className="accordion-header"
                  onClick={() => setPositionExpanded(!positionExpanded)}
                >
                  <span className="accordion-title">Position</span>
                  {positionExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {positionExpanded && (
                  <div className="accordion-body position-body">
                    <div className="position-grid-container">
                      <div className="position-grid">
                        {['top-left', 'top-center', 'top-right', 'middle-left', 'center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                          <button
                            key={pos}
                            className={`position-cell ${selectedPosition === pos ? 'selected' : ''}`}
                            onClick={() => setSelectedPosition(pos)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls Accordion */}
              <div className="studio-accordion">
                <button 
                  className="accordion-header"
                  onClick={() => setControlsExpanded(!controlsExpanded)}
                >
                  <span className="accordion-title">Controls</span>
                  {controlsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {controlsExpanded && (
                  <div className="accordion-body controls-body">
                    {/* Show close button */}
                    <div className="controls-row">
                      <div className="controls-label-wrapper">
                        <span className="controls-label">Show close (X) button</span>
                      </div>
                      <button 
                        className={`controls-switch ${showCloseButton ? 'active' : ''}`}
                        onClick={() => setShowCloseButton(!showCloseButton)}
                      >
                        <span className="controls-switch-knob"></span>
                      </button>
                    </div>

                    {/* Don't show me again */}
                    <div className="controls-row">
                      <div className="controls-label-wrapper">
                        <span className="controls-label">Don't show me again</span>
                      </div>
                      <button 
                        className={`controls-switch ${dontShowAgain ? 'active' : ''}`}
                        onClick={() => setDontShowAgain(!dontShowAgain)}
                      >
                        <span className="controls-switch-knob"></span>
                      </button>
                    </div>

                    {/* Title for screen reader */}
                    <div className="controls-input-section">
                      <div className="controls-input-header">
                        <label className="controls-input-label">Title for screen reader</label>
                        <span className="controls-char-count">{screenReaderTitle.length}/100</span>
                      </div>
                      <input
                        type="text"
                        className="controls-text-input"
                        placeholder="Text"
                        value={screenReaderTitle}
                        onChange={(e) => {
                          if (e.target.value.length <= 100) {
                            setScreenReaderTitle(e.target.value)
                          }
                        }}
                        maxLength={100}
                      />
                      <p className="controls-helper-text">This title will be announced by the screen reader</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Controls Accordion */}
              <div className="studio-accordion">
                <button 
                  className="accordion-header"
                  onClick={() => setAdvancedControlsExpanded(!advancedControlsExpanded)}
                >
                  <span className="accordion-title">Advanced Controls</span>
                  {advancedControlsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {advancedControlsExpanded && (
                  <div className="accordion-body advanced-controls-body">
                    <div className="template-variations-section">
                      <span className="template-variations-label">Template Variations</span>
                      <div className="template-variations-grid">
                        {overlayTemplates.map((template) => (
                          <button
                            key={template.id}
                            className={`template-variation-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <div className="template-variation-preview">
                              <div className={`template-preview-sheet ${template.theme || 'light'}`}>
                                {template.layout === 'centered' && (
                                  <>
                                    <div className="template-preview-icon"></div>
                                    <div className="template-preview-title"></div>
                                    <div className="template-preview-desc"></div>
                                    <div className="template-preview-button"></div>
                                  </>
                                )}
                                {template.layout === 'left' && (
                                  <>
                                    <div className="template-preview-title-left"></div>
                                    <div className="template-preview-desc-left"></div>
                                    <div className="template-preview-button-left"></div>
                                  </>
                                )}
                              </div>
                            </div>
                            <span className="template-variation-name">{template.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              </div>
            </>
          )}

          {activeTab === 'visibility' && (
            <>
              {/* Visibility Rules Content */}
              <div className="studio-accordion">
                <div className="accordion-body">
                  <div className="config-sub-accordions">
                    {/* Where Sub-Accordion */}
                    <div className="sub-accordion">
                      <button 
                        className="sub-accordion-header"
                        onClick={() => setWhereExpanded(!whereExpanded)}
                      >
                        <div className="sub-accordion-title-row">
                          <MapPin size={16} className="sub-accordion-icon" />
                          <span className="sub-accordion-title">Where does the popup appear</span>
                        </div>
                        {whereExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {whereExpanded && (
                        <div className="sub-accordion-body">
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

                    {/* When Sub-Accordion */}
                    <div className="sub-accordion">
                      <button 
                        className="sub-accordion-header"
                        onClick={() => setWhenExpanded(!whenExpanded)}
                      >
                        <div className="sub-accordion-title-row">
                          <Clock size={16} className="sub-accordion-icon" />
                          <span className="sub-accordion-title">When does the popup start and stop appearing</span>
                        </div>
                        {whenExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {whenExpanded && (
                        <div className="sub-accordion-body">
                          <p className="config-placeholder-text">Set the timing rules for when the popup starts and stops appearing.</p>
                          <div className="when-conditions">
                            {whenStartConditions.map((cond) => (
                              <div key={cond.id} className="when-condition-card">
                                <div className="when-condition-header">
                                  <span className="when-condition-label">Start condition {whenStartConditions.findIndex((c) => c.id === cond.id) + 1}</span>
                                  <button
                                    type="button"
                                    className="when-condition-delete"
                                    onClick={() => {
                                      if (whenStartConditions.length > 1) {
                                        setWhenStartConditions(whenStartConditions.filter((c) => c.id !== cond.id))
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
                                                        setWhenStartConditions(whenStartConditions.map((c) =>
                                                          c.id === cond.id ? { ...c, cause: opt.value } : c
                                                        ))
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
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="when-add-condition-btn"
                              onClick={() => setWhenStartConditions([...whenStartConditions, { id: Date.now(), cause: '' }])}
                            >
                              <Plus size={14} />
                              Add condition
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Who Sub-Accordion */}
                    <div className="sub-accordion">
                      <button 
                        className="sub-accordion-header"
                        onClick={() => setWhoExpanded(!whoExpanded)}
                      >
                        <div className="sub-accordion-title-row">
                          <Users size={16} className="sub-accordion-icon" />
                          <span className="sub-accordion-title">Who does the popup appear to</span>
                        </div>
                        {whoExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {whoExpanded && (
                        <div className="sub-accordion-body">
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
                </div>
              </div>
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
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-text">Choose popup type</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{popupTypeName}</span>
          </div>
          <div className="header-main">
            <button className="back-button" onClick={onClose}>
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
          {/* Tabs under the title */}
          <div className="studio-tabs">
            <button 
              className={`studio-tab ${activeTab === 'identify' ? 'active' : ''}`}
              onClick={() => setActiveTab('identify')}
            >
              <span>Identify</span>
              {activeTab === 'identify' && <div className="tab-indicator"></div>}
            </button>
            <button 
              className={`studio-tab ${activeTab === 'design' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Customizations tab clicked, current activeTab:', activeTab)
                // Ensure template is selected before switching tabs
                if (!selectedTemplate && overlayTemplates.length > 0) {
                  setSelectedTemplate(overlayTemplates[0].id)
                }
                // Switch to design tab - use a function to ensure state update
                setActiveTab((prev) => {
                  console.log('Setting activeTab from', prev, 'to design')
                  return 'design'
                })
                // Reset identifier selection state
                setIsSelectingIdentifier(false)
                setHoveredElement(null)
                console.log('Set activeTab to design, selectedTemplate:', selectedTemplate || overlayTemplates[0]?.id)
              }}
            >
              <span>Customizations</span>
              {activeTab === 'design' && <div className="tab-indicator"></div>}
            </button>
            <button 
              className={`studio-tab ${activeTab === 'visibility' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('visibility')
                setIsSelectingIdentifier(false)
                setHoveredElement(null)
              }}
            >
              <span>Visibility Rules</span>
              {activeTab === 'visibility' && <div className="tab-indicator"></div>}
            </button>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
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
                setSnackbarMessage('Pop-up cannot be saved without a title')
                return
              }
              if (typeof onSave === 'function') {
                onSave({ name, type: 'Pop-up' })
              }
              onClose()
            }}
          >
            Save
          </button>
        </div>
      </div>

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
