import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import AddProductPage from './pages/AddProductPage';
import SalesPage from './pages/SalesPage';
import SalesTodayPage from './pages/SalesTodayPage';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage onLogin={handleLogin} />} />
      <Route path="/signup" element={<SignUpPage onLogin={handleLogin} />} />
      
      <Route element={<Layout isAuthenticated={isAuthenticated} onLogout={handleLogout} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/add-product" element={<AddProductPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales-today" element={<SalesTodayPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
