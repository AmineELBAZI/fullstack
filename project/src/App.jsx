// src/App.jsx
import './global-polyfill';
import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from "./components/Layout/Sidebar";
import Navbar from "./components/Layout/Navbar";
import LoadingSpinner from './components/UI/LoadingSpinner';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useStockNotifications } from '../src/context/useStockNotifications';

const queryClient = new QueryClient();

// Lazy-loaded pages
const MonStock = lazy(() => import('./pages/seller/MonStock'));
const EnregistrerVente = lazy(() => import('./pages/seller/EnregistrerVente'));
const MesVentes = lazy(() => import('./pages/seller/MesVentes'));
const Exporter = lazy(() => import('./pages/seller/Exporter'));
const ExtractTicket = lazy(() => import('./pages/seller/ExtractTicket'));
const Categories = lazy(() => import('./pages/Categories'));
const ExporterFactures = lazy(() => import('./pages/ExporterFactures'));
const Login = lazy(() => import('./pages/Login'));
const PointsVente = lazy(() => import('./pages/PointsVente'));
const Produits = lazy(() => import('./pages/Produits'));
const Stocks = lazy(() => import('./pages/Stocks'));
const Utilisateurs = lazy(() => import('./pages/Utilisateurs'));
const Alerts = lazy(() => import('./pages/Alertes'));
const Rapports = lazy(() => import('./pages/Rapports'));
const Ventes = lazy(() => import('./pages/Ventes'));

// ConnectionStatus component to show WS status in UI
const ConnectionStatus = ({ status }) => {
  const color = {
    connected: 'text-green-600',
    connecting: 'text-yellow-600',
    disconnected: 'text-gray-500',
    error: 'text-red-600',
  }[status] || 'text-gray-500';

  return (
    <div
      className={`fixed bottom-4 right-4 p-2 rounded shadow-md bg-white border ${color} select-none text-sm font-semibold`}
      style={{ minWidth: '140px', textAlign: 'center', zIndex: 9999 }}
      title="WebSocket connection status"
    >
      WS: {status}
    </div>
  );
};

const AppRoutes = () => {
  const { isAdmin, isSeller, user, loading } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Use the WebSocket notifications hook with connection status
  const wsStatus = useStockNotifications(isAdmin());

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <>
      {/* Show WebSocket connection status */}
      {isAdmin() && <ConnectionStatus status={wsStatus} />}

      <div className="flex h-screen">
        {user && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
        <div className="flex-1 flex flex-col">
          {user && <Navbar toggleSidebar={toggleSidebar} />}
          <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <Suspense
              fallback={
                <div className="flex justify-center items-center min-h-[300px]">
                  <LoadingSpinner size="lg" />
                </div>
              }
            >
              <Routes>
                <Route path="/login" element={<Login />} />

                {isAdmin() && (
                  <>
                    <Route
                      path="/stocks"
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <Stocks />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/categories"
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <Categories />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/produits"
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <Produits />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/points-vente"
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <PointsVente />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/ventes"
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <Ventes />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/utilisateurs"
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <Utilisateurs />
                        </PrivateRoute>
                      }
                    />
                     <Route
                      path="/Alerts"
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <Alerts />
                        </PrivateRoute>
                      }
                    />
                      <Route
                      path="/Rapports"
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <Rapports />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/ExporterFactures"
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <ExporterFactures />
                        </PrivateRoute>
                      }
                    />
                  </>
                )}

                {isSeller() && (
                  <>
                    <Route
                      path="/mon-stock"
                      element={
                        <PrivateRoute roles={['VENDEUR']}>
                          <MonStock />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/enregistrer-vente"
                      element={
                        <PrivateRoute roles={['VENDEUR']}>
                          <EnregistrerVente />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/mes-ventes"
                      element={
                        <PrivateRoute roles={['VENDEUR']}>
                          <MesVentes />
                        </PrivateRoute>
                      }
                    />
                      <Route
                      path="/ExtractTicket"
                      element={
                        <PrivateRoute roles={['VENDEUR']}>
                          <ExtractTicket />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/Exporter"
                      element={
                        <PrivateRoute roles={['VENDEUR']}>
                          <Exporter />
                        </PrivateRoute>
                      }
                    />
                  </>
                )}

                <Route
                  path="/"
                  element={
                    user ? (
                      isAdmin() ? (
                        <Navigate to="/stocks" replace />
                      ) : isSeller() ? (
                        <Navigate to="/mon-stock" replace />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
