import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { getCurrentPosition, reverseGeocode } from '../../services/geocodingService';

const INPUT = 'w-full border border-outline-variant rounded-xl px-4 py-3 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface';
const LABEL = 'block text-sm font-bold text-on-surface-variant mb-1.5';
const STEPS = ['Personal Info', 'Location', 'Work Details', 'Payment', 'Review'];
const PLATFORMS = ['Swiggy','Zepto','Blinkit','Dunzo','Porter','Rapido','BigBasket','Meesho','Other'];
const WORK_TYPES = ['Food Delivery','Grocery Delivery','Dark Store Worker','Cab / Bike Taxi','Parcel Delivery','Courier','Other'];
const NOMINEE_RELATIONS = ['Spouse','Parent','Child','Sibling','Friend','Other'];
const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
  'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Delhi',
  'Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

const initForm = {
  fullName:'', dob:'', gender:'', phone:'', email:'', password:'', confirmPassword:'', aadhaarNumber:'',
  lat:null, lon:null, city:'', state:'', address:'', locationMethod:'auto',
  primaryPlatform:'', secondaryPlatform:'', workType:'', workSince:'', dailyHours:'',
  nomineeName:'', nomineeRelation:'', nomineePhone:'',
  paymentMethod:'upi', upiId:'', accountNumber:'', ifsc:'', bankName:'', accountHolderName:'',
  termsAccepted: false,
};

