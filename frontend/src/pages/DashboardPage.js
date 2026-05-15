import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketAPI } from '../services/api';

const statusBadge = (s) => {
  const map = { 'Open':'open', 'In Progress':'inprogress', 'Resolved':'resolved', 'Closed':'closed' };
  return <span className={`badge badge-${map[s]||'open'}`}>{s}</span>;
};
const priorityBadge = (p) => {
  const map = { 'Low':'low','Medium':'medium','High':'high','Critical':'critical' };
  return <span className={`badge badge-${map[p]||'medium'}`}>{p}</span>;
};

export default function DashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ticketAPI.dashboard(),
      ticketAPI.getAll({ limit: 5 }),
    ]).then(([s, r]) => {
      setStats(s.data);
      setRecent(r.data);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Overview of all support tickets</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Tickets</div>
          <div className="stat-value">{stats?.total_tickets ?? 0}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Open</div>
          <div className="stat-value">{stats?.open_tickets ?? 0}</div>
          <div className="stat-sub">Awaiting action</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats?.in_progress ?? 0}</div>
          <div className="stat-sub">Being worked on</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{stats?.resolved_tickets ?? 0}</div>
          <div className="stat-sub">Completed</div>
        </div>
        <div className="stat-card gray">
          <div className="stat-label">Closed</div>
          <div className="stat-value">{stats?.closed_tickets ?? 0}</div>
          <div className="stat-sub">Archived</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Critical</div>
          <div className="stat-value">{stats?.critical_tickets ?? 0}</div>
          <div className="stat-sub">Urgent issues</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-4">
        <div className="card-title">Quick Actions</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <Link to="/create"  className="btn btn-primary">+ Create Ticket</Link>
          <Link to="/tickets" className="btn btn-outline">View All Tickets</Link>
          <Link to="/search"  className="btn btn-outline">Search Tickets</Link>
          <Link to="/tickets?status=Open" className="btn btn-outline">Open Tickets ({stats?.open_tickets ?? 0})</Link>
          <Link to="/tickets?priority=Critical" className="btn btn-danger">Critical ({stats?.critical_tickets ?? 0})</Link>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div className="card-title" style={{ marginBottom:0 }}>Recent Tickets</div>
          <Link to="/tickets" style={{ fontSize:'.8rem' }}>View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize:40 }}>🎫</div>
            <h3>No tickets yet</h3>
            <p>Create your first support ticket to get started.</p>
            <Link to="/create" className="btn btn-primary" style={{ marginTop:12, display:'inline-flex' }}>Create First Ticket</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map(t => (
                  <tr key={t.ticket_id}>
                    <td style={{ fontWeight:600, color:'var(--primary-light)' }}>#{t.ticket_id}</td>
                    <td>
                      <div style={{ fontWeight:500 }}>{t.employee_name}</div>
                      <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{t.department}</div>
                    </td>
                    <td>{t.issue_category}</td>
                    <td>{priorityBadge(t.priority)}</td>
                    <td>{statusBadge(t.status)}</td>
                    <td style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/tickets/${t.ticket_id}`} className="btn btn-outline btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
