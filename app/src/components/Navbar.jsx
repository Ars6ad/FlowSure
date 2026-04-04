import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ showUser = false }) => {
  const navigate = useNavigate();
  const { currentUser, userRole, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,35,111,0.08)]">
      <div className="flex items-center justify-between px-8 py-4 max-w-[1440px] mx-auto">
        <span
          className="text-2xl font-extrabold tracking-tight text-primary font-headline cursor-pointer select-none"
          onClick={() => navigate('/')}
        >
          GigShield
        </span>
        {showUser && currentUser && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-on-surface-variant hidden sm:block">{currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-bold text-on-surface-variant hover:text-error transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
