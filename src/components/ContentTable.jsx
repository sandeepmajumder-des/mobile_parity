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
    name: 'Introduction to the team',
    type: 'Lorem',
    isFolder: false,
    platform: 'android',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 3,
    name: 'Dummy Flow',
    type: 'Lorem',
    isFolder: false,
    platform: 'android',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 4,
    name: 'Dummy Flow',
    type: 'Lorem',
    isFolder: false,
    platform: 'android',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 5,
    name: 'Dummy Flow',
    type: 'Lorem',
    isFolder: false,
    platform: 'android',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 6,
    name: 'Dummy Flow',
    type: 'Lorem',
    isFolder: false,
    platform: 'ios',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 7,
    name: 'Dummy Flow',
    type: 'Lorem',
    isFolder: false,
    platform: 'ios',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 8,
    name: 'Dummy Flow',
    type: 'Lorem',
    isFolder: false,
    platform: 'ios',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 9,
    name: 'Dummy Flow',
    type: 'Lorem',
    isFolder: false,
    platform: 'ios',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 10,
    name: 'Dummy Flow',
    type: 'Lorem',
    isFolder: false,
    platform: 'ios',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 11,
    name: 'Dummy Flow',
    type: 'Lorem',
    isFolder: false,
    platform: 'android',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
  {
    id: 12,
    name: 'Dummy Flow',
    type: 'Lorem',
    isFolder: false,
    platform: 'android',
    members: ['S', 'A', 'R'],
    lastUpdated: 'June 26, 2024',
    lastUpdatedBy: 'John G Tom'
  },
]

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5C3 3.89543 3.89543 3 5 3H7.58579C8.11622 3 8.62493 3.21071 9 3.58579L10 4.58579C10.3751 4.96086 10.8838 5.17157 11.4142 5.17157H15C16.1046 5.17157 17 6.067 17 7.17157V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5Z" fill="#F5A623"/>
    </svg>
  )
}

function DirectionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3V17M10 3L6 7M10 3L14 7" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10H7M17 10H13" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 13L10 17L13 13" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MouseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="4" width="12" height="16" rx="6" stroke="#6B697B" strokeWidth="1.5"/>
      <path d="M12 8V10" stroke="#6B697B" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
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

function ContentTable() {
  return (
    <div className="table-container">
      <table className="content-table">
        <thead>
          <tr>
            <th className="col-checkbox">
              <div className="checkbox-wrapper">
                <input type="checkbox" />
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
          {contentData.map((item) => (
            <tr key={item.id}>
              <td className="col-checkbox">
                <div className="checkbox-wrapper">
                  <input type="checkbox" />
                </div>
              </td>
              <td className="col-name">
                <div className="name-cell">
                  {item.isFolder ? <FolderIcon /> : <DirectionsIcon />}
                  <span className="name-text">{item.name}</span>
                  {item.count && <span className="item-count">{item.count}</span>}
                </div>
              </td>
              <td className="col-type">
                <div className="type-cell">
                  {!item.isFolder && <MouseIcon />}
                  <span>{item.type}</span>
                </div>
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
