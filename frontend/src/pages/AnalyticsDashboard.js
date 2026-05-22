import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://127.0.0.1:8000' });

const TABS = ['Overview', 'Categories', 'Departments', 'Monthly Trend', 'Resolution Time', 'ETL Status'];

const PRIORITY_COLORS = { Critical: '#C00000', High: '#E8700A', Medium: '#2E75B6', Low: '#217346' };
const STATUS_COLORS   = { Open: '#E8700A', 'In Progress': '#2E75B6', Resolved: '#217346', Closed: '#888' };

export default function AnalyticsDashboard() {
  const [tab,     setTab]     = useState(0);
  const [data,    setData]    = useState({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    Promise.all([
      API.get('/analytics/dashboard'),
      API.get('/analytics/categories'),
      API.get('/analytics/priorities'),
      API.get('/analytics/departments'),
      API.get('/analytics/monthly-trend'),
      API.get('/analytics/resolution-time'),
      API.get('/analytics/status-summary'),
      API.get('/analytics/etl-status'),
    ])
      .then(([dash, cat, pri, dept, monthly, resTime, status, etl]) => {
        setData({
          dash:    dash.data,
          cat:     cat.data.categories    || [],
          pri:     pri.data.priorities    || [],
          dept:    dept.data.departments  || [],
          monthly: monthly.data.trend     || [],
          resTime: resTime.data.distribution || [],
          status:  status.data.statuses   || [],
          etl:     etl.data.etl           || {},
        });
      })
      .catch(() => setError('Could not load analytics. Make sure ETL has been run and API is running on port 8000.'))
      .finally(() => setLoading(false));
  }, []);

  const s = {
    page:    { padding: 24, fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#F5F6FA' },
    header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title:   { fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0 },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
    kpi:     (color) => ({ background: color || '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px' }),
    kpiL:    { fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 },
    kpiV:    { fontSize: 26, fontWeight: 700, color: '#1a1a1a' },
    card:    { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 20, marginBottom: 16 },
    cardT:   { fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#1a1a1a' },
    tabs:    { display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' },
    tab:     (a) => ({ padding: '6px 14px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 13, cursor: 'pointer', background: a ? '#1a1a2e' : '#fff', color: a ? '#fff' : '#555', fontWeight: a ? 500 : 400 }),
    table:   { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th:      { padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', borderBottom: '1px solid #E5E7EB', letterSpacing: '.05em' },
    td:      { padding: '9px 12px', borderBottom: '1px solid #f5f5f5', color: '#333' },
    badge:   (c, bg) => ({ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: bg || '#EEF2F7', color: c || '#444', fontWeight: 500 }),
    bar:     { height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden', marginTop: 4 },
    grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 16 }}>Loading analytics...</div>;
  if (error)   return <div style={{ padding: 40, textAlign: 'center', color: '#C00', fontSize: 14 }}>{error}</div>;

  const kpis = data.dash?.kpis || {};
  const maxCat  = Math.max(...(data.cat.map(c=>c.ticket_count)||[1]));
  const maxDept = Math.max(...(data.dept.map(d=>d.ticket_count)||[1]));
  const maxMonth= Math.max(...(data.monthly.map(m=>m.tickets_created)||[1]));

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>ETL Analytics Dashboard</h1>
          <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0' }}>
            Phase 2 — {kpis.total_tickets} tickets analysed · Last run: {kpis.last_etl_run || '—'}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div style={s.kpiGrid}>
        <div style={s.kpi('#FFF5F5')}><div style={s.kpiL}>Total tickets</div><div style={s.kpiV}>{kpis.total_tickets}</div></div>
        <div style={s.kpi('#FFF8F0')}><div style={s.kpiL}>Open</div><div style={{ ...s.kpiV, color:'#E8700A' }}>{kpis.open_tickets}</div></div>
        <div style={s.kpi('#F0FFF4')}><div style={s.kpiL}>Resolved</div><div style={{ ...s.kpiV, color:'#217346' }}>{kpis.resolved_tickets}</div></div>
        <div style={s.kpi('#FFF0F0')}><div style={s.kpiL}>Critical</div><div style={{ ...s.kpiV, color:'#C00000' }}>{kpis.critical_tickets}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <div style={s.kpi()}><div style={s.kpiL}>SLA breaches</div><div style={{ ...s.kpiV, fontSize:20 }}>{kpis.sla_breaches}</div></div>
        <div style={s.kpi()}><div style={s.kpiL}>Avg resolution</div><div style={{ ...s.kpiV, fontSize:20 }}>{kpis.avg_resolution_hours}h</div></div>
        <div style={s.kpi()}><div style={s.kpiL}>Top category</div><div style={{ fontSize:14, fontWeight:600, marginTop:4 }}>{kpis.top_category}</div></div>
        <div style={s.kpi()}><div style={s.kpiL}>Top department</div><div style={{ fontSize:14, fontWeight:600, marginTop:4 }}>{kpis.top_department}</div></div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {TABS.map((t,i)=><button key={t} style={s.tab(tab===i)} onClick={()=>setTab(i)}>{t}</button>)}
      </div>

      {/* Overview */}
      {tab===0 && (
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardT}>Priority distribution</div>
            {data.pri.map(p=>(
              <div key={p.priority} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:PRIORITY_COLORS[p.priority]||'#ccc', display:'inline-block' }}/>
                    {p.priority}
                  </span>
                  <span style={{ color:'#666' }}>{p.ticket_count} tickets — {p.resolution_rate_pct}% resolved</span>
                </div>
                <div style={s.bar}><div style={{ height:'100%', borderRadius:4, background:PRIORITY_COLORS[p.priority]||'#ccc', width:`${Math.round(p.ticket_count/kpis.total_tickets*100)}%` }}/></div>
              </div>
            ))}
          </div>
          <div style={s.card}>
            <div style={s.cardT}>Status breakdown</div>
            {data.status.map(st=>(
              <div key={st.status} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                  <span>{st.status}</span>
                  <span style={{ color:'#666' }}>{st.count} tickets</span>
                </div>
                <div style={s.bar}><div style={{ height:'100%', borderRadius:4, background:STATUS_COLORS[st.status]||'#888', width:`${Math.round(st.count/kpis.total_tickets*100)}%` }}/></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {tab===1 && (
        <div style={s.card}>
          <div style={s.cardT}>Most common issue categories</div>
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>Category</th>
              <th style={s.th}>Tickets</th>
              <th style={s.th}>Volume</th>
              <th style={s.th}>Resolution rate</th>
              <th style={s.th}>Avg resolution</th>
              <th style={s.th}>Critical</th>
            </tr></thead>
            <tbody>
              {data.cat.map(c=>(
                <tr key={c.issue_category}>
                  <td style={{ ...s.td, fontWeight:500 }}>{c.issue_category}</td>
                  <td style={s.td}><b>{c.ticket_count}</b></td>
                  <td style={{ ...s.td, width:120 }}>
                    <div style={s.bar}><div style={{ height:'100%', borderRadius:4, background:'#2E75B6', width:`${Math.round(c.ticket_count/maxCat*100)}%` }}/></div>
                  </td>
                  <td style={s.td}><span style={s.badge(c.resolution_rate_pct>=70?'#27500A':'#633806', c.resolution_rate_pct>=70?'#EAF3DE':'#FAEEDA')}>{c.resolution_rate_pct}%</span></td>
                  <td style={s.td}>{c.avg_resolution_hours ? `${Number(c.avg_resolution_hours).toFixed(1)}h` : '—'}</td>
                  <td style={s.td}>{c.critical_count > 0 ? <span style={s.badge('#791F1F','#FCEBEB')}>{c.critical_count}</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Departments */}
      {tab===2 && (
        <div style={s.card}>
          <div style={s.cardT}>Department-wise ticket counts</div>
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>Department</th>
              <th style={s.th}>Total</th>
              <th style={s.th}>Volume</th>
              <th style={s.th}>Open</th>
              <th style={s.th}>Resolved</th>
              <th style={s.th}>Resolution %</th>
              <th style={s.th}>Avg resolution</th>
            </tr></thead>
            <tbody>
              {data.dept.map(d=>(
                <tr key={d.department}>
                  <td style={{ ...s.td, fontWeight:500 }}>{d.department}</td>
                  <td style={s.td}><b>{d.ticket_count}</b></td>
                  <td style={{ ...s.td, width:120 }}>
                    <div style={s.bar}><div style={{ height:'100%', borderRadius:4, background:'#7B3FC4', width:`${Math.round(d.ticket_count/maxDept*100)}%` }}/></div>
                  </td>
                  <td style={s.td}><span style={s.badge('#633806','#FAEEDA')}>{d.open_tickets}</span></td>
                  <td style={s.td}>{d.resolved}</td>
                  <td style={s.td}><span style={s.badge(d.resolution_rate_pct>=70?'#27500A':'#633806', d.resolution_rate_pct>=70?'#EAF3DE':'#FAEEDA')}>{d.resolution_rate_pct}%</span></td>
                  <td style={s.td}>{d.avg_resolution_hours ? `${Number(d.avg_resolution_hours).toFixed(1)}h` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly Trend */}
      {tab===3 && (
        <div style={s.card}>
          <div style={s.cardT}>Monthly ticket creation & resolution trend</div>
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>Month</th>
              <th style={s.th}>Created</th>
              <th style={s.th}>Trend</th>
              <th style={s.th}>Resolved</th>
              <th style={s.th}>Critical</th>
              <th style={s.th}>Avg resolution</th>
            </tr></thead>
            <tbody>
              {data.monthly.map(m=>(
                <tr key={m.created_month}>
                  <td style={{ ...s.td, fontWeight:500 }}>{m.created_month}</td>
                  <td style={s.td}><b>{m.tickets_created}</b></td>
                  <td style={{ ...s.td, width:140 }}>
                    <div style={s.bar}><div style={{ height:'100%', borderRadius:4, background:'#2E75B6', width:`${Math.round(m.tickets_created/maxMonth*100)}%` }}/></div>
                  </td>
                  <td style={s.td}>{m.resolved}</td>
                  <td style={s.td}>{m.critical_tickets > 0 ? <span style={s.badge('#791F1F','#FCEBEB')}>{m.critical_tickets}</span> : '—'}</td>
                  <td style={s.td}>{m.avg_resolution_hours ? `${Number(m.avg_resolution_hours).toFixed(1)}h` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resolution Time */}
      {tab===4 && (
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardT}>Resolution time distribution</div>
            {data.resTime.map(r=>{
              const max = Math.max(...data.resTime.map(x=>x.count));
              return (
                <div key={r.time_bucket} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                    <span style={{ fontWeight:500 }}>{r.time_bucket}</span>
                    <span style={{ color:'#666' }}>{r.count} tickets</span>
                  </div>
                  <div style={s.bar}><div style={{ height:'100%', borderRadius:4, background:'#217346', width:`${Math.round(r.count/max*100)}%` }}/></div>
                </div>
              );
            })}
          </div>
          <div style={s.card}>
            <div style={s.cardT}>Average resolution time by priority (hours)</div>
            {data.pri.map(p=>(
              <div key={p.priority} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:PRIORITY_COLORS[p.priority]||'#ccc', display:'inline-block' }}/>
                    {p.priority}
                  </span>
                  <span style={{ fontWeight:600 }}>{p.avg_resolution_hours ? `${Number(p.avg_resolution_hours).toFixed(1)}h` : 'N/A'}</span>
                </div>
                <div style={{ fontSize:11, color:'#999' }}>SLA breach rate: {p.sla_breach_rate_pct}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ETL Status */}
      {tab===5 && data.etl && (
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardT}>ETL run summary</div>
            {[
              ["Run ID",              data.etl.etl_run_id],
              ["Completed at",        new Date(data.etl.completed_at).toLocaleString()],
              ["Total tickets",       data.etl.total_tickets],
              ["Open tickets",        data.etl.open_tickets],
              ["Resolved tickets",    data.etl.resolved_tickets],
              ["Critical tickets",    data.etl.critical_tickets],
              ["SLA breaches",        data.etl.sla_breaches],
              ["Avg resolution (hrs)",data.etl.avg_resolution_hours],
              ["Duplicates removed",  data.etl.dedup_removed],
              ["Top category",        data.etl.top_category],
              ["Top department",      data.etl.top_department],
            ].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f5f5f5', fontSize:13 }}>
                <span style={{ color:'#666' }}>{k}</span>
                <span style={{ fontWeight:500 }}>{String(v)}</span>
              </div>
            ))}
          </div>
          <div style={s.card}>
            <div style={s.cardT}>Pipeline stages</div>
            {[
              {stage:"Extract",   desc:"Read tickets_dataset.csv",     result:`220 raw records`},
              {stage:"Transform", desc:"Clean, dedup, enrich tickets",  result:`${data.etl.total_tickets} clean records`},
              {stage:"Load",      desc:"Write 8 analytics tables",      result:"data/output/ → 8 JSON + CSV"},
            ].map(({stage,desc,result})=>(
              <div key={stage} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid #f5f5f5' }}>
                <span style={{ width:70, fontSize:12, fontWeight:600, color:'#217346' }}>✅ {stage}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13 }}>{desc}</div>
                  <div style={{ fontSize:11, color:'#999', marginTop:2 }}>{result}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
