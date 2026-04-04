import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Link Default Platform</h2>
            <p className="text-slate-500 mb-6 font-medium">Select your primary gig platform and Dark Store.</p>
            
            <div className="space-y-4 mb-8">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Platform</span>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-slate-50">
                  <option>Zepto</option>
                  <option>Blinkit</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Assigned Dark Store</span>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-slate-50">
                  <option>Bengaluru - HSR Layout Sect 2</option>
                  <option>Bengaluru - Indiranagar</option>
                </select>
              </label>
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-primary-container text-white py-3 rounded-xl font-bold">Calculate Risk Score</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Dark Store Risk Score</h2>
            <p className="text-slate-500 mb-6 font-medium">Based on 5-year historical data for HSR Layout.</p>
            
            <div className="p-6 bg-slate-50 border rounded-xl flex items-center justify-between mb-8">
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase">Computed DSRS</p>
                   <p className="text-4xl font-black text-amber-600">72</p>
                </div>
                <div className="text-right">
                   <p className="font-bold text-amber-600 border border-amber-600 px-3 py-1 rounded-full text-xs">High Risk Zone</p>
                </div>
            </div>

            <p className="text-xs text-slate-500 mb-6">Your weekly premium is calculated dynamically based on this Dark Store's exposure to floods and heatwaves.</p>
            <button onClick={() => navigate('/dashboard')} className="w-full bg-primary-container text-white py-3 rounded-xl font-bold">Accept & Pay Premium (₹119/week)</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
