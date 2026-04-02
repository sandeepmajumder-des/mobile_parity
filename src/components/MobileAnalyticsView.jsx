import { useEffect, useMemo, useState } from 'react'
import { Info, Search, ChevronDown, CalendarDays, Filter, BellRing, ListChecks, GitBranch, Lightbulb, Radio, HelpCircle } from 'lucide-react'
import { initialContentData } from './ContentTable'
import './MobileAnalyticsView.css'

// Calculate content counts from the actual content table data
function getContentCounts(data) {
  const counts = {
    'Flow': 0,
    'Popup': 0,
    'Smart Tip': 0,
    'Beacon': 0,
    'Self Help': 0,
    'Task List': 0,
  }
  
  data.forEach(item => {
    if (!item.isFolder && counts.hasOwnProperty(item.type)) {
      counts[item.type]++
    }
  })
  
  return counts
}

const PERIOD_CHOICES = [
  { id: 'daily', label: 'Daily', range: 'Last 7 days' },
  { id: 'weekly', label: 'Weekly', range: 'Last 6 weeks' },
  { id: 'monthly', label: 'Monthly', range: 'Last 6 months' },
]
const RANGE_CHOICES = [7, 30, 90]

const SUMMARY_BY_PERIOD = {
  daily: {
    cards: [
      { title: 'Unique users reached', value: '958', metric: 'Unique users viewed' },
      { title: 'Unique users engaged', value: '1', metric: 'Unique users engaged' },
      { title: 'Total Whatfix engagement', value: '86', metric: 'Total events' },
    ],
    labels: ['Mar 16', 'Mar 17', 'Mar 18', 'Mar 19', 'Mar 20', 'Mar 21', 'Mar 22'],
    viewed: [3000, 5200, 5150, 5100, 4300, 2600, 2100],
    engaged: [8, 14, 12, 10, 18, 14, 10],
    maxHint: 8000,
  },
  weekly: {
    cards: [
      { title: 'Unique users reached', value: '6.1K', metric: 'Unique users viewed' },
      { title: 'Unique users engaged', value: '42', metric: 'Unique users engaged' },
      { title: 'Total Whatfix engagement', value: '639', metric: 'Total events' },
    ],
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'],
    viewed: [22800, 31400, 30500, 27600, 23200, 20700],
    engaged: [61, 73, 66, 79, 70, 64],
    maxHint: 36000,
  },
  monthly: {
    cards: [
      { title: 'Unique users reached', value: '32.6K', metric: 'Unique users viewed' },
      { title: 'Unique users engaged', value: '224', metric: 'Unique users engaged' },
      { title: 'Total Whatfix engagement', value: '4.1K', metric: 'Total events' },
    ],
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    viewed: [121000, 154000, 173000, 167500, 143000, 129000],
    engaged: [540, 620, 580, 640, 590, 530],
    maxHint: 200000,
  },
}

// Generate widget metrics based on actual content counts
function getWidgetMetrics(contentCounts) {
  return [
    { icon: HelpCircle, title: 'Self Help', value: String(contentCounts['Self Help']), label: 'Self Help created' },
    { icon: BellRing, title: 'Pop-ups', value: String(contentCounts['Popup']), label: 'Pop-ups created' },
    { icon: ListChecks, title: 'Task list', value: String(contentCounts['Task List']), label: 'Task lists created' },
    { icon: GitBranch, title: 'Flows', value: String(contentCounts['Flow']), label: 'Flows created' },
    { icon: Lightbulb, title: 'Smart-tips', value: String(contentCounts['Smart Tip']), label: 'Smart tips created' },
    { icon: Radio, title: 'Beacons', value: String(contentCounts['Beacon']), label: 'Beacons created' },
  ]
}

const POPULAR_CONTENT_ROWS = [
  { id: 1, eventType: 'Pop-up closed by "X" icon', segmentId: '-', segmentName: 'System Outage Notification_312', total: 113 },
  { id: 2, eventType: 'Smart tip shown', segmentId: 'GATEWAY PRO...', segmentName: '-', total: 1 },
]

const ACTIVE_USERS_ROWS = [
  { id: 1, eventName: 'Any Whatfix Events', userId: '427051@ups....', total: 1092 },
  { id: 2, eventName: 'Any Whatfix Events', userId: '704469@ups....', total: 794 },
  { id: 3, eventName: 'Any Whatfix Events', userId: '493652@ups....', total: 645 },
  { id: 4, eventName: 'Any Whatfix Events', userId: '7349045@ups....', total: 624 },
]

const COUNTRY_EVENTS = {
  total: 241936,
  slices: [
    { label: 'United States', value: 195700, color: '#2A77D9' },
    { label: 'Germany', value: 11290, color: '#F2994A' },
    { label: 'Hong Kong SAR China', value: 9730, color: '#56CCF2' },
    { label: 'Others', value: 25216, color: '#CBD5E1' },
  ],
}