const WorkerRegister = () => {
  const navigate = useNavigate();
  const { registerWorker } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const detectLocation = async () => {
    setGpsLoading(true); setError('');
    try {
      const { lat, lon } = await getCurrentPosition();
      const geo = await reverseGeocode(lat, lon);
      setForm(p => ({ ...p, lat, lon, city: geo.city, state: geo.state, address: geo.displayName, locationMethod: 'auto' }));
    } catch (e) { setError(e.message || 'Could not detect location. Please enter manually.'); }
    finally { setGpsLoading(false); }
  };

  const validateStep = () => {
    setError('');
    if (step === 0) {
      if (!form.fullName || !form.dob || !form.gender || !form.phone || !form.email || !form.password) return setError('All fields are required.'), false;
      if (form.phone.replace(/\D/g,'').length < 10) return setError('Enter a valid 10-digit mobile number.'), false;
      if (form.password.length < 6) return setError('Password must be at least 6 characters.'), false;
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.'), false;
      if (form.aadhaarNumber && !/^\d{12}$/.test(form.aadhaarNumber)) return setError('Aadhaar must be exactly 12 digits.'), false;
    }
    if (step === 1) {
      if (!form.city || !form.state) return setError('Please provide your location (detected or manual).'), false;
    }
    if (step === 2) {
      if (!form.primaryPlatform || !form.workType || !form.workSince || !form.dailyHours) return setError('Fill in all required work details.'), false;
      if (!form.nomineeName || !form.nomineeRelation || !form.nomineePhone) return setError('Nominee details are required for emergency claims.'), false;
    }
    if (step === 3) {
      if (form.paymentMethod === 'upi' && !form.upiId) return setError('Enter your UPI ID.'), false;
      if (form.paymentMethod === 'bank') {
        if (!form.accountNumber || !form.ifsc || !form.bankName || !form.accountHolderName) return setError('Fill in all bank details.'), false;
      }
    }
    if (step === 4 && !form.termsAccepted) return setError('Please accept the Terms & Conditions to proceed.'), false;
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true); setError('');
    try {
      await registerWorker(form.email, form.password, {
        fullName: form.fullName, dob: form.dob, gender: form.gender,
        phone: form.phone, aadhaarNumber: form.aadhaarNumber, aadhaarVerified: false,
        lat: form.lat, lon: form.lon, city: form.city, state: form.state, address: form.address,
        primaryPlatform: form.primaryPlatform, secondaryPlatform: form.secondaryPlatform,
        workType: form.workType, workSince: form.workSince, dailyHours: Number(form.dailyHours),
        nomineeName: form.nomineeName, nomineeRelation: form.nomineeRelation, nomineePhone: form.nomineePhone,
        paymentMethod: form.paymentMethod,
        upiId: form.paymentMethod === 'upi' ? form.upiId : null,
        bankDetails: form.paymentMethod === 'bank' ? { accountNumber: form.accountNumber, ifsc: form.ifsc, bankName: form.bankName, accountHolderName: form.accountHolderName } : null,
        hasPolicy: false, region: form.state,
      });
      navigate('/insurance');
    } catch (e) {
      setError(e.code === 'auth/email-already-in-use' ? 'Email already registered. Please login.' : e.message);
    } finally { setLoading(false); }
  };

  const ProgressBar = () => (
    <div className="mb-10">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-outline-variant/30 z-0" />
        <div className="absolute top-5 left-0 h-0.5 bg-primary-container z-0 transition-all duration-500" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
        {STEPS.map((s, i) => (
          <div key={i} className="flex flex-col items-center z-10 gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${i < step ? 'bg-primary-container border-primary-container text-white' : i === step ? 'bg-white border-primary text-primary' : 'bg-white border-outline-variant/40 text-on-surface-variant/40'}`}>
              {i < step ? <span className="material-symbols-outlined text-base">check</span> : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${i === step ? 'text-primary' : 'text-on-surface-variant/50'}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-primary font-headline">Create Your Account</h1>
            <p className="text-on-surface-variant mt-2">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-outline-variant/20 p-8 md:p-10">
            <ProgressBar />
            {error && (
              <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>{error}
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-on-surface mb-4 font-headline">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className={LABEL}>Full Name *</label>
                    <input type="text" value={form.fullName} onChange={e => up('fullName', e.target.value)} placeholder="As per Aadhaar card" className={INPUT} /></div>
                  <div><label className={LABEL}>Date of Birth *</label>
                    <input type="date" value={form.dob} onChange={e => up('dob', e.target.value)} className={INPUT} /></div>
                  <div><label className={LABEL}>Gender *</label>
                    <select value={form.gender} onChange={e => up('gender', e.target.value)} className={INPUT}>
                      <option value="">Select</option>
                      {['Male','Female','Other','Prefer not to say'].map(g => <option key={g}>{g}</option>)}
                    </select></div>
                  <div><label className={LABEL}>Mobile Number *</label>
                    <div className="flex"><span className="flex items-center px-4 border border-r-0 border-outline-variant rounded-l-xl bg-surface-container text-on-surface-variant font-medium text-sm">+91</span>
                      <input type="tel" value={form.phone} onChange={e => up('phone', e.target.value)} placeholder="9876543210" maxLength={10} className={INPUT + ' rounded-l-none'} /></div></div>
                  <div><label className={LABEL}>Email Address *</label>
                    <input type="email" value={form.email} onChange={e => up('email', e.target.value)} placeholder="you@example.com" className={INPUT} /></div>
                  <div><label className={LABEL}>Password *</label>
                    <input type="password" value={form.password} onChange={e => up('password', e.target.value)} placeholder="Min. 6 characters" className={INPUT} /></div>
                  <div><label className={LABEL}>Confirm Password *</label>
                    <input type="password" value={form.confirmPassword} onChange={e => up('confirmPassword', e.target.value)} placeholder="Re-enter password" className={INPUT} /></div>
                  <div className="sm:col-span-2">
                    <label className={LABEL}>Aadhaar Number (optional — verification available later)</label>
                    <input type="text" value={form.aadhaarNumber} onChange={e => up('aadhaarNumber', e.target.value.replace(/\D/g,''))} placeholder="12-digit Aadhaar number" maxLength={12} className={INPUT} />
                    {form.aadhaarNumber && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        <span className="material-symbols-outlined text-sm">pending</span>
                        Aadhaar verification pending — you can complete this from your dashboard settings.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-on-surface mb-4 font-headline">Your Location</h2>
                <p className="text-sm text-on-surface-variant -mt-2 mb-4">Your location is used to calculate climate risk and trigger claims automatically.</p>
                <button onClick={detectLocation} disabled={gpsLoading} className="w-full flex items-center justify-center gap-3 border-2 border-primary text-primary py-4 rounded-xl font-bold hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-60">
                  <span className="material-symbols-outlined">{gpsLoading ? 'sync' : 'my_location'}</span>
                  {gpsLoading ? 'Detecting location…' : 'Auto-detect My Location'}
                </button>
                {form.address && (
                  <div className="bg-primary-fixed/40 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                    <div><p className="font-bold text-primary text-sm">Location Detected</p>
                      <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">{form.address}</p></div>
                  </div>
                )}
                <div className="flex items-center gap-3"><div className="flex-1 h-px bg-outline-variant/30" /><span className="text-xs text-on-surface-variant/60 font-medium">OR ENTER MANUALLY</span><div className="flex-1 h-px bg-outline-variant/30" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={LABEL}>State / UT *</label>
                    <select value={form.state} onChange={e => up('state', e.target.value)} className={INPUT}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                    </select></div>
                  <div><label className={LABEL}>City / Town *</label>
                    <input type="text" value={form.city} onChange={e => up('city', e.target.value)} placeholder="e.g. Bengaluru" className={INPUT} /></div>
                </div>
              </div>
            )}

            {/* Step 3: Work Details */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-on-surface mb-4 font-headline">Work Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={LABEL}>Primary Platform *</label>
                    <select value={form.primaryPlatform} onChange={e => up('primaryPlatform', e.target.value)} className={INPUT}>
                      <option value="">Select platform</option>
                      {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                    </select></div>
                  <div><label className={LABEL}>Secondary Platform</label>
                    <select value={form.secondaryPlatform} onChange={e => up('secondaryPlatform', e.target.value)} className={INPUT}>
                      <option value="">None</option>
                      {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                    </select></div>
                  <div className="sm:col-span-2"><label className={LABEL}>Type of Work *</label>
                    <select value={form.workType} onChange={e => up('workType', e.target.value)} className={INPUT}>
                      <option value="">Select work type</option>
                      {WORK_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select></div>
                  <div><label className={LABEL}>Working Since *</label>
                    <input type="date" value={form.workSince} onChange={e => up('workSince', e.target.value)} className={INPUT} /></div>
                  <div><label className={LABEL}>Avg. Daily Working Hours *</label>
                    <input type="number" min="1" max="24" value={form.dailyHours} onChange={e => up('dailyHours', e.target.value)} placeholder="e.g. 8" className={INPUT} /></div>
                </div>
                <div className="border-t border-outline-variant/30 pt-5">
                  <h3 className="font-bold text-on-surface mb-3">Nominee Details <span className="text-xs font-normal text-on-surface-variant">(for emergency claim payouts)</span></h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={LABEL}>Nominee Name *</label>
                      <input type="text" value={form.nomineeName} onChange={e => up('nomineeName', e.target.value)} placeholder="Full name" className={INPUT} /></div>
                    <div><label className={LABEL}>Relationship *</label>
                      <select value={form.nomineeRelation} onChange={e => up('nomineeRelation', e.target.value)} className={INPUT}>
                        <option value="">Select</option>
                        {NOMINEE_RELATIONS.map(r => <option key={r}>{r}</option>)}
                      </select></div>
                    <div className="sm:col-span-2"><label className={LABEL}>Nominee Mobile *</label>
                      <div className="flex"><span className="flex items-center px-4 border border-r-0 border-outline-variant rounded-l-xl bg-surface-container text-on-surface-variant font-medium text-sm">+91</span>
                        <input type="tel" value={form.nomineePhone} onChange={e => up('nomineePhone', e.target.value)} placeholder="9876543210" maxLength={10} className={INPUT + ' rounded-l-none'} /></div></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-on-surface mb-2 font-headline">Payment & Claims Account</h2>
                <p className="text-sm text-on-surface-variant mb-4">All automated claims will be deposited directly to this account. Razorpay integration coming soon — details stored securely.</p>
                <div className="flex gap-3">
                  {['upi', 'bank'].map(m => (
                    <button key={m} onClick={() => up('paymentMethod', m)} className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition-all ${form.paymentMethod === m ? 'border-primary-container bg-primary-fixed text-primary-container' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'}`}>
                      <span className="material-symbols-outlined block text-2xl mb-1 mx-auto">{m === 'upi' ? 'account_balance_wallet' : 'account_balance'}</span>
                      {m === 'upi' ? 'UPI ID' : 'Bank Account'}
                    </button>
                  ))}
                </div>
                {form.paymentMethod === 'upi' && (
                  <div><label className={LABEL}>UPI ID *</label>
                    <input type="text" value={form.upiId} onChange={e => up('upiId', e.target.value)} placeholder="yourname@upi" className={INPUT} />
                    <p className="text-xs text-on-surface-variant mt-1.5">e.g. 9876543210@paytm, name@gpay</p></div>
                )}
                {form.paymentMethod === 'bank' && (
                  <div className="space-y-4">
                    <div><label className={LABEL}>Account Holder Name *</label>
                      <input type="text" value={form.accountHolderName} onChange={e => up('accountHolderName', e.target.value)} placeholder="As per bank records" className={INPUT} /></div>
                    <div><label className={LABEL}>Account Number *</label>
                      <input type="text" value={form.accountNumber} onChange={e => up('accountNumber', e.target.value.replace(/\D/g,''))} placeholder="Bank account number" className={INPUT} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={LABEL}>IFSC Code *</label>
                        <input type="text" value={form.ifsc} onChange={e => up('ifsc', e.target.value.toUpperCase())} placeholder="SBIN0001234" maxLength={11} className={INPUT} /></div>
                      <div><label className={LABEL}>Bank Name *</label>
                        <input type="text" value={form.bankName} onChange={e => up('bankName', e.target.value)} placeholder="e.g. SBI" className={INPUT} /></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-on-surface mb-4 font-headline">Review Your Details</h2>
                {[
                  { title: 'Personal', icon: 'person', rows: [['Name', form.fullName], ['Date of Birth', form.dob], ['Gender', form.gender], ['Phone', '+91 ' + form.phone], ['Email', form.email], ['Aadhaar', form.aadhaarNumber ? `****${form.aadhaarNumber.slice(-4)} (Pending Verification)` : 'Not provided']] },
                  { title: 'Location', icon: 'location_on', rows: [['City', form.city], ['State', form.state]] },
                  { title: 'Work', icon: 'work', rows: [['Platform', form.primaryPlatform], ['Work Type', form.workType], ['Working Since', form.workSince], ['Daily Hours', form.dailyHours + ' hrs'], ['Nominee', `${form.nomineeName} (${form.nomineeRelation})`]] },
                  { title: 'Payment', icon: 'payments', rows: form.paymentMethod === 'upi' ? [['Method', 'UPI'], ['UPI ID', form.upiId]] : [['Method', 'Bank Account'], ['Bank', form.bankName], ['IFSC', form.ifsc], ['Account', '****' + form.accountNumber.slice(-4)]] },
                ].map(({ title, icon, rows }) => (
                  <div key={title} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20">
                    <div className="flex items-center gap-2 mb-3"><span className="material-symbols-outlined text-primary text-sm">{icon}</span>
                      <h3 className="font-bold text-sm text-primary uppercase tracking-wider">{title}</h3></div>
                    <div className="space-y-2">{rows.map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span className="text-sm text-on-surface-variant">{k}</span>
                        <span className="text-sm font-medium text-on-surface text-right max-w-xs">{v || '—'}</span></div>
                    ))}</div>
                  </div>
                ))}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.termsAccepted} onChange={e => up('termsAccepted', e.target.checked)} className="mt-1 w-4 h-4 accent-primary rounded" />
                  <span className="text-sm text-on-surface-variant">I agree to GigShield's <span className="text-primary font-bold">Terms of Service</span> and <span className="text-primary font-bold">Privacy Policy</span>. I confirm all information provided is accurate.</span>
                </label>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-outline-variant/20">
              <button onClick={prev} disabled={step === 0} className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-outline-variant font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-30">
                <span className="material-symbols-outlined text-base">arrow_back</span> Back
              </button>
              {step < 4
                ? <button onClick={next} className="flex items-center gap-2 bg-primary-container text-white px-8 py-3 rounded-xl font-bold hover:bg-primary transition-all active:scale-95">
                    Continue <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                : <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-primary-container text-white px-8 py-3 rounded-xl font-bold hover:bg-primary transition-all active:scale-95 disabled:opacity-60">
                    {loading ? 'Creating account…' : 'Create Account'} <span className="material-symbols-outlined text-base">{loading ? 'sync' : 'check_circle'}</span>
                  </button>
              }
            </div>
          </div>
          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <button onClick={() => navigate('/worker/login')} className="text-primary font-bold hover:underline">Sign in</button>
          </p>
        </div>
      </main>
    </div>
  );
};
export default WorkerRegister;
