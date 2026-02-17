import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardProvider } from './context/DashboardContext';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const MasterData = lazy(() => import('./pages/MasterData'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const RecentInventory = lazy(() => import('./pages/RecentInventory'));
const BarcodeMapping = lazy(() => import('./pages/BarcodeMapping'));
const InventoryList = lazy(() => import('./pages/InventoryList'));
const Locations = lazy(() => import('./pages/Locations'));
const OfflineInventory = lazy(() => import('./pages/OfflineInventory'));
const OnlineInventory = lazy(() => import('./pages/OnlineInventory'));
const MobileUI = lazy(() => import('./pages/MobileUI'));
const BarcodeMappingMobile = lazy(() => import('./pages/BarcodeMappingMobile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const MobileLogin = lazy(() => import('./pages/MobileLogin'));
const MobileSignup = lazy(() => import('./pages/MobileSignup'));
const MobileSettings = lazy(() => import('./pages/MobileSettings'));

const Loading = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 border-neutral-800">
    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-neutral-400 font-medium">Fast loading...</p>
  </div>
);

function App() {
  return (
    <DashboardProvider>
      <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/mobile-login" element={<MobileLogin />} />
            <Route path="/mobile-signup" element={<MobileSignup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="master-data" element={<MasterData />} />
                <Route path="recent-inventory" element={<RecentInventory />} />
                <Route path="barcode-mapping" element={<BarcodeMapping />} />
                <Route path="inventory-list" element={<InventoryList />} />
                <Route path="locations" element={<Locations />} />
                <Route path="offline-inventory" element={<OfflineInventory />} />
                <Route path="online-inventory" element={<OnlineInventory />} />
                <Route path="mobile-ui" element={<MobileUI />} />
                <Route path="barcode-mapping-mobile" element={<BarcodeMappingMobile />} />
                <Route path="mobile-settings" element={<MobileSettings />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </DashboardProvider>
  );
}

export default App;
