import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNavigation from './components/BottomNavigation';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import LowStockPage from './pages/LowStockPage';
import AddEditProductPage from './pages/AddEditProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import './index.css';

function AppShell({ children, showNav = true }) {
  return (
    <div className="app-shell">
      <div className="page-content">{children}</div>
      {showNav && <BottomNavigation />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public pages — no nav */}
            <Route path="/" element={
              <AppShell showNav={false}><WelcomePage /></AppShell>
            } />
            <Route path="/login" element={
              <AppShell showNav={false}><LoginPage /></AppShell>
            } />
            <Route path="/signup" element={
              <AppShell showNav={false}><SignupPage /></AppShell>
            } />

            {/* Protected pages — require login, with nav */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppShell><DashboardPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <AppShell><InventoryPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/voice" element={
              <ProtectedRoute>
                <AppShell><VoiceAssistantPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <AppShell><TransactionHistoryPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <ProtectedRoute>
                <AppShell><LowStockPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/add-product" element={
              <ProtectedRoute>
                <AppShell><AddEditProductPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/edit-product/:id" element={
              <ProtectedRoute>
                <AppShell><AddEditProductPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/product/:id" element={
              <ProtectedRoute>
                <AppShell><ProductDetailPage /></AppShell>
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
