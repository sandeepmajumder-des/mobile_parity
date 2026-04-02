import { Play, Pencil, MoreHorizontal } from 'lucide-react'
import './ContentTable.css'

const contentData = [
  {
    id: 1,
    name: 'Employee onboarding',
    type: 'Folder',
    count: 5,
    isFolder: true,
    platform: null,
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 2,
    name: 'Welcome tour',
    type: 'Flow',
    isFolder: false,
    platform: 'android',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 3,
    name: 'Feature announcement',
    type: 'Popup',
    isFolder: false,
    platform: 'android',
    members: ['S', 'M'],
    lastUpdated: 'June 25, 2024',
    lastUpdatedBy: 'Sarah Miller'
  },
  {
    id: 4,
    name: 'Profile completion tip',
    type: 'Smart Tip',
    isFolder: false,
    platform: 'ios',
    members: ['A', 'R'],
    lastUpdated: 'June 24, 2024',
    lastUpdatedBy: 'Alex Rivera'
  },
  {
    id: 5,
    name: 'New message indicator',
    type: 'Beacon',
    isFolder: false,
    platform: 'android',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 23, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 6,
    name: 'App settings guide',
    type: 'Self Help',
    isFolder: false,
    platform: 'ios',
    members: ['M', 'R'],
    lastUpdated: 'June 22, 2024',
    lastUpdatedBy: 'Mike Chen'
  },
  {
    id: 7,
    name: 'Account setup checklist',
    type: 'Task List',
    isFolder: false,
    platform: 'android',
    members: ['S', 'A'],
    lastUpdated: 'June 21, 2024',
    lastUpdatedBy: 'Sarah Miller'
  },
  {
    id: 8,
    name: 'Checkout flow walkthrough',
    type: 'Flow',
    isFolder: false,
    platform: 'ios',
    members: ['A', 'R', 'M'],
    lastUpdated: 'June 20, 2024',
    lastUpdatedBy: 'Alex Rivera'
  },
  {
    id: 9,
    name: 'Subscription upgrade prompt',
    type: 'Popup',
    isFolder: false,
    platform: 'ios',
    members: ['S', 'M'],
    lastUpdated: 'June 19, 2024',
    lastUpdatedBy: 'Mike Chen'
  },
  {
    id: 10,
    name: 'Search filter helper',
    type: 'Smart Tip',
    isFolder: false,
    platform: 'android',
    members: ['A', 'R'],
    lastUpdated: 'June 18, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 11,
    name: 'Cart item highlight',
    type: 'Beacon',
    isFolder: false,
    platform: 'ios',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 17, 2024',
    lastUpdatedBy: 'Sarah Miller'
  },
  {
    id: 12,
    name: 'FAQ & Troubleshooting',
    type: 'Self Help',
    isFolder: false,
    platform: 'android',
    members: ['M', 'R'],
    lastUpdated: 'June 16, 2024',
    lastUpdatedBy: 'Mike Chen'
  },
  {
    id: 13,
    name: 'First purchase checklist',
    type: 'Task List',
    isFolder: false,
    platform: 'ios',
    members: ['S', 'A'],
    lastUpdated: 'June 15, 2024',
    lastUpdatedBy: 'Alex Rivera'
  },
]

// Add status to items for Draft/Published/Unpublished filtering
function withStatus(items, defaultStatus = 'published') {
  return items.map(item => ({
    ...item,
    status: item.status ?? defaultStatus
  }))
}

export const initialContentData = withStatus(contentData)

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5C3 3.89543 3.89543 3 5 3H7.58579C8.11622 3 8.62493 3.21071 9 3.58579L10 4.58579C10.3751 4.96086 10.8838 5.17157 11.4142 5.17157H15C16.1046 5.17157 17 6.067 17 7.17157V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5Z" fill="#F5A623"/>
    </svg>
  )
}

