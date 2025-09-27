// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'ADMIN') {
        navigate('/stocks');
      } else if (user.role === 'VENDEUR') {
        navigate('/mon-stock');
      }
    }
  }, [navigate]);

 const handleLogin = async () => {
  const success = await login(email, password);
  if (success) {
    localStorage.setItem('password', password); // Save password for Basic Auth usage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.role === 'ADMIN') {
      navigate('/stocks');
    } else if (user.role === 'VENDEUR') {
      navigate('/mon-stock');
    }
  } else {
    alert('Login failed. Please check your credentials.');
  }
};


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/img/logo.jpg"
            alt="Logo StockPro"
            className="h-24 w-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-800">Bienvenue sur StockPro</h1>
          <p className="text-gray-600 text-sm text-center mt-1">
            Système de gestion multi-points de vente
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Email ou nom d'utilisateur"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
