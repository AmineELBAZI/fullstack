import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Package,
  Archive,
  ShoppingCart,
  History,
  LogOut,
  X,
  Users,
  User,
  Store,
  Tags,
  AlertCircle,
  BarChart3,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { startTransition } from 'react';
import PointsVenteApi from '../../API/PointsVenteApi';


const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isAdmin, isSeller } = useAuth();
  const [boutiqueName, setBoutiqueName] = useState(null);

  // Fetch boutique name if user is seller and has boutiqueId
  useEffect(() => {
    if (isSeller() && user?.boutiqueId) {
      PointsVenteApi
        .getPointVenteById(user.boutiqueId)
        .then(res => setBoutiqueName(res.data?.nom || 'Nom introuvable'))
        .catch(() => setBoutiqueName('Erreur lors du chargement'));
    }
  }, [user, isSeller]);

  const adminMenuItems = [
    { icon: Archive, label: 'Stocks', path: '/stocks' },
    { icon: Tags, label: 'Catégories', path: '/categories' },
    { icon: Package, label: 'Produits', path: '/produits' },
    { icon: Store, label: 'Points de vente', path: '/points-vente' },
    { icon: ShoppingCart, label: 'Ventes', path: '/ventes' },
    { icon: Users, label: 'Utilisateurs', path: '/utilisateurs' },
    { icon: AlertCircle, label: 'Alert list', path: '/Alerts' },
    { icon: BarChart3, label: 'Rapports', path: '/Rapports' },
    { icon: Download, label: 'Exporter des Factures', path: '/ExporterFactures' },
  ];

  const sellerMenuItems = [
    { icon: Archive, label: 'Mon Stock', path: '/mon-stock' },
    { icon: ShoppingCart, label: 'Enregistrer Vente', path: '/enregistrer-vente' },
    { icon: History, label: 'Mes Ventes', path: '/mes-ventes' },
    { icon: Download, label: 'Extract Ticket', path: '/ExtractTicket' },
    { icon: Download, label: 'Exporter', path: '/Exporter' },
  ];

  const menuItems = isAdmin() ? adminMenuItems : sellerMenuItems;
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full bg-white text-gray-700 shadow-xl z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-300
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-white">
            <div className="flex items-center space-x-3">
              <img src="/img/logo.jpg" alt="Logo StockPro" className="h-25 w-auto" />
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-gray-300 flex items-center space-x-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${isAdmin() ? 'bg-blue-700' : 'bg-green-700'
                }`}
            >
              <span className="font-semibold text-white">{userInitial}</span>
            </div>
            <div>
              <p className="flex items-center space-x-2 font-medium text-gray-700">
                <User className="w-5 h-5 text-lime-800" />
                <span>{user?.email || 'Utilisateur'}</span>
              </p>

              {isSeller() && (
                <p className="flex items-center space-x-2 text-xs text-gray-700 font-medium mt-1">
                  <Store className="w-5 h-5 text-sky-700" />
                  <span>{boutiqueName ?? 'Chargement...'}</span>
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map(({ icon: Icon, label, path }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        startTransition(() => {
                          toggleSidebar();
                        });
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                      ${isActive
                        ? isAdmin()
                          ? 'bg-blue-800 text-blue-100 border-r-4 border-blue-500'
                          : 'bg-green-800 text-green-300 border-r-4 border-green-500'
                        : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-6 border-t border-gray-300">
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/';
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
