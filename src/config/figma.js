/**
 * Figma API configuration.
 * Token is read from env so it is not committed (see .env.local).
 * For production, call Figma API from a backend and do not expose the token to the client.
 */
export const FIGMA_ACCESS_TOKEN = import.meta.env.VITE_FIGMA_ACCESS_TOKEN || ''

/** Flow steps UI – Mobile-DAP design */
export const FIGMA_FLOW_STEPS_FILE_KEY = 'dbgumXNZMgcxcnRtFu09OJ'
export const FIGMA_FLOW_STEPS_NODE_ID = '1520-28989'

export function getFlowStepsDesignUrl() {
  return `https://www.figma.com/design/${FIGMA_FLOW_STEPS_FILE_KEY}/Mobile-DAP?node-id=${FIGMA_FLOW_STEPS_NODE_ID}`
}
