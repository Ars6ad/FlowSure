import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #00236f 0%, #1e3a8a 60%, #0f2d6e 100%)' }}>
      <header className="px-8 py-6">
        <span className="text-2xl font-extrabold text-white font-headline cursor-pointer" onClick={() => navigate('/')}>GigShield</span>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-6">
              <span className="material-symbols-outlined text-blue-300 text-sm">verified_user</span>
              <span className="text-blue-200 text-sm font-semibold">Secure Login Portal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white font-headline mb-4">Welcome to GigShield</h1>
            <p className="text-blue-200 text-lg">Choose how you'd like to continue</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gig Worker */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-white hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-400/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl text-blue-200">delivery_dining</span>
              </div>
              <h2 className="text-2xl font-extrabold mb-2 font-headline">Gig Worker</h2>
              <p className="text-blue-200 text-sm mb-8 leading-relaxed">Get automatic income protection against weather disruptions, platform outages, and natural calamities. No claim forms needed.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/worker/login')} className="w-full bg-white text-primary py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-all active:scale-95">Login</button>
                <button onClick={() => navigate('/worker/register')} className="w-full border-2 border-white/40 text-white py-3.5 rounded-xl font-bold hover:border-white hover:bg-white/10 transition-all active:scale-95">Create Account</button>
              </div>
            </div>
            {/* Admin */}
            <div className="bg-white rounded-3xl p-10 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl text-primary-container">admin_panel_settings</span>
              </div>
              <h2 className="text-2xl font-extrabold mb-2 font-headline text-primary">Admin / Insurer</h2>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">Monitor gig workers in your region, manage the claims queue, verify payouts, and run disruption simulations.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/admin/login')} className="w-full bg-primary-container text-white py-3.5 rounded-xl font-bold hover:bg-primary transition-all active:scale-95">Admin Login</button>
                <button onClick={() => navigate('/admin/register')} className="w-full border-2 border-outline-variant text-on-surface-variant py-3.5 rounded-xl font-bold hover:border-primary hover:text-primary transition-all active:scale-95">Register as Admin</button>
              </div>
            </div>
          </div>
          <p className="text-center text-blue-300/60 mt-10 text-sm">By continuing, you agree to GigShield's Terms of Service and Privacy Policy.</p>
        </div>
      </main>
    </div>
  );
};
export default RoleSelection;
