import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { checkRainCondition } from '../services/weatherService';
import { checkEarthquakeCondition } from '../services/earthquakeService';

const ClaimsView = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [manualDesc, setManualDesc] = useState('');
  const [manualType, setManualType] = useState('platform_outage');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      const pSnap = await getDocs(query(collection(db, 'policies'), where('workerId', '==', currentUser.uid), where('status', '==', 'active')));
      if (!pSnap.empty) setPolicy({ id: pSnap.docs[0].id, ...pSnap.docs[0].data() });
      const cSnap = await getDocs(query(collection(db, 'claims'), where('workerId', '==', currentUser.uid)));
      setClaims(cSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate)));
      setLoading(false);
    };
    load();
  }, [currentUser, submitted]);

  const handleManualClaim = async () => {
    if (!manualDesc.trim() || !policy) return;
    setSubmitting(true);
    await addDoc(collection(db, 'claims'), {
      workerId: currentUser.uid, policyId: policy.id,
      type: 'manual', triggerType: manualType,
      triggerDescription: manualDesc,
      amount: Math.round(policy.maxPayout * 0.5),
      status: 'pending', eventDate: new Date().toISOString(),
    });
    setSubmitting(false); setShowForm(false); setManualDesc(''); setSubmitted(s => !s);
  };

  const statusConfig = {
    approved: { label: 'Approved', color: 'text-green-700 bg-green-50', icon: 'check_circle' },
    paid: { label: 'Paid', color: 'text-green-700 bg-green-100', icon: 'payments' },
    pending: { label: 'Pending Review', color: 'text-amber-700 bg-amber-50', icon: 'pending' },
    rejected: { label: 'Rejected', color: 'text-red-700 bg-red-50', icon: 'cancel' },
  };

  const triggerIcon = { rain: 'water_drop', flood: 'waves', earthquake: 'landslide', manual: 'report', platform_outage: 'cloud_off', cyclone: 'cyclone', heatwave: 'thermostat' };

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,35,111,0.08)]">
        <div className="flex items-center justify-between px-8 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="text-xl font-extrabold text-primary font-headline cursor-pointer" onClick={() => navigate('/')}>GigShield</span>
          </div>
          <span className="text-sm font-medium text-on-surface-variant hidden sm:block">{userProfile?.fullName}</span>
        </div>
      </header>

      <main className="pt-24 pb-16 px-6 max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-primary font-headline">Claims History</h1>
            <p className="text-on-surface-variant mt-1">All automatic and manual claims for your active policy</p>
          </div>
          {policy && (
            <button onClick={() => setShowForm(s => !s)} className="flex items-center gap-2 bg-primary-container text-white px-5 py-2.5 rounded-full font-bold hover:bg-primary transition-all active:scale-95">
              <span className="material-symbols-outlined text-base">add_circle</span> Request Manual Claim
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 mb-8 shadow-sm">
            <h3 className="font-bold text-lg text-primary mb-4">Manual Claim Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1.5">Incident Type</label>
                <select value={manualType} onChange={e => setManualType(e.target.value)} className="w-full border border-outline-variant rounded-xl px-4 py-3 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  {[['platform_outage','Platform Outage'],['rain','Heavy Rain'],['flood','Flood'],['earthquake','Earthquake'],['cyclone','Cyclone / Storm'],['heatwave','Heatwave'],['other','Other']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1.5">Describe the Incident *</label>
                <textarea value={manualDesc} onChange={e => setManualDesc(e.target.value)} rows={3} placeholder="Briefly describe what happened and how it affected your work…" className="w-full border border-outline-variant rounded-xl px-4 py-3 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleManualClaim} disabled={submitting || !manualDesc.trim()} className="bg-primary-container text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary transition-all active:scale-95 disabled:opacity-60">
                  {submitting ? 'Submitting…' : 'Submit Claim'}
                </button>
                <button onClick={() => setShowForm(false)} className="border border-outline-variant px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:border-primary transition-all">Cancel</button>
              </div>
              <p className="text-xs text-on-surface-variant">Manual claims are reviewed by an admin. Auto-triggered claims are paid instantly.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-container border-t-transparent rounded-full animate-spin" /></div>
        ) : claims.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">receipt_long</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No Claims Yet</h3>
            <p className="text-on-surface-variant">Claims will appear here automatically when weather or seismic events are detected in your area.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map(claim => {
              const st = statusConfig[claim.status] || statusConfig.pending;
              return (
                <div key={claim.id} className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${claim.type === 'auto' ? 'bg-primary-fixed' : 'bg-secondary-container'}`}>
                        <span className="material-symbols-outlined text-sm text-primary-container">{triggerIcon[claim.triggerType] || 'report'}</span>
                      </div>
                      <div>
                        <p className="font-bold capitalize">{claim.triggerType?.replace('_',' ')} {claim.type === 'auto' ? '(Auto-triggered)' : '(Manual Request)'}</p>
                        <p className="text-xs text-on-surface-variant">{new Date(claim.eventDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${st.color}`}>
                      <span className="material-symbols-outlined text-xs">{st.icon}</span>{st.label}
                    </span>
                  </div>
                  {claim.triggerDescription && <p className="text-sm text-on-surface-variant mt-3 border-t border-outline-variant/20 pt-3">{claim.triggerDescription}</p>}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/20">
                    <span className="text-xs text-on-surface-variant">Claim Amount</span>
                    <span className="text-2xl font-black text-primary">₹{claim.amount?.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
export default ClaimsView;