// Content type icons
function FlowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3V17M10 3L6 7M10 3L14 7" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10H7M17 10H13" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 13L10 17L13 13" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PopupIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="12" rx="2" stroke="#6B697B" strokeWidth="1.5"/>
      <path d="M3 8H17" stroke="#6B697B" strokeWidth="1.5"/>
      <circle cx="5.5" cy="6" r="0.75" fill="#6B697B"/>
      <circle cx="7.5" cy="6" r="0.75" fill="#6B697B"/>
    </svg>
  )
}

function SmartTipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 4H16C16.5523 4 17 4.44772 17 5V13C17 13.5523 16.5523 14 16 14H6L3 17V5C3 4.44772 3.44772 4 4 4Z" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 7V10" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="12" r="0.75" fill="#6B697B"/>
    </svg>
  )
}

function BeaconIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3" stroke="#6B697B" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="7" stroke="#6B697B" strokeWidth="1.5" strokeDasharray="2 2"/>
    </svg>
  )
}

function SelfHelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="#6B697B" strokeWidth="1.5"/>
      <path d="M8 8C8 6.89543 8.89543 6 10 6C11.1046 6 12 6.89543 12 8C12 8.74028 11.5978 9.38663 11 9.73244V11" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="13.5" r="0.75" fill="#6B697B"/>
    </svg>
  )
}

function TaskListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 5L5.5 6.5L8 4" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 5H16" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 10L5.5 11.5L8 9" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 10H16" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 15L5.5 16.5L8 14" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 15H16" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// Get icon based on content type
function getContentTypeIcon(type) {
  switch (type) {
    case 'Flow': return <FlowIcon />
    case 'Popup': return <PopupIcon />
    case 'Smart Tip': return <SmartTipIcon />
    case 'Beacon': return <BeaconIcon />
    case 'Self Help': return <SelfHelpIcon />
    case 'Task List': return <TaskListIcon />
    default: return <FlowIcon />
  }
}

function AndroidIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 9V14.5C5 15.0523 5.44772 15.5 6 15.5H6.5V18C6.5 18.5523 6.94772 19 7.5 19C8.05228 19 8.5 18.5523 8.5 18V15.5H11.5V18C11.5 18.5523 11.9477 19 12.5 19C13.0523 19 13.5 18.5523 13.5 18V15.5H14C14.5523 15.5 15 15.0523 15 14.5V9H5Z" fill="#3DDC84"/>
      <path d="M3.5 9C3.22386 9 3 9.22386 3 9.5V13.5C3 13.7761 3.22386 14 3.5 14C3.77614 14 4 13.7761 4 13.5V9.5C4 9.22386 3.77614 9 3.5 9Z" fill="#3DDC84"/>
      <path d="M16.5 9C16.2239 9 16 9.22386 16 9.5V13.5C16 13.7761 16.2239 14 16.5 14C16.7761 14 17 13.7761 17 13.5V9.5C17 9.22386 16.7761 9 16.5 9Z" fill="#3DDC84"/>
      <path d="M5 9C5 6.23858 7.23858 4 10 4C12.7614 4 15 6.23858 15 9H5Z" fill="#3DDC84"/>
      <circle cx="7.5" cy="6.5" r="0.75" fill="white"/>
      <circle cx="12.5" cy="6.5" r="0.75" fill="white"/>
      <path d="M7 3L8 4.5" stroke="#3DDC84" strokeWidth="0.75" strokeLinecap="round"/>
      <path d="M13 3L12 4.5" stroke="#3DDC84" strokeWidth="0.75" strokeLinecap="round"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M14.5 16C13.8 17 13.1 18 12 18C10.9 18 10.5 17.3 9.2 17.3C7.9 17.3 7.4 18 6.4 18C5.3 18 4.5 16.9 3.8 15.9C2.4 13.8 1.3 10 2.8 7.5C3.5 6.2 4.8 5.4 6.2 5.4C7.3 5.4 8.3 6.1 9 6.1C9.7 6.1 10.8 5.3 12.2 5.4C12.7 5.4 14.3 5.6 15.3 7.1C15.2 7.2 13.5 8.2 13.5 10.4C13.5 13 15.7 13.9 15.7 13.9C15.7 14 15 15.2 14.5 16Z" fill="#555"/>
      <path d="M10 2.5C10.6 1.8 11.5 1.3 12.3 1.3C12.4 2.3 12 3.3 11.4 4C10.8 4.7 9.9 5.2 9 5.1C8.9 4.2 9.4 3.2 10 2.5Z" fill="#555"/>
    </svg>
  )
}

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3V13M8 3L5 6M8 3L11 6" stroke="#8C899F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SortAscIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 13V3M8 3L5 6M8 3L11 6" stroke="#8C899F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ContentTable({ items, selectedIds = [], onSelectionChange, onEditItem }) {
  const data = items != null ? items : contentData
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange?.(data.map(item => item.id))
    } else {
      onSelectionChange?.([])
    }
  }
  
  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      onSelectionChange?.([...selectedIds, itemId])
    } else {
      onSelectionChange?.(selectedIds.filter(id => id !== itemId))
    }
  }
  
  const allSelected = data.length > 0 && selectedIds.length === data.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length
  
  return (
    <div className="table-container">
      <table className="content-table">
        <thead>
          <tr>
            <th className="col-checkbox">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected }}
                  onChange={handleSelectAll}
                />
              </div>
            </th>
            <th className="col-name">
              <div className="th-content">
                <span>Name</span>
                <SortIcon />
              </div>
            </th>
            <th className="col-type">Type</th>
            <th className="col-platform">Platform</th>
            <th className="col-members">Members</th>
            <th className="col-updated">
              <div className="th-content">
                <span>Last updated on</span>
                <SortAscIcon />
              </div>
            </th>
            <th className="col-updatedby">Last updated by</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className={selectedIds.includes(item.id) ? 'row-selected' : ''}>
              <td className="col-checkbox">
                <div className="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(item.id)}
                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                  />
                </div>
              </td>
              <td className="col-name">
                <div className="name-cell">
                  {item.isFolder ? <FolderIcon /> : getContentTypeIcon(item.type)}
                  <span className="name-text">{item.name}</span>
                  {item.count && <span className="item-count">{item.count}</span>}
                  {!item.isFolder && (
                    <div className="name-cell-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="name-cell-action-btn name-cell-action-btn--ghost"
                        title="Play"
                        aria-label={`Play ${item.name}`}
                      >
                        <Play size={18} strokeWidth={1.5} aria-hidden />
                      </button>
                      <span className="name-cell-tooltip-host">
                        <button
                          type="button"
                          className="name-cell-action-btn name-cell-action-btn--edit"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => onEditItem?.(item)}
                        >
                          <Pencil size={14} strokeWidth={1.75} aria-hidden />
                        </button>
                        <span className="name-cell-action-tooltip" role="tooltip">
                          Edit
                        </span>
                      </span>
                      <button
                        type="button"
                        className="name-cell-action-btn name-cell-action-btn--ghost"
                        title="More options"
                        aria-label={`More options for ${item.name}`}
                      >
                        <MoreHorizontal size={18} strokeWidth={1.5} aria-hidden />
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td className="col-type">
                <span className="type-label">{item.type}</span>
              </td>
              <td className="col-platform">
                <div className="platform-cell">
                  {item.platform === 'android' && <AndroidIcon />}
                  {item.platform === 'ios' && <AppleIcon />}
                </div>
              </td>
              <td className="col-members">
                <div className="members-cell">
                  {item.members.map((member, idx) => (
                    <span key={idx} className="member-avatar">
                      {member}
                    </span>
                  ))}
                </div>
              </td>
              <td className="col-updated">{item.lastUpdated}</td>
              <td className="col-updatedby">{item.lastUpdatedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ContentTable
