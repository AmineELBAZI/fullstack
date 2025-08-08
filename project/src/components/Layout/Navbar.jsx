import React, { useEffect, useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const updateAlertCount = () => {
      const alerts = JSON.parse(sessionStorage.getItem('websocketAlerts') || '[]');
      setAlertCount(alerts.length);
    };

    // Load on mount
    updateAlertCount();

    // Optional: Listen for storage changes from other tabs/windows
    const interval = setInterval(updateAlertCount, 2000); // Poll every 2s

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-300" />
          </button>
          <h2 className="text-lg font-semibold text-gray-100 hidden sm:block">
            Future Fragrance Tableau de bord
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/Alerts"
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors relative"
            aria-label="Voir les alertes"
          >
            <Bell className="h-5 w-5 text-gray-300" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {alertCount}
                </span>
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
