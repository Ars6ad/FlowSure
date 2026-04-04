import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import WorkerLogin from './pages/auth/WorkerLogin';
import WorkerRegister from './pages/auth/WorkerRegister';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';
import InsurancePlan from './pages/InsurancePlan';
import RiderDashboard from './pages/RiderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClaimsView from './pages/ClaimsView';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-surface text-on-surface antialiased font-body">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/role" element={<RoleSelection />} />
          <Route path="/worker/login" element={<WorkerLogin />} />
          <Route path="/worker/register" element={<WorkerRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/insurance" element={
            <ProtectedRoute requiredRole="worker"><InsurancePlan /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="worker"><RiderDashboard /></ProtectedRoute>
          } />
          <Route path="/claims" element={
            <ProtectedRoute requiredRole="worker"><ClaimsView /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
          } />
          {/* Legacy redirects */}
          <Route path="/onboarding" element={<Navigate to="/worker/register" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
export default App;
