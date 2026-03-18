import { Smartphone } from 'lucide-react'
import './PlatformsSelector.css'

// Platform options: id, label, and icon type for simple representation
const PLATFORMS = [
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iOS' },
  { id: 'react-android', label: 'React (Android)' },
  { id: 'react-ios', label: 'React (iOS)' },
  { id: 'xamarin-android', label: 'Xamarin (Android)' },
  { id: 'xamarin-ios', label: 'Xamarin (iOS)' },
  { id: 'cordova-android', label: 'Cordova (Android)' },
  { id: 'cordova-ios', label: 'Cordova (iOS)' },
  { id: 'ionic-android', label: 'Ionic (Android)' },
  { id: 'ionic-ios', label: 'Ionic (iOS)' },
  { id: 'jetpack-android', label: 'Jetpack Compose (Android)' },
  { id: 'maui-android', label: 'MAUI (Android)' },
  { id: 'maui-ios', label: 'MAUI (iOS)' },
  { id: 'flutter-android', label: 'Flutter (Android)' },
  { id: 'flutter-ios', label: 'Flutter (iOS)' },
]

function PlatformIcon({ id }) {
  const isAndroid = id === 'android' || id?.includes('android')
  const isIos = id === 'ios' || id?.includes('ios')
  if (isAndroid) {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M17 6H7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 4h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  }
  if (isIos) {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M18.5 8c0 2.5-1.5 4.5-3.8 5.4-.5.2-.9.1-1.2-.3-.3-.3-.4-.7-.2-1.2 1.2-3.5.4-6.4-1.2-8.2-.4-.5-.2-1 .2-1.3 2.2-1.8 5-2.4 5.2-2.4.1 0 .2.1.2.2.2.5.7 1.3 1.2 2.2 1.5 2.8 2.2 5.2 1.2 8.2-.3.5-.2 1 .1 1.3.4.4.8.3 1.3-.2 1.5-2.3.9-3.8 2.9-3.8 5.4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2c.5 1.2.2 2.4-.6 3.3-.8.9-2 1.3-3.2 1-.2 0-.3-.1-.4-.2-.1-.2 0-.4.2-.5 1-.2 1.8-.6 2.3-1.2.5-.6.6-1.5.4-2.4C9.8 2.5 10.9 2 12 2z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    )
  }
  return <Smartphone size={28} strokeWidth={1.5} aria-hidden />
}

export default function PlatformsSelector({ selectedIds = [], onChange }) {
  const handleToggle = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id]
    onChange?.(next)
  }

  return (
    <div className="platforms-selector">
      <div className="platforms-selector-grid">
        {PLATFORMS.map((platform) => {
          const selected = selectedIds.includes(platform.id)
          return (
            <button
              key={platform.id}
              type="button"
              className={`platforms-selector-card ${selected ? 'selected' : ''}`}
              onClick={() => handleToggle(platform.id)}
              aria-pressed={selected}
            >
              <span className="platforms-selector-icon">
                <PlatformIcon id={platform.id} />
              </span>
              <span className="platforms-selector-label">{platform.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
