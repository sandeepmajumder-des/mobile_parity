# Mobile Content Dashboard

A pixel-perfect MVP of the content management screen for mobile dashboard, built with React and Vite.

## Features

- **Sidebar Navigation** - Full navigation menu with account switcher
- **Content Table** - List view with sortable columns
- **Platform Icons** - Android and iOS platform indicators
- **Member Avatars** - Color-coded team member indicators
- **Tabs** - Draft, Published, Unpublished content filtering
- **Search & Filters** - Search box with filter options
- **Pagination** - Full pagination controls
- **View Toggles** - Grid, columns, and list view options

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **CSS** - Custom styling (no frameworks)

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx       # Left navigation sidebar
│   ├── Sidebar.css
│   ├── ContentArea.jsx   # Main content area wrapper
│   ├── ContentArea.css
│   ├── ContentTable.jsx  # Data table component
│   └── ContentTable.css
├── App.jsx               # Root component
├── App.css
├── main.jsx              # Entry point
└── index.css             # Global styles
```
