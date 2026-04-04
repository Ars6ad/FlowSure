import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { calculateRiskScore, getInsurancePlans } from '../services/riskModel';

const InsurancePlan = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [plans, setPlans] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [existingPolicy, setExistingPolicy] = useState(null);

  useEffect(() => {
    if (!userProfile) return;
    // Check existing policy
    const checkPolicy = async () => {
      const snap = await getDocs(query(collection(db, 'policies'), where('workerId', '==', currentUser.uid), where('status', '==', 'active')));
      if (!snap.empty) { setExistingPolicy({ id: snap.docs[0].id, ...snap.docs[0].data() }); return; }
    };
    checkPolicy();
    const risk = calculateRiskScore(userProfile.state || '', userProfile.city || '');
    setRiskData(risk);
    const p = getInsurancePlans(risk.score);
    setPlans(p);
    setSelected(p.find(pl => pl.recommended)?.id || 'standard');
  }, [userProfile, currentUser]);

  const handlePay = async () => {
    if (!selected || !riskData) return;
    setPaying(true);
    await new Promise(r => setTimeout(r, 2000)); // Simulated payment
    const plan = plans.find(p => p.id === selected);
    try {
      const policyRef = await addDoc(collection(db, 'policies'), {
        workerId: currentUser.uid, planId: plan.id, planName: plan.name,
        riskScore: riskData.score, riskLevel: riskData.riskLevel,
        weeklyPremium: plan.weeklyPremium, maxPayout: plan.maxPayout,
        coveragePercent: plan.coveragePercent, coverageTypes: plan.coverageTypes,
        triggerThresholds: plan.triggerThresholds,
        lat: userProfile.lat, lon: userProfile.lon,
        city: userProfile.city, state: userProfile.state,
        region: userProfile.state, // Regional area for admin-level filtering
        status: 'active', startDate: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'workers', currentUser.uid), { hasPolicy: true, policyId: policyRef.id });
      await refreshProfile(currentUser.uid);
      setPaid(true);
    } catch (e) { console.error(e); }
    finally { setPaying(false); }
  };

  if (existingPolicy) return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar showUser />
      <main className="flex-1 flex items-center justify-center px-6 pt-24">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <span className="material-symbols-outlined text-6xl text-primary-container mb-4 block">verified_user</span>
          <h2 className="text-2xl font-extrabold text-primary font-headline mb-2">Active Policy Found</h2>
          <p className="text-on-surface-variant mb-2">You already have an active <span className="font-bold text-primary">{existingPolicy.planName}</span>.</p>
          <p className="text-on-surface-variant text-sm mb-8">Weekly Premium: <span className="font-bold">₹{existingPolicy.weeklyPremium}</span> · Max Payout: <span className="font-bold">₹{existingPolicy.maxPayout}</span></p>
          <button onClick={() => navigate('/dashboard')} className="w-full bg-primary-container text-white py-3.5 rounded-xl font-bold hover:bg-primary transition-all">Go to Dashboard</button>
        </div>
      </main>
    </div>
  );

  if (paid) return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar showUser />
      <main className="flex-1 flex items-center justify-center px-6 pt-24">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
          </div>
          <h2 className="text-2xl font-extrabold text-primary font-headline mb-2">You're Protected!</h2>
          <p className="text-on-surface-variant mb-8">Your <span className="font-bold">{plans.find(p => p.id === selected)?.name}</span> policy is now active. Claims will be processed automatically.</p>
          <button onClick={() => navigate('/dashboard')} className="w-full bg-primary-container text-white py-3.5 rounded-xl font-bold hover:bg-primary transition-all active:scale-95">
            Go to My Dashboard <span className="material-symbols-outlined text-base align-middle ml-1">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  );

  const riskColor = riskData?.riskLevel === 'HIGH' ? 'text-red-600 bg-red-50' : riskData?.riskLevel === 'MEDIUM' ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50';

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar showUser />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-primary font-headline mb-3">Choose Your Shield</h1>
            <p className="text-on-surface-variant">Plans tailored to your location's risk profile</p>
            {riskData && (
              <div className="inline-flex items-center gap-3 mt-4 bg-white border border-outline-variant/30 rounded-2xl px-6 py-3 shadow-sm">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <span className="text-sm font-medium">{userProfile?.city}, {userProfile?.state}</span>
                <span className="w-px h-5 bg-outline-variant/40" />
                <span className="text-sm font-medium">Risk Score: <strong>{riskData.score}/100</strong></span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${riskColor}`}>{riskData.riskLevel} RISK</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {plans.map(plan => (
              <div key={plan.id} onClick={() => setSelected(plan.id)}
                className={`relative bg-white rounded-3xl p-8 border-2 cursor-pointer transition-all duration-300 hover:shadow-xl ${selected === plan.id ? 'border-primary-container shadow-xl scale-[1.02]' : 'border-outline-variant/30 hover:border-primary/30'}`}>
                {plan.recommended && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-container text-white text-xs font-bold px-4 py-1.5 rounded-full">Recommended for You</div>}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${plan.id === 'basic' ? 'bg-blue-100' : plan.id === 'standard' ? 'bg-indigo-100' : 'bg-purple-100'}`}>
                  <span className={`material-symbols-outlined text-2xl ${plan.id === 'basic' ? 'text-blue-600' : plan.id === 'standard' ? 'text-indigo-600' : 'text-purple-600'}`}>shield</span>
                </div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{plan.tagline}</p>
                <h3 className="text-xl font-extrabold text-primary font-headline mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-primary">₹{plan.weeklyPremium}</span>
                  <span className="text-on-surface-variant text-sm">/week</span>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-sm text-primary">payments</span><span className="font-bold">Max Payout:</span> ₹{plan.maxPayout.toLocaleString()}</div>
                  <div className="flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-sm text-green-600">bolt</span><span className="font-bold">Processing:</span> {plan.processingTime}</div>
                  <div className="flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-sm text-primary">verified</span><span className="font-bold">Coverage:</span> {plan.coveragePercent}% of loss</div>
                </div>
                <div className="border-t border-outline-variant/30 pt-4 space-y-2">
                  {plan.coverageTypes.map(t => (
                    <div key={t} className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs text-primary-container">check_circle</span>{t}
                    </div>
                  ))}
                </div>
                {selected === plan.id && <div className="mt-4 flex items-center gap-2 text-primary font-bold text-sm"><span className="material-symbols-outlined text-base">radio_button_checked</span>Selected</div>}
              </div>
            ))}
          </div>

          {selected && (
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-outline-variant/20 p-8">
              <h3 className="font-extrabold text-xl text-primary font-headline mb-2">Order Summary</h3>
              {(() => { const p = plans.find(pl => pl.id === selected); return p ? (
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-on-surface-variant">Plan</span><span className="font-bold">{p.name}</span></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">Weekly Premium</span><span className="font-bold text-primary">₹{p.weeklyPremium}</span></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">Max Claim Payout</span><span className="font-bold">₹{p.maxPayout.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">Payment to</span><span className="font-bold text-sm">{userProfile?.paymentMethod === 'upi' ? userProfile?.upiId : `${userProfile?.bankDetails?.bankName} ****${userProfile?.bankDetails?.accountNumber?.slice(-4)}`}</span></div>
                  <div className="border-t border-outline-variant/30 pt-3 flex justify-between text-lg"><span className="font-bold">Due Today</span><span className="font-black text-primary">₹{p.weeklyPremium}</span></div>
                  <button onClick={handlePay} disabled={paying} className="w-full bg-primary-container text-white py-4 rounded-xl font-bold hover:bg-primary transition-all active:scale-95 disabled:opacity-60 mt-2 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base">{paying ? 'sync' : 'lock'}</span>
                    {paying ? 'Processing Payment…' : `Pay ₹${p.weeklyPremium} & Activate`}
                  </button>
                  <p className="text-xs text-center text-on-surface-variant">Secured payment · Auto-renewal every week · Cancel anytime</p>
                </div>
              ) : null; })()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default InsurancePlan;
