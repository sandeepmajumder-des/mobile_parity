import { createContext, useContext, useState, useCallback } from 'react'
import { fetchFlowStepsDesign } from '../services/figmaApi'
import { FIGMA_ACCESS_TOKEN } from '../config/figma'

const FigmaDesignContext = createContext({
  design: null,
  error: null,
  loading: false,
  isConnected: false,
  fetchDesign: () => {},
})

export function FigmaDesignProvider({ children }) {
  const [design, setDesign] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const isConnected = Boolean(FIGMA_ACCESS_TOKEN)

  const fetchDesign = useCallback(() => {
    if (!FIGMA_ACCESS_TOKEN) return
    setError(null)
    setLoading(true)
    fetchFlowStepsDesign()
      .then((data) => {
        setDesign(data)
        setError(null)
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch Figma design')
        setDesign(null)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <FigmaDesignContext.Provider value={{ design, error, loading, isConnected, fetchDesign }}>
      {children}
    </FigmaDesignContext.Provider>
  )
}

export function useFigmaDesign() {
  const ctx = useContext(FigmaDesignContext)
  if (!ctx) throw new Error('useFigmaDesign must be used within FigmaDesignProvider')
  return ctx
}
