import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ticketAPI, metaAPI } from '../services/api';
import toast from 'react-hot-toast';

const statusBadge = (s) => {
  const map = { 'Open':'open','In Progress':'inprogress','Resolved':'resolved','Closed':'closed' };
  return <span className={`badge badge-${map[s]||'open'}`}>{s}</span>;
};
const priorityBadge = (p) => {
  const map = { 'Low':'low','Medium':'medium','High':'high','Critical':'critical' };
  return <span className={`badge badge-${map[p]||'medium'}`}>{p}</span>;
};
const dotClass = (p) => ({ 'Low':'dot-low','Medium':'dot-medium','High':'dot-high','Critical':'dot-critical' }[p]||'dot-medium');

// ══════════════════════════════════════════════════════════════
// TICKETS LIST PAGE
// ══════════════════════════════════════════════════════════════
export function TicketsPage() {
  const [tickets,    setTickets]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status:   searchParams.get('status')   || '',
    priority: searchParams.get('priority') || '',
    category: '',
  });

  const load = (f = filters) => {
    setLoading(true);
    const params = {};
    if (f.status)   params.status   = f.status;
    if (f.priority) params.priority = f.priority;
    if (f.category) params.category = f.category;
    ticketAPI.getAll(params)
      .then(r => setTickets(r.data))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    metaAPI.categories().then(r => setCategories(r.data.categories)).catch(() => {});
    load();
  }, []);

  const applyFilter = (key, val) => {
    const nf = { ...filters, [key]: val };
    setFilters(nf);
    load(nf);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Ticket #${id}?`)) return;
    try {
      await ticketAPI.delete(id);
      toast.success(`Ticket #${id} deleted`);
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">All Tickets</h1>
          <p className="page-sub">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/create" className="btn btn-primary">+ New Ticket</Link>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <select className="form-control" style={{ width:'auto' }} value={filters.status} onChange={e => applyFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            {['Open','In Progress','Resolved','Closed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-control" style={{ width:'auto' }} value={filters.priority} onChange={e => applyFilter('priority', e.target.value)}>
            <option value="">All Priorities</option>
            {['Low','Medium','High','Critical'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="form-control" style={{ width:'auto' }} value={filters.category} onChange={e => applyFilter('category', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(filters.status || filters.priority || filters.category) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ status:'', priority:'', category:'' }); load({ status:'', priority:'', category:'' }); }}>
              ✕ Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? <div className="loading-center"><div className="spinner"/></div> : (
        <div className="card">
          {tickets.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize:48 }}>🎫</div>
              <h3>No tickets found</h3>
              <p>Try changing your filters or create a new ticket.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>Employee</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.ticket_id}>
                      <td style={{ fontWeight:600, color:'var(--primary-light)' }}>#{t.ticket_id}</td>
                      <td>
                        <div style={{ fontWeight:500, fontSize:'.875rem' }}>{t.employee_name}</div>
                        <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{t.department}</div>
                      </td>
                      <td style={{ fontSize:'.875rem' }}>{t.issue_category}</td>
                      <td style={{ maxWidth:200 }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:'.875rem', color:'var(--text-secondary)' }}>
                          {t.description}
                        </div>
                      </td>
                      <td>{priorityBadge(t.priority)}</td>
                      <td>{statusBadge(t.status)}</td>
                      <td style={{ fontSize:'.8rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <Link to={`/tickets/${t.ticket_id}`} className="btn btn-outline btn-sm">View</Link>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.ticket_id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CREATE TICKET PAGE
// ══════════════════════════════════════════════════════════════
export function CreateTicketPage() {
  const navigate = useNavigate();
  const [categories,  setCategories]  = useState([]);
  const [departments, setDepartments] = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});
  const [form, setForm] = useState({
    employee_name: '', department: '', issue_category: '',
    description: '', priority: 'Medium',
  });

  useEffect(() => {
    metaAPI.categories().then(r  => setCategories(r.data.categories)).catch(()=>{});
    metaAPI.departments().then(r => setDepartments(r.data.departments)).catch(()=>{});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.employee_name.trim()) e.employee_name = 'Employee name is required';
    if (!form.department)           e.department    = 'Department is required';
    if (!form.issue_category)       e.issue_category= 'Category is required';
    if (form.description.trim().length < 10) e.description = 'Description must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await ticketAPI.create(form);
      toast.success(`Ticket #${res.data.ticket_id} created successfully!`);
      navigate(`/tickets/${res.data.ticket_id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create ticket');
    } finally { setSaving(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header">
        <h1 className="page-title">Create Support Ticket</h1>
        <p className="page-sub">Fill in the details below to raise a new support request.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Employee Name <span className="req">*</span></label>
              <input className={`form-control ${errors.employee_name?'error':''}`} placeholder="Your full name" {...f('employee_name')}/>
              {errors.employee_name && <div className="form-error">{errors.employee_name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Department <span className="req">*</span></label>
              <select className={`form-control ${errors.department?'error':''}`} {...f('department')}>
                <option value="">Select department…</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <div className="form-error">{errors.department}</div>}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Issue Category <span className="req">*</span></label>
              <select className={`form-control ${errors.issue_category?'error':''}`} {...f('issue_category')}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.issue_category && <div className="form-error">{errors.issue_category}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-control" {...f('priority')}>
                {['Low','Medium','High','Critical'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Description <span className="req">*</span></label>
            <textarea className={`form-control ${errors.description?'error':''}`} rows={5}
              placeholder="Describe your issue in detail — what happened, when it started, what you have already tried…"
              {...f('description')}/>
            {errors.description && <div className="form-error">{errors.description}</div>}
            <div style={{ fontSize:'.75rem', color:'var(--text-muted)', marginTop:4 }}>
              {form.description.length} characters (minimum 10)
            </div>
          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:8, borderTop:'1px solid var(--border)' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/tickets')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TICKET DETAIL PAGE
// ══════════════════════════════════════════════════════════════
export function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({ status:'', priority:'', resolution_notes:'' });

  useEffect(() => {
    ticketAPI.getOne(id)
      .then(r => {
        setTicket(r.data);
        setForm({ status: r.data.status, priority: r.data.priority, resolution_notes: r.data.resolution_notes || '' });
      })
      .catch(() => { toast.error('Ticket not found'); navigate('/tickets'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await ticketAPI.update(id, form);
      setTicket(res.data);
      setEditing(false);
      toast.success('Ticket updated successfully!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete Ticket #${id}? This cannot be undone.`)) return;
    try {
      await ticketAPI.delete(id);
      toast.success('Ticket deleted');
      navigate('/tickets');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;
  if (!ticket) return null;

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize:'.8rem', color:'var(--text-muted)', marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>
        <a href="/tickets">Tickets</a> <span>›</span> <span>Ticket #{ticket.ticket_id}</span>
      </div>

      {/* Header card */}
      <div className="card mb-4">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <span style={{ fontSize:.75+'rem', fontWeight:600, color:'var(--primary-light)' }}>Ticket #{ticket.ticket_id}</span>
              {statusBadge(ticket.status)}
              {priorityBadge(ticket.priority)}
              <span className="badge" style={{ background:'#F1F5F9', color:'#475569' }}>{ticket.issue_category}</span>
            </div>
            <div style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--primary)', marginBottom:6 }}>{ticket.issue_category} — {ticket.department}</div>
            <div style={{ fontSize:'.875rem', color:'var(--text-secondary)' }}>
              Raised by <strong>{ticket.employee_name}</strong> · {new Date(ticket.created_at).toLocaleString()}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card mb-4">
        <div className="card-title">Issue Description</div>
        <p style={{ fontSize:'.9375rem', color:'var(--text-primary)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{ticket.description}</p>
      </div>

      {/* Resolution notes */}
      {ticket.resolution_notes && !editing && (
        <div className="card mb-4" style={{ borderLeft:'3px solid var(--success)', borderRadius:'0 var(--radius-lg) var(--radius-lg) 0' }}>
          <div className="card-title" style={{ color:'var(--success)' }}>✅ Resolution Notes</div>
          <p style={{ fontSize:'.9rem', color:'var(--text-primary)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{ticket.resolution_notes}</p>
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div className="card mb-4">
          <div className="card-title">Update Ticket</div>
          <form onSubmit={handleUpdate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                  {['Open','In Progress','Resolved','Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-control" value={form.priority} onChange={e => setForm({...form, priority:e.target.value})}>
                  {['Low','Medium','High','Critical'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Resolution Notes</label>
              <textarea className="form-control" rows={4}
                placeholder="Describe how the issue was resolved…"
                value={form.resolution_notes} onChange={e => setForm({...form, resolution_notes:e.target.value})}/>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meta info */}
      <div className="card">
        <div className="card-title">Ticket Information</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px' }}>
          {[
            ['Ticket ID',    `#${ticket.ticket_id}`],
            ['Employee',     ticket.employee_name],
            ['Department',   ticket.department],
            ['Category',     ticket.issue_category],
            ['Priority',     ticket.priority],
            ['Status',       ticket.status],
            ['Created',      new Date(ticket.created_at).toLocaleString()],
            ['Last Updated', ticket.updated_at ? new Date(ticket.updated_at).toLocaleString() : '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:'.75rem', color:'var(--text-muted)', fontWeight:500, textTransform:'uppercase', letterSpacing:'.3px' }}>{label}</div>
              <div style={{ fontSize:'.875rem', color:'var(--text-primary)', marginTop:2, fontWeight:500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SEARCH PAGE
// ══════════════════════════════════════════════════════════════
export function SearchPage() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched,setSearched]= useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await ticketAPI.search(query.trim());
      setResults(res.data.results);
    } catch { toast.error('Search failed'); setResults([]); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Search Tickets</h1>
        <p className="page-sub">Search by keyword, employee name, category, or description.</p>
      </div>

      {/* Search bar */}
      <div className="card mb-4">
        <form onSubmit={handleSearch} style={{ display:'flex', gap:10 }}>
          <input className="form-control" style={{ flex:1, fontSize:'1rem' }}
            placeholder="Search tickets… e.g. VPN, password, laptop, John"
            value={query} onChange={e => setQuery(e.target.value)} autoFocus/>
          <button className="btn btn-primary" type="submit" style={{ padding:'0 24px', fontSize:'1rem' }} disabled={loading}>
            {loading ? '…' : 'Search'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : searched ? (
        <div className="card">
          <div style={{ marginBottom:16, fontSize:'.875rem', color:'var(--text-muted)' }}>
            {results.length > 0
              ? <><strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"</>
              : <>No results found for "<strong>{query}</strong>"</>
            }
          </div>
          {results.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Employee</th><th>Category</th><th>Description</th><th>Priority</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {results.map(t => (
                    <tr key={t.ticket_id}>
                      <td style={{ fontWeight:600, color:'var(--primary-light)' }}>#{t.ticket_id}</td>
                      <td>
                        <div style={{ fontWeight:500 }}>{t.employee_name}</div>
                        <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{t.department}</div>
                      </td>
                      <td>{t.issue_category}</td>
                      <td style={{ maxWidth:220 }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-secondary)', fontSize:'.875rem' }}>
                          {t.description}
                        </div>
                      </td>
                      <td>{priorityBadge(t.priority)}</td>
                      <td>{statusBadge(t.status)}</td>
                      <td><a href={`/tickets/${t.ticket_id}`} className="btn btn-outline btn-sm">View</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize:48 }}>🔍</div>
              <h3>No tickets found</h3>
              <p>Try different keywords like "VPN", "password", or an employee name.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize:56 }}>🔎</div>
          <h3>Search for tickets</h3>
          <p>Enter a keyword above to find tickets by description, employee, category, or department.</p>
          <div style={{ marginTop:16, display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {['VPN','Password','Laptop','Email','Network'].map(k => (
              <button key={k} className="btn btn-outline btn-sm"
                onClick={() => { setQuery(k); ticketAPI.search(k).then(r => { setResults(r.data.results); setSearched(true); }); }}>
                {k}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketsPage;
