import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { FigmaDesignProvider } from './context/FigmaDesignContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FigmaDesignProvider>
      <App />
    </FigmaDesignProvider>
  </React.StrictMode>,
)
