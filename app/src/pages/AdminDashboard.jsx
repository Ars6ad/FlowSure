import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { runClaimsCheck } from '../services/claimsEngine';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'workers', label: 'Workers', icon: 'group' },
  { id: 'claims', label: 'Claims Queue', icon: 'fact_check' },
  { id: 'fraud', label: 'Risk & Fraud', icon: 'security' },
  { id: 'simulation', label: 'Simulation', icon: 'science' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  const [workers, setWorkers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [lastCheck, setLastCheck] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const loadData = useCallback(async () => {
    if (!userProfile) return;
    const [wSnap, cSnap, pSnap] = await Promise.all([
      getDocs(query(collection(db, 'workers'), where('state', '==', userProfile.region))),
      getDocs(collection(db, 'claims')),
      getDocs(query(collection(db, 'policies'), where('status', '==', 'active'))),
    ]);
    const ws = wSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const ps = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const workerIds = new Set(ws.map(w => w.id));
    const cs = cSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(c => workerIds.has(c.workerId))
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    setWorkers(ws); setClaims(cs); setPolicies(ps);
    setLoading(false);
  }, [userProfile]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-run claims check on mount
  useEffect(() => {
    if (userProfile) {
      runClaimsCheck(userProfile.region).then(() => { setLastCheck(new Date()); loadData(); });
    }
  }, [userProfile]);

  const updateClaim = async (claimId, status, note = '') => {
    await updateDoc(doc(db, 'claims', claimId), { status, adminNotes: note, processedAt: new Date().toISOString() });
    loadData();
  };

  const sendMissedClaim = async (worker) => {
    const pol = policies.find(p => p.workerId === worker.id);
    if (!pol) return alert('Worker has no active policy.');
    await addDoc(collection(db, 'claims'), {
      workerId: worker.id, policyId: pol.id, type: 'admin_issued',
      triggerType: 'manual', triggerDescription: `Admin issued missed claim for ${worker.fullName}`,
      amount: Math.round(pol.maxPayout * 0.5), status: 'approved',
      eventDate: new Date().toISOString(), processedAt: new Date().toISOString(),
    });
    loadData();
  };

  const runSim = async () => {
    setSimulating(true);
    await new Promise(r => setTimeout(r, 2000));
    await runClaimsCheck(userProfile.region);
    await loadData();
    setLastCheck(new Date());
    setSimulating(false);
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const pending = claims.filter(c => c.status === 'pending');
  const approved = claims.filter(c => c.status === 'approved' || c.status === 'paid');
  const filtered = workers.filter(w => !search || w.fullName?.toLowerCase().includes(search.toLowerCase()) || w.city?.toLowerCase().includes(search.toLowerCase()) || w.primaryPlatform?.toLowerCase().includes(search.toLowerCase()));

  const statusColor = { approved: 'text-green-700 bg-green-50', paid: 'text-green-700 bg-green-100', pending: 'text-amber-700 bg-amber-50', rejected: 'text-red-700 bg-red-50', admin_issued: 'text-blue-700 bg-blue-50' };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-outline-variant/20 flex flex-col py-6 px-4 fixed h-full z-40 hidden md:flex">
        <div className="mb-8 px-2">
          <h2 className="text-lg font-extrabold text-primary font-headline cursor-pointer" onClick={() => navigate('/')}>GigShield</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Admin · {userProfile?.organization}</p>
          <span className="inline-block mt-2 text-xs bg-primary-fixed text-primary font-bold px-2 py-1 rounded-full">{userProfile?.region}</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left ${tab === t.id ? 'bg-primary-fixed text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>{t.label}
              {t.id === 'claims' && pending.length > 0 && <span className="ml-auto bg-error text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{pending.length}</span>}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-error transition-colors px-4 py-2 rounded-xl mt-4">
          <span className="material-symbols-outlined text-base">logout</span>Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface font-headline mb-2">Overview</h1>
            <p className="text-on-surface-variant mb-8">Region: <strong>{userProfile?.region}</strong> · {lastCheck ? `Last sync: ${lastCheck.toLocaleTimeString('en-IN')}` : 'Syncing…'}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              {[
                { label: 'Total Workers', value: workers.length, icon: 'group', color: 'bg-blue-50 text-blue-600' },
                { label: 'Active Policies', value: policies.filter(p => workers.some(w => w.id === p.workerId)).length, icon: 'verified_user', color: 'bg-green-50 text-green-600' },
                { label: 'Pending Claims', value: pending.length, icon: 'pending_actions', color: 'bg-amber-50 text-amber-600' },
                { label: 'Total Paid Out', value: `₹${approved.reduce((a, c) => a + (c.amount || 0), 0).toLocaleString()}`, icon: 'payments', color: 'bg-purple-50 text-purple-600' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><span className="material-symbols-outlined text-xl">{icon}</span></div>
                  <div className="text-3xl font-black text-on-surface mb-1">{value}</div>
                  <p className="text-xs text-on-surface-variant font-medium">{label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
              <h3 className="font-bold text-lg font-headline mb-4">Recent Activity</h3>
              {claims.slice(0,6).map(c => (
                <div key={c.id} className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
                  <div><p className="font-medium text-sm capitalize">{c.triggerType?.replace('_',' ')} · {c.type}</p>
                    <p className="text-xs text-on-surface-variant">{workers.find(w => w.id === c.workerId)?.fullName || c.workerId} · {new Date(c.eventDate).toLocaleDateString('en-IN')}</p></div>
                  <div className="text-right"><p className="font-bold text-primary">₹{c.amount?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusColor[c.status] || ''}`}>{c.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workers */}
        {tab === 'workers' && (
          <div>
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div><h1 className="text-3xl font-extrabold text-on-surface font-headline">Workers</h1>
                <p className="text-on-surface-variant">{workers.length} registered in {userProfile?.region}</p></div>
              <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, city, platform…" className="pl-10 pr-4 py-2.5 border border-outline-variant rounded-xl bg-white focus:outline-none focus:border-primary text-sm w-72" /></div>
            </div>
            <div className="space-y-3">
              {filtered.map(w => {
                const pol = policies.find(p => p.workerId === w.id);
                const wClaims = claims.filter(c => c.workerId === w.id);
                return (
                  <div key={w.id} className="bg-white rounded-2xl p-5 border border-outline-variant/20 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center"><span className="text-primary font-extrabold text-lg">{w.fullName?.[0] || '?'}</span></div>
                        <div>
                          <p className="font-bold text-on-surface">{w.fullName}</p>
                          <p className="text-sm text-on-surface-variant">{w.primaryPlatform} · {w.workType} · {w.city}</p>
                          <p className="text-xs text-on-surface-variant">{w.phone} · {w.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          {w.accountStatus && w.accountStatus !== 'active' && (
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${w.accountStatus === 'suspended' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'}`}>{w.accountStatus}</span>
                          )}
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${pol ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}`}>{pol ? pol.planName : 'No Policy'}</span>
                        </div>
                        <span className="text-xs text-on-surface-variant text-right">{wClaims.length} claim{wClaims.length !== 1 ? 's' : ''} {w.fraudCount > 0 && <span className="text-red-500 ml-1">({w.fraudCount} AI-flagged)</span>}</span>
                        <button onClick={() => sendMissedClaim(w)} className="text-xs bg-primary-fixed text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary-container hover:text-white transition-all">Send Missed Claim</button>
                      </div>
                    </div>
                    {w.aadhaarNumber && (
                      <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center gap-2 text-xs">
                        <span className="material-symbols-outlined text-sm text-amber-500">id_card</span>
                        <span className="text-on-surface-variant">Aadhaar: ****{w.aadhaarNumber.slice(-4)}</span>
                        <span className={`ml-2 font-bold px-2 py-0.5 rounded-full ${w.aadhaarVerified ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}`}>{w.aadhaarVerified ? 'Verified' : 'Pending Verification'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && <div className="text-center py-16 text-on-surface-variant">No workers found matching your search.</div>}
            </div>
          </div>
        )}

        {/* Claims Queue */}
        {tab === 'claims' && (
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface font-headline mb-2">Claims Queue</h1>
            <p className="text-on-surface-variant mb-6">{pending.length} pending · {approved.length} processed</p>
            <div className="space-y-4">
              {claims.map(c => {
                const worker = workers.find(w => w.id === c.workerId);
                return (
                  <div key={c.id} className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor[c.status] || ''}`}>{c.status}</span>
                          <span className="text-xs text-on-surface-variant capitalize">{c.type?.replace('_',' ')}</span>
                        </div>
                        <p className="font-bold">{worker?.fullName || 'Unknown Worker'} · {worker?.city}</p>
                        <p className="text-sm text-on-surface-variant capitalize">{c.triggerType?.replace('_',' ')} · {new Date(c.eventDate).toLocaleDateString('en-IN')}</p>
                        {c.triggerDescription && <p className="text-xs text-on-surface-variant mt-1">{c.triggerDescription}</p>}
                        
                        {c.mlAction && (
                          <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                             <div className="flex items-center gap-2 mb-1">
                               <span className={`w-2 h-2 rounded-full ${c.mlAction === 'approve' ? 'bg-green-500' : c.mlAction === 'reject' ? 'bg-red-500' : 'bg-amber-500'}`} />
                               <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Risk Engine Confidence: {(c.mlConfidence * 100).toFixed(1)}%</span>
                             </div>
                             <div className="grid grid-cols-4 gap-2 text-[10px]">
                               {Object.entries(c.mlMetrics || {}).map(([k, v]) => (
                                 <div key={k} className="text-slate-400 capitalize">{k}: <strong>{v.toFixed(2)}</strong></div>
                               ))}
                             </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">₹{c.amount?.toLocaleString()}</p>
                        {c.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => updateClaim(c.id, 'approved')} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-700 transition-all">Approve</button>
                            <button onClick={() => updateClaim(c.id, 'rejected', 'Rejected by admin')} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold hover:bg-red-200 transition-all">Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {claims.length === 0 && <div className="text-center py-16 text-on-surface-variant"><span className="material-symbols-outlined text-5xl block mb-3">inbox</span>No claims in this region yet.</div>}
            </div>
          </div>
        )}

        {/* Risk & Fraud */}
        {tab === 'fraud' && (
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface font-headline mb-2">Risk & Fraud Management</h1>
            <p className="text-on-surface-variant mb-6">Workers with persistent AI-flagged manual claims in <strong>{userProfile?.region}</strong>.</p>
            
            <div className="grid grid-cols-1 gap-4">
              {workers.filter(w => (w.fraudCount > 0 || w.accountStatus === 'flagged' || w.accountStatus === 'suspended')).length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-outline-variant/20">
                   <span className="material-symbols-outlined text-green-500 text-5xl mb-3">verified_user</span>
                   <p className="font-bold">No fraudulent activity detected in your region.</p>
                </div>
              ) : (
                workers.filter(w => (w.fraudCount > 0 || w.accountStatus === 'flagged' || w.accountStatus === 'suspended')).map(w => (
                  <div key={w.id} className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-lg">{w.fullName?.[0]}</div>
                      <div>
                        <p className="font-bold">{w.fullName} <span className={`text-[10px] ml-2 px-2 py-0.5 rounded-full ${w.accountStatus === 'suspended' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'}`}>{w.accountStatus || 'At Risk'}</span></p>
                        <p className="text-xs text-on-surface-variant">Persistent Fraud Count: <strong className="text-red-600">{w.fraudCount || 0}</strong></p>
                        <p className="text-[10px] text-on-surface-variant">Last Manual Rejection: {w.lastFraudDate ? new Date(w.lastFraudDate).toLocaleDateString() : 'None'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {w.accountStatus !== 'suspended' ? (
                          <button onClick={async () => {
                            await updateDoc(doc(db, 'workers', w.id), { accountStatus: 'suspended' });
                            loadData();
                          }} className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition-all">Suspend Account</button>
                       ) : (
                          <button onClick={async () => {
                             await updateDoc(doc(db, 'workers', w.id), { accountStatus: 'active', fraudCount: 0 });
                             loadData();
                          }} className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition-all">Reinstate & Clear Score</button>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Simulation */}
        {tab === 'simulation' && (
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface font-headline mb-2">Simulation Panel</h1>
            <p className="text-on-surface-variant mb-8">Trigger weather checks and test the automated claim pipeline for your region's workers.</p>
            <div className="max-w-xl bg-white rounded-2xl p-8 border border-outline-variant/20 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Run Claims Check</h3>
              <p className="text-sm text-on-surface-variant mb-6">This will call the OpenWeatherMap and USGS APIs for all active policies in your region and auto-create claims where thresholds are exceeded.</p>
              <button onClick={runSim} disabled={simulating} className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">{simulating ? 'sync' : 'science'}</span>
                {simulating ? 'Running Claims Check…' : 'Run Claims Engine Now'}
              </button>
              {lastCheck && <p className="text-xs text-center text-on-surface-variant mt-4">Last run: {lastCheck.toLocaleString('en-IN')}</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;
