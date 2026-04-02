import { useState } from 'react'
import { Bluetooth, ChevronDown, ChevronLeft } from 'lucide-react'
import { appScreens } from '../data/appScreens'
import './MobileStudio.css'
import './SeekStudio.css'

/**
 * V1 parity with V2 Seek simulation tile (studio-overlay-v2.js showSeekPanel):
 * mobile preview + side panel with URL and Start capturing.
 */
function SeekStudio({ onClose }) {
  const [isDevicePaired, setIsDevicePaired] = useState(false)
  const [isPairing, setIsPairing] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState(null)
  const demoUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handlePairDevice = () => {
    setIsPairing(true)
    setTimeout(() => {
      setIsPairing(false)
      setIsDevicePaired(true)
    }, 2000)
  }

  const handleStartCapture = () => {
    setSnackbarMessage('Capture session would start here (same entry point as V2 Seek).')
  }

  const currentScreen = appScreens[0]

  return (
    <div className="mobile-studio seek-studio">
      <div className="studio-preview-area">
        <div className="phone-frame">
          <div className="phone-screen">
            <div className="phone-status-bar">
              <span>9:41</span>
              <div className="status-icons">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.95 3 3 6.95 3 12a9 9 0 0 0 9 9c5.05 0 9-3.95 9-9s-3.95-9-9-9z" /></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="7" width="18" height="12" rx="2" /></svg>
              </div>
            </div>
            <div className={`phone-content ${isDevicePaired ? 'device-paired' : ''}`}>
              {isPairing ? (
                <div className="phone-pairing-loader">
                  <div className="pairing-spinner" />
                  <p className="pairing-text">Pairing with your device...</p>
                </div>
              ) : isDevicePaired ? (
                <div className="seek-studio-phone-ready">
                  <div className="seek-studio-phone-label">{currentScreen?.name || 'Home'}</div>
                  <p className="seek-studio-phone-caption">App ready for Seek capture</p>
                  <div className="seek-studio-phone-chrome" aria-hidden />
                </div>
              ) : (
                <div className="phone-pair-screen">
                  <div className="pair-illustration-phone">
                    <div className="pair-phone-icon-container">
                      <div className="pair-phone-back" />
                      <div className="pair-phone-front" />
                      <div className="pair-phone-bluetooth">
                        <Bluetooth size={20} strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                  <p className="pair-phone-text">Pair your mobile app to capture</p>
                  <button type="button" className="pair-phone-cta" onClick={handlePairDevice}>
                    <Bluetooth size={16} />
                    <span>Pair device</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="studio-panel">
        <div className="studio-content seek-studio-panel-inner">
          <div className="seek-studio-panel">
            <div className="seek-studio-url-group">
              <label className="seek-studio-url-label">
                <span>URL</span>
                <span className="seek-studio-url-counter">
                  <span>{demoUrl.length}</span>/100
                </span>
              </label>
              <input type="text" className="seek-studio-url-input" value={demoUrl} readOnly disabled />
            </div>

            <div className="seek-studio-capture-illustration" aria-hidden>
              <div className="seek-studio-capture-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C84900" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2" />
                </svg>
                <svg className="seek-studio-cursor-icon" width="24" height="24" viewBox="0 0 24 24" fill="#C84900">
                  <path d="M4 4l7 17 2.5-6.5L20 12 4 4z" />
                </svg>
              </div>
            </div>

            <p className="seek-studio-description">
              Capture your workflow via point and click to turn any task into an automated skill
            </p>

            <button type="button" className="seek-studio-start-btn" onClick={handleStartCapture}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              Start capturing
            </button>
          </div>
        </div>
      </div>

      <div className="studio-header">
        <div className="header-top">
          <div className="studio-breadcrumb">
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="breadcrumb-link">All content</a>
            <span className="breadcrumb-sep">/</span>
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="breadcrumb-link">Create content</a>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-text">Simulation</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Seek</span>
          </div>
          <div className="header-main">
            <button type="button" className="back-button" onClick={onClose} aria-label="Back">
              <ChevronLeft size={20} />
            </button>
            <input
              type="text"
              className="studio-title-input has-value"
              readOnly
              value="Seek capture"
              aria-label="Seek title"
            />
            <div className="header-right">
              <div className="version-input">
                <input type="text" placeholder="Add app version" readOnly />
                <ChevronDown size={16} className="input-icon" />
              </div>
              <button type="button" className="preview-button" disabled>
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
          <button type="button" className="btn-save" onClick={onClose}>
            Done
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

export default SeekStudio
