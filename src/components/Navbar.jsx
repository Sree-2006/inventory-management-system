import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, LogOut, AlertTriangle } from 'lucide-react';

export default function Navbar({ onLogout, toggleSidebar }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchInventory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;
      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'x-user-email': user.email }
      });
      if (response.ok) {
        const data = await response.json();
        setLowStockItems(data.filter(item => item.quantity < 10)); // Request uses < 10 threshold
      }
    } catch (error) {
      console.error('Navbar error fetching inventory:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
    window.addEventListener('inventoryUpdated', fetchInventory);
    
    // Close dropdowns on click outside
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('inventoryUpdated', fetchInventory);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex items-center gap-4 relative">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className={`p-2 rounded-full transition-colors relative ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Bell className="w-5 h-5" />
            {lowStockItems.length > 0 && (
              <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          
          {isNotifOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="font-bold text-slate-800">Alerts</span>
                <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{lowStockItems.length}</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {lowStockItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No new alerts. Your inventory is healthy!</div>
                ) : (
                  lowStockItems.map(item => (
                    <div key={item.id} className="px-5 py-3 border-b border-slate-50 hover:bg-slate-50 flex items-start gap-3 transition-colors cursor-default">
                      <div className="p-2 bg-red-50 text-red-600 rounded-lg flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{item.name}</p>
                        <p className="text-xs text-red-600 font-medium mt-1">Low stock warning: only {item.quantity} left</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-slate-200"></div>
        
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border-2 border-transparent hover:border-blue-200 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <span className="hidden sm:block text-sm font-semibold text-slate-700">{user.name || 'User'}</span>
          </button>
          
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 mb-1">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
