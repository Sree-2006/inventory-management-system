import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PackagePlus, List, TrendingUp, LogOut, Calendar } from 'lucide-react';

export default function Sidebar({ onLogout, isOpen, setIsOpen }) {
  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/add-product", icon: PackagePlus, label: "Add Product" },
    { to: "/inventory", icon: List, label: "Inventory" },
    { to: "/sales", icon: TrendingUp, label: "Sales" },
    { to: "/sales-today", icon: Calendar, label: "Sales Today" },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden animate-in fade-in" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-300 shadow-xl md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <List className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">SmartInv</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
