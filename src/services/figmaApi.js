import { FIGMA_ACCESS_TOKEN, FIGMA_FLOW_STEPS_FILE_KEY, FIGMA_FLOW_STEPS_NODE_ID } from '../config/figma'

// In dev we use Vite proxy so the token stays server-side and CORS is avoided
const FIGMA_API_BASE =
  import.meta.env.DEV ? `${window.location.origin}/figma-api/v1` : 'https://api.figma.com/v1'

/**
 * Convert node-id from URL format (1007-11114) to API format (1007:11114).
 * @param {string} nodeId - e.g. "1007-11114"
 * @returns {string} - e.g. "1007:11114"
 */
function toApiNodeId(nodeId) {
  return nodeId ? nodeId.replace(/-/g, ':') : ''
}

/**
 * Fetch a Figma file (full document or specific nodes).
 * @param {object} options
 * @param {string} [options.fileKey] - Figma file key (default: FIGMA_FILE_KEY)
 * @param {string|string[]} [options.nodeIds] - Optional node ID(s) to fetch (URL format e.g. "1007-11114")
 * @param {number} [options.depth] - Optional tree depth
 * @returns {Promise<object>} - Figma file/nodes response
 */
export async function fetchFigmaFile({ fileKey = FIGMA_FLOW_STEPS_FILE_KEY, nodeIds, depth } = {}) {
  if (!FIGMA_ACCESS_TOKEN) {
    throw new Error('Figma API token not configured. Add VITE_FIGMA_ACCESS_TOKEN to .env.local')
  }

  const params = new URLSearchParams()
  if (nodeIds) {
    const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds]
    params.set('ids', ids.map(toApiNodeId).join(','))
  }
  if (depth != null) params.set('depth', String(depth))

  const url = `${FIGMA_API_BASE}/files/${fileKey}${params.toString() ? `?${params}` : ''}`
  const headers = {}
  // Only send token when calling Figma directly (e.g. build); in dev the proxy adds it
  if (!import.meta.env.DEV) headers['X-Figma-Token'] = FIGMA_ACCESS_TOKEN

  const res = await fetch(url, { method: 'GET', headers })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Figma API error ${res.status}: ${text || res.statusText}`)
  }

  return res.json()
}

/**
 * Fetch the Flow steps design (Mobile-DAP, node 1520-28989).
 * @returns {Promise<object>} - Figma response with document and optional nodes
 */
export async function fetchFlowStepsDesign() {
  return fetchFigmaFile({
    fileKey: FIGMA_FLOW_STEPS_FILE_KEY,
    nodeIds: FIGMA_FLOW_STEPS_NODE_ID,
    depth: 2,
  })
}
