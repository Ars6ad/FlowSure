import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const INPUT = 'w-full border border-outline-variant rounded-xl px-4 py-3 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface';
const LABEL = 'block text-sm font-bold text-on-surface-variant mb-1.5';

const WorkerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password.' : err.code === 'auth/user-not-found'
        ? 'No account found with this email.' : 'Login failed. Please try again.';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="bg-white rounded-3xl shadow-xl border border-outline-variant/20 p-10 w-full max-w-md">
          <div className="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl text-primary-container">delivery_dining</span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary font-headline mb-1">Worker Login</h1>
          <p className="text-on-surface-variant mb-8 text-sm">Welcome back. Sign in to view your dashboard.</p>
          {error && (
            <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={LABEL}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={INPUT} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary-container text-white py-3.5 rounded-xl font-bold hover:bg-primary transition-all active:scale-95 disabled:opacity-60 mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-outline-variant/30 text-center space-y-2">
            <p className="text-sm text-on-surface-variant">New to FlowSure?{' '}
              <button onClick={() => navigate('/worker/register')} className="text-primary font-bold hover:underline">Create account</button>
            </p>
            <p className="text-sm text-on-surface-variant">
              <button onClick={() => navigate('/role')} className="text-on-surface-variant/60 hover:text-primary transition-colors">← Back to role selection</button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
export default WorkerLogin;
