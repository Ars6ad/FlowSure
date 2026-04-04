import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const INPUT = 'w-full border border-outline-variant rounded-xl px-4 py-3 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface';
const LABEL = 'block text-sm font-bold text-on-surface-variant mb-1.5';

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
  'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Delhi',
  'Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

const AdminRegister = () => {
  const navigate = useNavigate();
  const { registerAdmin } = useAuth();
  const [form, setForm] = useState({ name: '', organization: '', region: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setError(''); setLoading(true);
    try {
      await registerAdmin(form.email, form.password, {
        name: form.name, organization: form.organization, region: form.region,
      });
      navigate('/admin');
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'Email already registered.' : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="bg-white rounded-3xl shadow-xl border border-outline-variant/20 p-10 w-full max-w-md">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl text-white">manage_accounts</span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary font-headline mb-1">Admin Registration</h1>
          <p className="text-on-surface-variant mb-8 text-sm">Create your admin account to manage your region's gig workers.</p>
          {error && (
            <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className={LABEL}>Full Name</label>
              <input type="text" required value={form.name} onChange={e => up('name', e.target.value)} placeholder="Your full name" className={INPUT} /></div>
            <div><label className={LABEL}>Organization / Company</label>
              <input type="text" required value={form.organization} onChange={e => up('organization', e.target.value)} placeholder="Insurance company / platform name" className={INPUT} /></div>
            <div><label className={LABEL}>Region You Manage (State)</label>
              <select required value={form.region} onChange={e => up('region', e.target.value)} className={INPUT}>
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <div><label className={LABEL}>Email Address</label>
              <input type="email" required value={form.email} onChange={e => up('email', e.target.value)} placeholder="admin@company.com" className={INPUT} /></div>
            <div><label className={LABEL}>Password</label>
              <input type="password" required value={form.password} onChange={e => up('password', e.target.value)} placeholder="Min. 6 characters" className={INPUT} /></div>
            <div><label className={LABEL}>Confirm Password</label>
              <input type="password" required value={form.confirmPassword} onChange={e => up('confirmPassword', e.target.value)} placeholder="••••••••" className={INPUT} /></div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 disabled:opacity-60 mt-2">
              {loading ? 'Creating account…' : 'Create Admin Account'}
            </button>
          </form>
          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already registered?{' '}
            <button onClick={() => navigate('/admin/login')} className="text-primary font-bold hover:underline">Login</button>
          </p>
        </div>
      </main>
    </div>
  );
};
export default AdminRegister;