const COUNTRY_UNIQUE = {
  total: 7594,
  slices: [
    { label: 'United States', value: 6150, color: '#2A77D9' },
    { label: 'Germany', value: 430, color: '#F2994A' },
    { label: 'Hong Kong SAR China', value: 322, color: '#56CCF2' },
    { label: 'Others', value: 692, color: '#CBD5E1' },
  ],
}

function formatAxisTick(value) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`
  return `${Math.round(value)}`
}

function SummaryLineChart({ labels, viewed, engaged, maxHint }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const maxY = maxHint ?? Math.max(...viewed, ...engaged, 1)
  const minY = 0
  const steps = 4
  const yTicks = Array.from({ length: steps + 1 }, (_, i) => (maxY * (steps - i)) / steps)
  const xGap = labels.length > 1 ? 100 / (labels.length - 1) : 100

  const buildPath = (series) =>
    series
      .map((v, i) => {
        const x = i * xGap
        const y = 100 - ((v - minY) / (maxY - minY || 1)) * 100
        return `${x},${y}`
      })
      .join(' ')

  return (
    <div className="ma-line-chart-wrap">
      <div className="ma-line-chart-grid">
        <div className="ma-line-y-axis">
          {yTicks.map((tick) => (
            <span key={tick} className="ma-line-y-tick">
              {formatAxisTick(tick)}
            </span>
          ))}
        </div>
        <div className="ma-line-plot">
          <svg className="ma-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {yTicks.map((tick) => {
              const y = 100 - ((tick - minY) / (maxY - minY || 1)) * 100
              return <line key={tick} x1="0" y1={y} x2="100" y2={y} className="ma-line-grid-row" />
            })}
            <polyline points={buildPath(viewed)} className="ma-series-viewed" />
            <polyline points={buildPath(engaged)} className="ma-series-engaged" />
          </svg>
          <div className="ma-line-hover-layer">
            {labels.map((label, i) => (
              <button
                key={label}
                type="button"
                className="ma-line-hover-col"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-label={`${label} viewed ${viewed[i]} and engaged ${engaged[i]}`}
              />
            ))}
            {hoveredIndex !== null && (
              <div className="ma-line-tooltip">
                <div className="ma-line-tooltip-title">{labels[hoveredIndex]}</div>
                <div>Users viewed: {viewed[hoveredIndex].toLocaleString()}</div>
                <div>Users engaged: {engaged[hoveredIndex].toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="ma-line-x-axis">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="ma-line-legend">
        <span><i className="ma-legend-dot ma-legend-dot--viewed" />Unique users viewed</span>
        <span><i className="ma-legend-dot ma-legend-dot--engaged" />Unique users engaged</span>
      </div>
    </div>
  )
}

function CountryDonutCard({ title, metricLabel, data }) {
  const topSlices = data.slices.slice(0, 3)
  const gradient = useMemo(() => {
    const total = data.slices.reduce((sum, s) => sum + s.value, 0)
    let cursor = 0
    const stops = data.slices.map((slice) => {
      const start = (cursor / total) * 360
      cursor += slice.value
      const end = (cursor / total) * 360
      return `${slice.color} ${start}deg ${end}deg`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [data])

  return (
    <div className="ma-card ma-country-card">
      <div className="ma-card-head">
        <h3>{title}</h3>
        <p>{metricLabel}</p>
      </div>
      <div className="ma-donut-wrap">
        <div className="ma-donut" style={{ background: gradient }}>
          <div className="ma-donut-center">
            <span>Total</span>
            <strong>{data.total.toLocaleString()}</strong>
          </div>
        </div>
      </div>
      <div className="ma-country-legend">
        {topSlices.map((slice) => (
          <span key={slice.label}>
            <i style={{ background: slice.color }} />
            {slice.label}
          </span>
        ))}
      </div>
    </div>
  )
}

const SYNC_SNACKBAR_MS = 5500

export default function MobileAnalyticsView() {
  const [syncSnackbarVisible, setSyncSnackbarVisible] = useState(true)
  const [period, setPeriod] = useState('daily')
  const [quickRange, setQuickRange] = useState(7)
  const summaryCfg = SUMMARY_BY_PERIOD[period]
  const rangeLabel = `${quickRange} days`
  
  // Calculate content counts from actual data
  const contentCounts = useMemo(() => getContentCounts(initialContentData), [])
  const widgetMetrics = useMemo(() => getWidgetMetrics(contentCounts), [contentCounts])

  useEffect(() => {
    if (!syncSnackbarVisible) return
    const t = setTimeout(() => setSyncSnackbarVisible(false), SYNC_SNACKBAR_MS)
    return () => clearTimeout(t)
  }, [syncSnackbarVisible])

  return (
    <main className="mobile-analytics-view">
      <div className="ma-page-header">
        <div>
          <h1 className="ma-page-title">Summary</h1>
          <p className="ma-page-sub">
            This page offers a high-level overview of key metrics related to your end-users and their engagement with Whatfix content.
          </p>
        </div>
      </div>

      {syncSnackbarVisible && (
        <div className="ma-snackbar" role="status" aria-live="polite">
          <Info size={18} className="ma-snackbar-icon" aria-hidden />
          <span>Synchronization in progress. Please refresh after some time.</span>
          <button
            type="button"
            className="ma-snackbar-dismiss"
            aria-label="Dismiss"
            onClick={() => setSyncSnackbarVisible(false)}
          >
            ×
          </button>
        </div>
      )}

      <div className="ma-toolbar">
        <div className="ma-toolbar-select-wrap">
          <select
            className="ma-toolbar-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            aria-label="Select period"
          >
            {PERIOD_CHOICES.map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.label}
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="ma-toolbar-select-icon" />
        </div>

        <div className="ma-toolbar-range-group" role="group" aria-label="Quick date ranges">
          {RANGE_CHOICES.map((days) => (
            <button
              key={days}
              type="button"
              className={`ma-toolbar-range-btn ${quickRange === days ? 'active' : ''}`}
              onClick={() => setQuickRange(days)}
            >
              {days}D
            </button>
          ))}
          <button type="button" className="ma-toolbar-range-btn ma-toolbar-range-btn--icon" aria-label="Open calendar">
            <CalendarDays size={16} />
          </button>
        </div>

        <button type="button" className="ma-toolbar-chip ma-toolbar-chip--date">
          <CalendarDays size={16} />
          16 - 22 Mar 2026 • {rangeLabel}
        </button>

        <button type="button" className="ma-toolbar-chip ma-toolbar-chip--filter">
          <Filter size={16} />
          Filter
          <span className="ma-toolbar-badge">1</span>
        </button>
      </div>

      <section className="ma-section">
        <div className="ma-summary-grid">
          {summaryCfg.cards.map((card) => (
            <div key={card.title} className="ma-card">
              <div className="ma-card-head">
                <h3>{card.title}</h3>
                <p>{PERIOD_CHOICES.find((item) => item.id === period)?.range}</p>
              </div>
              <div className="ma-card-metric">{card.metric}</div>
              <div className="ma-card-value">{card.value}</div>
            </div>
          ))}
        </div>
        <div className="ma-card ma-line-card">
          <div className="ma-card-head">
            <h3>Engagement with Whatfix</h3>
            <p>{PERIOD_CHOICES.find((item) => item.id === period)?.range}</p>
          </div>
          <SummaryLineChart
            labels={summaryCfg.labels}
            viewed={summaryCfg.viewed}
            engaged={summaryCfg.engaged}
            maxHint={summaryCfg.maxHint}
          />
        </div>
      </section>

      <section className="ma-section">
        <h2 className="ma-section-title">Widget metrics</h2>
        <p className="ma-section-sub">Content created in the application - data fetched from the Content table.</p>
        <div className="ma-widget-grid">
          {widgetMetrics.map((widget) => {
            const Icon = widget.icon
            return (
              <div key={widget.title} className="ma-card ma-widget-card">
                <div className="ma-card-head">
                  <h3><Icon size={14} />{widget.title}</h3>
                  <p>Total count</p>
                </div>
                <div className="ma-card-metric">{widget.label}</div>
                <div className="ma-card-value">{widget.value}</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="ma-section">
        <div className="ma-section-head-inline">
          <h2 className="ma-section-title">Most common content</h2>
          <button type="button" className="ma-search-btn" aria-label="Search content">
            <Search size={14} />
          </button>
        </div>
        <div className="ma-table-wrap">
          <table className="ma-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Segment_id</th>
                <th>Segment Name</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {POPULAR_CONTENT_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>{row.eventType}</td>
                  <td className="ma-td-muted">{row.segmentId}</td>
                  <td className="ma-td-muted">{row.segmentName}</td>
                  <td>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ma-section">
        <div className="ma-section-head-inline">
          <h2 className="ma-section-title">Engagement metrics</h2>
          <button type="button" className="ma-search-btn" aria-label="Search users">
            <Search size={14} />
          </button>
        </div>
        <div className="ma-table-wrap">
          <table className="ma-table">
            <thead>
              <tr>
                <th>Event name</th>
                <th>User Id</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVE_USERS_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>{row.eventName}</td>
                  <td className="ma-td-muted">{row.userId}</td>
                  <td>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ma-section">
        <h2 className="ma-section-title">10 most active countries</h2>
        <div className="ma-country-grid">
          <CountryDonutCard title="10 most active countries (by total events)" metricLabel="Total events" data={COUNTRY_EVENTS} />
          <CountryDonutCard title="10 most active countries (by unique users)" metricLabel="Unique users" data={COUNTRY_UNIQUE} />
        </div>
      </section>
    </main>
  )
}
