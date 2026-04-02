import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ContentArea from './components/ContentArea'
import MobileAnalyticsView from './components/MobileAnalyticsView'
import WhatfixFloatingStudioV2 from './components/WhatfixFloatingStudioV2'
import './App.css'

function App() {
  const [activeNav, setActiveNav] = useState('content')
  const [dashboardVersion, setDashboardVersion] = useState('v1')

  return (
    <div className="app">
      {dashboardVersion === 'v1' ? (
        <>
          <Sidebar activeNav={activeNav} onNavSelect={setActiveNav} />
          {activeNav === 'analytics' ? <MobileAnalyticsView /> : <ContentArea />}
        </>
      ) : (
        <WhatfixFloatingStudioV2 />
      )}

      <div className="app-version-chip" role="group" aria-label="Dashboard version">
        <button
          type="button"
          className={`app-version-chip-btn ${dashboardVersion === 'v1' ? 'active' : ''}`}
          onClick={() => setDashboardVersion('v1')}
        >
          V1
        </button>
        <button
          type="button"
          className={`app-version-chip-btn ${dashboardVersion === 'v2' ? 'active' : ''}`}
          onClick={() => setDashboardVersion('v2')}
        >
          V2
        </button>
      </div>
    </div>
  )
}

export default App
