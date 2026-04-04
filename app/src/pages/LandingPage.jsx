import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface selection:bg-primary-container selection:text-white min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(0,35,111,0.06)]">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold tracking-tight text-blue-900 dark:text-white font-headline">FlowSure</div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-600 dark:hover:text-blue-300 transition-colors" href="#">How it Works</a>
            <a className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-600 dark:hover:text-blue-300 transition-colors" href="#">Benefits</a>
            <a className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-600 dark:hover:text-blue-300 transition-colors" href="#">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/role')} className="hidden sm:block text-slate-600 dark:text-slate-400 font-medium hover:text-blue-600 transition-colors">Login</button>
            <button 
              onClick={() => navigate('/role')}
              className="bg-primary-container text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-8 pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest uppercase text-on-primary-fixed-variant bg-primary-fixed rounded-full">Automated Income Protection</span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-primary leading-[1.1] mb-6 tracking-tight">
                Don't Lose Income When Work Stops
              </h1>
              <p className="text-xl md:text-2xl text-on-secondary-container font-medium mb-10 max-w-xl">
                AI-powered insurance that detects disruptions and pays you instantly — no claims needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button onClick={() => navigate('/role')} className="bg-primary-container text-white px-8 py-4 rounded-full text-lg font-bold ghost-shadow hover:bg-primary transition-all active:scale-95">Get Protected</button>
                <button className="bg-surface-container-high text-on-surface px-8 py-4 rounded-full text-lg font-bold hover:bg-surface-variant transition-all active:scale-95">See How It Works</button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden ghost-shadow">
                <img alt="Gig worker monitoring app" className="w-full aspect-[4/3] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz9l_QNk1eGciSNyM5vrtF7V5sF7dGs0dqcBoOWZPkgXw8RSXx3EDQjMTASG5dXQfxIY0KfMyORzns0ixG0e7bJ_1vT-spOKMCcMdygR7MhDqC0AlkVjDPRwop1HZIlWxWod_E8mp6-kBaJhWNFIV49vRrlIgcSYORw2uma_J4bg3_-gIY7uNGUgj4wVEZmQCC0y7g82YiA0d--dGMrEKG0gu9_W9c1HBiY-e-IUyPyju4BfAdJ4zfhZuMTT9D9BnlrHW9B69DdEE"/>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-container/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary-container/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-24 bg-surface-container-low px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">When the world pauses, your bills don't.</h2>
                <p className="text-lg text-on-surface-variant font-medium">Gig platforms provide flexibility, but they don't provide a safety net for unpredictable events.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-10 rounded-2xl ghost-shadow flex flex-col justify-between aspect-square">
                <span className="material-symbols-outlined text-5xl text-error mb-8">block</span>
                <h3 className="text-2xl font-bold text-on-surface mb-2">No orders = No income</h3>
                <p className="text-on-surface-variant font-medium">App outages or demand drops shouldn't mean a zero-dollar day for your family.</p>
              </div>
              <div className="bg-surface-container-lowest p-10 rounded-2xl ghost-shadow flex flex-col justify-between aspect-square md:mt-12">
                <span className="material-symbols-outlined text-5xl text-primary-container mb-8">thunderstorm</span>
                <h3 className="text-2xl font-bold text-on-surface mb-2">Rain, floods, or shutdowns</h3>
                <p className="text-on-surface-variant font-medium">Environmental factors shouldn't be your financial risk. We cover the downtime.</p>
              </div>
              <div className="bg-surface-container-lowest p-10 rounded-2xl ghost-shadow flex flex-col justify-between aspect-square">
                <span className="material-symbols-outlined text-5xl text-on-secondary-container mb-8">shield_moon</span>
                <h3 className="text-2xl font-bold text-on-surface mb-2">Zero Coverage</h3>
                <p className="text-on-surface-variant font-medium">Traditional insurance ignores daily wage loss. FlowSure was built specifically for this gap.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
