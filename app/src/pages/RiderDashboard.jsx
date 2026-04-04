import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { checkRainCondition, checkAirCondition } from '../services/weatherService';
import { checkEarthquakeCondition } from '../services/earthquakeService';

const RiderDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const [policy, setPolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [weather, setWeather] = useState(null);
  const [quake, setQuake] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !userProfile) return;
    const load = async () => {
      const [pSnap, cSnap] = await Promise.all([
        getDocs(query(collection(db, 'policies'), where('workerId', '==', currentUser.uid), where('status', '==', 'active'))),
        getDocs(query(collection(db, 'claims'), where('workerId', '==', currentUser.uid))),
      ]);
      if (!pSnap.empty) setPolicy({ id: pSnap.docs[0].id, ...pSnap.docs[0].data() });
      setClaims(cSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate)).slice(0, 5));
      if (userProfile.lat && userProfile.lon) {
        const [w, q, a] = await Promise.all([
          checkRainCondition(userProfile.lat, userProfile.lon),
          checkEarthquakeCondition(userProfile.lat, userProfile.lon),
          checkAirCondition(userProfile.lat, userProfile.lon),
        ]);
        setWeather(w); setQuake(q); setAqi(a);
      }
      setLoading(false);
    };
    load();
  }, [currentUser, userProfile]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const statusColor = { 
    approved: 'text-green-700 bg-green-50', 
    paid: 'text-green-700 bg-green-100', 
    pending: 'text-amber-700 bg-amber-50', 
    rejected: 'text-red-700 bg-red-50',
    rejected_ml: 'text-red-800 bg-red-100'
  };

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,35,111,0.08)]">
        <div className="flex items-center justify-between px-8 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-extrabold tracking-tight text-primary font-headline cursor-pointer" onClick={() => navigate('/')}>FlowSure</span>
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-primary font-bold border-b-2 border-primary pb-0.5 text-sm">Dashboard</span>
              <button onClick={() => navigate('/claims')} className="text-on-surface-variant text-sm font-medium hover:text-primary transition-colors">Claims</button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="text-xs bg-surface-container px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all">Admin</button>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-error transition-colors font-medium">
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-on-surface font-headline">Welcome back, {userProfile?.fullName?.split(' ')[0] || 'Worker'} 👋</h1>
            <p className="text-on-surface-variant mt-1">{userProfile?.city}, {userProfile?.state} · {userProfile?.primaryPlatform} · {userProfile?.workType}</p>
          </div>

          {!policy && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3"><span className="material-symbols-outlined text-amber-600">warning</span>
                <p className="font-medium text-amber-800">You don't have an active insurance policy yet.</p></div>
              <button onClick={() => navigate('/insurance')} className="bg-amber-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-amber-700 transition-all text-sm">Choose a Plan →</button>
            </div>
          )}

          {userProfile?.accountStatus === 'suspended' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600 text-3xl">block</span>
                <div>
                  <p className="font-bold text-red-800">Account Suspended</p>
                  <p className="text-sm text-red-700">Your manual claim access has been suspended due to persistent AI-flagged activity. Contact support to appeal.</p>
                </div>
              </div>
            </div>
          )}

          {userProfile?.accountStatus === 'flagged' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600">report_problem</span>
              <p className="text-sm text-amber-800 font-medium">Your account is under review for irregular claim patterns. Further false claims may result in suspension.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Policy Card */}
            <div className="md:col-span-8 bg-gradient-to-br from-primary to-primary-container rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">{policy?.planName || 'No Active Plan'}</span>
                  {policy && <span className="flex items-center gap-1.5 text-sm font-bold"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />Active</span>}
                </div>
                <div className="text-5xl font-black mb-2">{policy ? `₹${policy.weeklyPremium}` : '₹0'}<span className="text-lg font-normal opacity-70">/week</span></div>
                <p className="opacity-80 text-sm mb-6">{policy ? `Max payout ₹${policy.maxPayout?.toLocaleString()} · ${policy.coveragePercent}% income coverage` : 'Activate a plan to get income protection'}</p>
                {policy && <div className="flex flex-wrap gap-2">{policy.coverageTypes?.slice(0,3).map(t => <span key={t} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{t}</span>)}</div>}
              </div>
            </div>

            {/* Weather Card */}
            <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Live Weather · {weather?.city || '—'}</h3>
              {weather ? (
                <div>
                  <div className="text-5xl font-black text-primary mb-1">{weather.temperature}°<span className="text-2xl font-medium text-on-surface-variant">C</span></div>
                  <p className="text-on-surface-variant text-sm capitalize mb-4">{weather.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-surface-container-low rounded-xl p-3"><p className="text-xs text-on-surface-variant">Rainfall</p><p className="font-bold text-sm">{weather.rainfall} mm/hr</p></div>
                    <div className="bg-surface-container-low rounded-xl p-3"><p className="text-xs text-on-surface-variant">Humidity</p><p className="font-bold text-sm">{weather.humidity}%</p></div>
                  </div>
                  {weather.triggered && (
                    <div className="bg-error-container text-on-error-container text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      {weather.isFlood ? 'Flood condition detected!' : 'Heavy rain trigger active'}
                    </div>
                  )}
                </div>
              ) : <p className="text-sm text-on-surface-variant">Location not set or weather unavailable.</p>}
            </div>

            {/* Earthquake Card */}
            <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Seismic Activity (48h)</h3>
              {quake ? (
                <div>
                  {quake.triggered ? (
                    <div>
                      <div className="flex items-baseline gap-1 mb-1"><span className="text-4xl font-black text-error">M{quake.magnitude}</span><span className="text-on-surface-variant text-sm ml-1">magnitude</span></div>
                      <p className="text-xs text-on-surface-variant mb-3">{quake.place}</p>
                      <p className="text-xs text-on-surface-variant">{quake.eventCount} event{quake.eventCount > 1 ? 's' : ''} detected nearby</p>
                      <div className="mt-3 bg-error-container text-on-error-container text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">landslide</span>Seismic activity detected
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="material-symbols-outlined text-4xl text-green-600 mb-2 block">verified</span>
                      <p className="font-bold text-green-700">No significant seismic activity</p>
                      <p className="text-xs text-on-surface-variant mt-1">Monitoring 300km radius around your location</p>
                    </div>
                  )}
                </div>
              ) : <p className="text-sm text-on-surface-variant">Earthquake data unavailable.</p>}
            </div>

            {/* AQI Card */}
            <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Air Quality Index</h3>
              {aqi ? (
                <div>
                   <div className="flex items-baseline gap-1 mb-1">
                     <span className={`text-4xl font-black ${aqi.triggered ? 'text-red-600' : 'text-primary'}`}>AQI {aqi.aqi}</span>
                   </div>
                   <p className="text-sm text-on-surface-variant capitalize mb-4">{aqi.description}</p>
                   <div className="grid grid-cols-2 gap-2">
                     <div className="bg-surface-container-low rounded-xl p-3"><p className="text-xs text-on-surface-variant">PM2.5</p><p className="font-bold text-sm">{aqi.pm2_5} μg/m³</p></div>
                     <div className="bg-surface-container-low rounded-xl p-3"><p className="text-xs text-on-surface-variant">PM10</p><p className="font-bold text-sm">{aqi.pm10} μg/m³</p></div>
                   </div>
                   {aqi.triggered && (
                    <div className="mt-3 bg-red-50 text-red-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">mask</span>Unsafe air quality
                    </div>
                  )}
                </div>
              ) : <p className="text-sm text-on-surface-variant">AQI data unavailable.</p>}
            </div>

            {/* Recent Claims */}
            <div className="md:col-span-8 bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg font-headline">Recent Claims</h3>
                <button onClick={() => navigate('/claims')} className="text-primary text-sm font-bold hover:underline">View all →</button>
              </div>
              {claims.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">receipt_long</span>
                  <p className="text-on-surface-variant text-sm">No claims yet. They'll appear automatically when events are detected.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 hover:bg-surface-container-low rounded-xl transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-fixed rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm text-primary-container">{c.triggerType === 'rain' || c.triggerType === 'flood' ? 'water_drop' : c.triggerType === 'earthquake' ? 'landslide' : 'report'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold capitalize">{c.triggerType?.replace('_',' ')}</p>
                          <p className="text-xs text-on-surface-variant">{new Date(c.eventDate).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary">₹{c.amount?.toLocaleString()}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[c.status] || statusColor.pending}`}>{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default RiderDashboard;
