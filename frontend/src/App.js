import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import DashboardPage      from './pages/DashboardPage';
import TicketsPage        from './pages/TicketsPage';
import CreateTicketPage   from './pages/CreateTicketPage';
import TicketDetailPage   from './pages/TicketDetailPage';
import SearchPage         from './pages/SearchPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';   // ← Phase 2

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const ICONS = {
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  tickets:   "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  create:    "M12 5v14M5 12h14",
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z",
  analytics: "M18 20V10M12 20V4M6 20v-6",
};

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Help<span>Desk</span></h2>
        <p>Ticket Management System</p>
      </div>
      <nav className="sidebar-nav">
        {[
          { to: '/',          icon: ICONS.dashboard, label: 'Dashboard'     },
          { to: '/tickets',   icon: ICONS.tickets,   label: 'All Tickets'   },
          { to: '/create',    icon: ICONS.create,    label: 'New Ticket'    },
          { to: '/search',    icon: ICONS.search,    label: 'Search'        },
          { to: '/analytics', icon: ICONS.analytics, label: 'ETL Analytics' },
        ].map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon d={icon} size={16}/>
            {label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.1)', fontSize: '.75rem', color: 'rgba(255,255,255,.4)' }}>
        EKBMS Capstone Project v2.0
      </div>
    </aside>
  );
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const titles = {
    '/':           'Dashboard',
    '/tickets':    'All Tickets',
    '/create':     'Create Ticket',
    '/search':     'Search Tickets',
    '/analytics':  'ETL Analytics Dashboard',
  };
  const title = titles[location.pathname] || 'Ticket Details';

  return (
    <header className="app-header">
      <span className="header-title">{title}</span>
      <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>
        + New Ticket
      </button>
    </header>
  );
}

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar/>
      <div className="main-content">
        <Header/>
        <div className="page">
          <Routes>
            <Route path="/"             element={<DashboardPage/>}/>
            <Route path="/tickets"      element={<TicketsPage/>}/>
            <Route path="/tickets/:id"  element={<TicketDetailPage/>}/>
            <Route path="/create"       element={<CreateTicketPage/>}/>
            <Route path="/search"       element={<SearchPage/>}/>
            <Route path="/analytics"    element={<AnalyticsDashboard/>}/>
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout/>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: "'Inter', sans-serif", fontSize: '.875rem' } }}/>
    </BrowserRouter>
  );
}
